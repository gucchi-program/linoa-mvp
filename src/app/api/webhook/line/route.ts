import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage } from "@/lib/line";
import { supabase } from "@/lib/supabase";
import {
  getStoreByLineUserId,
  getActiveSession,
  upsertDailyReport,
  saveExtractedContexts,
  saveConversation,
  getOwnerByLineUserId,
  createDashboardToken,
} from "@/lib/db";
import { processOnboardingInput, getOnboardingQuestion } from "@/lib/onboarding";
import {
  isReportTrigger,
  isCancelWord,
  startReportSession,
  processReportInput,
  cancelReportSession,
} from "@/lib/report-session";
import { analyzeMemo } from "@/lib/claude";
import { getWeather } from "@/lib/weather";
import type { LineWebhookBody, LineWebhookEvent, ReportSession } from "@/types";

// 「レポート」「レポート見せて」等のトリガー判定
function isReportViewTrigger(message: string): boolean {
  const triggers = ["レポート", "れぽーと", "レポ", "売上確認", "ダッシュボード"];
  return triggers.some((t) => message.includes(t));
}

// Next.js App Router の Route Handler
// LINE Platformからの Webhook を受け取るエンドポイント
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを生テキストで取得（署名検証に必要）
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // HMAC-SHA256 による署名検証
    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    const webhookBody: LineWebhookBody = JSON.parse(body);

    // 各イベントを並列処理
    await Promise.all(
      webhookBody.events.map((event) => handleEvent(event))
    );

    // LINE Platformには常に200を返す
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}

// ============================================
// イベントハンドラ
// ============================================
async function handleEvent(event: LineWebhookEvent): Promise<void> {
  switch (event.type) {
    case "follow":
      await handleFollow(event);
      break;
    case "message":
      await handleMessage(event);
      break;
    default:
      // unfollow, postback等は現時点では無視
      break;
  }
}

// ============================================
// 友だち追加（follow）イベント
// storesテーブルにレコード作成 + ウェルカムメッセージ送信
// ============================================
async function handleFollow(event: LineWebhookEvent): Promise<void> {
  const lineUserId = event.source.userId;

  // 既存チェック（ブロック→再追加のケース）
  const existing = await getStoreByLineUserId(lineUserId);

  if (!existing) {
    // 新規店舗レコード作成（onboarding_step='store_name'がデフォルト）
    const { error } = await supabase.from("stores").insert({
      line_user_id: lineUserId,
    });

    if (error) {
      console.error("Failed to create store:", error);
    }

    // ウェルカムメッセージ + 最初の質問
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: `はじめまして！Linoa（リノア）です。\nあなたのお店の「専属AI秘書」として、日々の経営をサポートします。\n\nまずは${getOnboardingQuestion("store_name")}`,
      },
    ]);
    return;
  }

  // 既存ユーザーの再追加
  if (existing.onboarding_completed) {
    // オンボーディング完了済み → おかえりメッセージ
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: "おかえりなさい！Linoaです。\nまた一緒に頑張りましょう。「日報」と送ると日報入力が始まります。",
      },
    ]);
  } else {
    // オンボーディング途中 → 現在のステップの質問を再送
    const question = getOnboardingQuestion(existing.onboarding_step);
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: `おかえりなさい！Linoaです。\n登録の続きから始めましょう。\n\n${question}`,
      },
    ]);
  }
}

// ============================================
// テキストメッセージイベント
// 日報フロー対応: 「日報」トリガー → 質問形式で入力 → Claude分析
// ============================================
async function handleMessage(event: LineWebhookEvent): Promise<void> {
  if (event.message?.type !== "text" || !event.message.text) {
    return;
  }

  const lineUserId = event.source.userId;
  const userMessage = event.message.text;

  // 店舗取得
  const store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    await replyMessage(event.replyToken, [
      { type: "text", text: "お店の登録が見つかりません。友だち追加からやり直してください。" },
    ]);
    return;
  }

  // オンボーディング未完了の場合は日報より優先して処理
  if (!store.onboarding_completed) {
    const result = await processOnboardingInput(store, userMessage);
    await replyMessage(event.replyToken, [
      { type: "text", text: result.message },
    ]);
    return;
  }

  // 「レポート」トリガー → ダッシュボードURLを返す
  if (isReportViewTrigger(userMessage)) {
    const owner = await getOwnerByLineUserId(lineUserId);
    if (owner) {
      const token = await createDashboardToken(owner.id);
      const dashboardUrl = `https://li-noa.jp/dashboard?token=${token}`;
      await replyMessage(event.replyToken, [
        {
          type: "text",
          text: `レポートはこちらからご覧いただけます（24時間有効）\n\n${dashboardUrl}`,
        },
      ]);
    } else {
      await replyMessage(event.replyToken, [
        { type: "text", text: "オーナー情報が見つかりません。" },
      ]);
    }
    return;
  }

  // アクティブな日報セッションを確認
  const activeSession = await getActiveSession(store.id);

  // 「日報」トリガー → 新規セッション開始
  if (isReportTrigger(userMessage)) {
    const { question } = await startReportSession(store.id);
    await replyMessage(event.replyToken, [
      { type: "text", text: `日報を入力します。\n\n${question}` },
    ]);
    return;
  }

  // アクティブセッションがない場合 → 通常メッセージ（現時点ではエコー）
  if (!activeSession) {
    await replyMessage(event.replyToken, [
      {
        type: "text",
        text: `「${userMessage}」を受け取りました。\n\n日報を入力するには「日報」と送ってください。`,
      },
    ]);
    return;
  }

  // キャンセルワード
  if (isCancelWord(userMessage)) {
    await cancelReportSession(activeSession);
    await replyMessage(event.replyToken, [
      { type: "text", text: "日報入力をキャンセルしました。" },
    ]);
    return;
  }

  // 日報セッション入力処理
  const result = await processReportInput(activeSession, userMessage);

  if (!result.done) {
    // 次の質問を返す
    await replyMessage(event.replyToken, [
      { type: "text", text: result.question },
    ]);
    return;
  }

  // 全入力完了 → 日報保存 + Claude分析
  await handleReportComplete(event.replyToken, store.id, result.session);
}

// ============================================
// 日報入力完了時の処理
// 1. 日報をDBに保存（upsert）
// 2. Claude APIで所感を分析
// 3. サマリー + AIフィードバックを返信
// ============================================
async function handleReportComplete(
  replyToken: string,
  storeId: string,
  session: ReportSession
): Promise<void> {
  // 今日の日付（JST）
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstDate = new Date(now.getTime() + jstOffset);
  const reportDate = jstDate.toISOString().split("T")[0];

  const customerCount = session.customer_count ?? 0;
  const revenue = session.revenue ?? 0;
  const reservationCount = session.reservation_count ?? 0;
  const memo = session.memo ?? "";

  // 天候を自動取得（APIエラーでも日報保存は続行）
  const weather = await getWeather(reportDate);

  // 日報をDBに保存（同日2回目は上書き）
  await upsertDailyReport({
    storeId,
    reportDate,
    customerCount,
    revenue,
    reservationCount,
    memo,
    weather,
  });

  // Claude APIで所感を分析
  const analysis = await analyzeMemo(memo, {
    customerCount,
    revenue,
    reservationCount,
  });

  // extracted_contextsをDBに保存
  if (analysis.extracted_contexts.length > 0) {
    await saveExtractedContexts(storeId, analysis.extracted_contexts, memo);
  }

  // 会話履歴に所感とフィードバックを保存
  await saveConversation(storeId, "user", `[日報所感] ${memo}`);
  await saveConversation(storeId, "assistant", `[AIフィードバック] ${analysis.feedback}`);

  // サマリーメッセージ
  const summaryLines = [
    `日報を記録しました`,
    ``,
    `--- ${reportDate} ---`,
  ];
  if (weather) summaryLines.push(`天気: ${weather}`);
  summaryLines.push(
    `客数: ${customerCount}人`,
    `売上: ${revenue.toLocaleString()}円`,
    `予約: ${reservationCount}件`,
    `所感: ${memo.length > 50 ? memo.substring(0, 50) + "..." : memo}`,
  );
  const summary = summaryLines.join("\n");

  // 2メッセージで返信（サマリー + AIフィードバック）
  await replyMessage(replyToken, [
    { type: "text", text: summary },
    { type: "text", text: `\n${analysis.feedback}` },
  ]);
}
