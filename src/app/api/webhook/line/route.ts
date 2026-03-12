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
  getRecentConversations,
  getRecentContexts,
  getDailyReports,
} from "@/lib/db";
import { processOnboardingInput, getOnboardingQuestion } from "@/lib/onboarding";
import {
  isReportTrigger,
  isCancelWord,
  startReportSession,
  processReportInput,
  cancelReportSession,
} from "@/lib/report-session";
import { analyzeMemo, generateSnsPost, generatePopCopy, chatWithContext } from "@/lib/claude";
import { getWeather } from "@/lib/weather";
import {
  isExpiryTrigger,
  isExpiryListTrigger,
  startExpirySession,
  getActiveExpirySession,
  cancelExpirySession,
  processExpiryInput,
  getExpiryListMessage,
} from "@/lib/expiry-session";
import {
  isShiftTrigger,
  startShiftSession,
  getActiveShiftSession,
  cancelShiftSession,
  processShiftInput,
} from "@/lib/shift-session";
import type { LineWebhookBody, LineWebhookEvent, ReportSession } from "@/types";

// 「レポート」「レポート見せて」等のトリガー判定
function isReportViewTrigger(message: string): boolean {
  const triggers = ["レポート", "れぽーと", "レポ", "売上確認", "ダッシュボード"];
  return triggers.some((t) => message.includes(t));
}

// 「SNS」「投稿」等のトリガー判定
function isSnsTrigger(message: string): boolean {
  const triggers = ["SNS", "sns", "投稿", "インスタ", "ツイート"];
  return triggers.some((t) => message.includes(t));
}

// 「POP」「ポップ」等のトリガー判定
function isPopTrigger(message: string): boolean {
  const triggers = ["POP", "pop", "ポップ", "ぽっぷ"];
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

  // 「SNS」トリガー → SNS投稿文を生成
  if (isSnsTrigger(userMessage)) {
    await handleSnsGenerate(event.replyToken, store);
    return;
  }

  // 「POP」トリガー → POP画像を生成
  if (isPopTrigger(userMessage)) {
    await handlePopGenerate(event.replyToken, store);
    return;
  }

  // 「賞味期限」トリガー → 賞味期限登録開始
  if (isExpiryTrigger(userMessage)) {
    const message = startExpirySession(store.id);
    await replyMessage(event.replyToken, [
      { type: "text", text: message },
    ]);
    return;
  }

  // 「期限一覧」トリガー → 登録済み賞味期限の一覧表示
  if (isExpiryListTrigger(userMessage)) {
    const message = await getExpiryListMessage(store.id);
    await replyMessage(event.replyToken, [
      { type: "text", text: message },
    ]);
    return;
  }

  // アクティブな賞味期限セッションがあれば優先処理
  const expirySession = getActiveExpirySession(store.id);
  if (expirySession) {
    if (isCancelWord(userMessage)) {
      cancelExpirySession(store.id);
      await replyMessage(event.replyToken, [
        { type: "text", text: "賞味期限の登録をキャンセルしました。" },
      ]);
      return;
    }
    const expiryResult = await processExpiryInput(store.id, userMessage);
    await replyMessage(event.replyToken, [
      { type: "text", text: expiryResult.message },
    ]);
    return;
  }

  // 「シフト」トリガー → シフト管理メニュー
  if (isShiftTrigger(userMessage)) {
    const message = startShiftSession(store.id);
    await replyMessage(event.replyToken, [
      { type: "text", text: message },
    ]);
    return;
  }

  // アクティブなシフトセッションがあれば優先処理
  const shiftSession = getActiveShiftSession(store.id);
  if (shiftSession) {
    if (isCancelWord(userMessage)) {
      cancelShiftSession(store.id);
      await replyMessage(event.replyToken, [
        { type: "text", text: "シフト管理を終了しました。" },
      ]);
      return;
    }
    const shiftResult = await processShiftInput(store.id, userMessage);
    await replyMessage(event.replyToken, [
      { type: "text", text: shiftResult.message },
    ]);
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

  // アクティブセッションがない場合 → AI秘書として自由対話
  if (!activeSession) {
    await handleFreeChat(event.replyToken, store, userMessage);
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

// ============================================
// SNS投稿文生成ハンドラ
// Claude APIでInstagram/X向けの投稿文を生成してLINEで返す
// ============================================
async function handleSnsGenerate(
  replyToken: string,
  store: { id: string; store_name: string | null; genre: string | null }
): Promise<void> {
  // 直近の日報所感を取得（コンテキストとして活用）
  const { data: latestReport } = await supabase
    .from("daily_reports")
    .select("memo")
    .eq("store_id", store.id)
    .order("report_date", { ascending: false })
    .limit(1)
    .single();

  const result = await generateSnsPost({
    storeName: store.store_name ?? "お店",
    genre: store.genre ?? "飲食店",
    latestMemo: latestReport?.memo ?? null,
  });

  await replyMessage(replyToken, [
    {
      type: "text",
      text: `【Instagram用】\n\n${result.instagram}`,
    },
    {
      type: "text",
      text: `【X（Twitter）用】\n\n${result.twitter}\n\n※ そのままコピーして投稿できます`,
    },
  ]);
}

// ============================================
// POP画像生成ハンドラ
// Claude APIでコピーを生成 → satori APIで画像化 → LINEに画像送信
// ============================================
async function handlePopGenerate(
  replyToken: string,
  store: { id: string; store_name: string | null; genre: string | null }
): Promise<void> {
  const popCopy = await generatePopCopy({
    storeName: store.store_name ?? "お店",
    genre: store.genre ?? "飲食店",
    latestMemo: null,
  });

  // POP画像URLを構築（自サーバーのAPI）
  const params = new URLSearchParams({
    headline: popCopy.headline,
    subtext: popCopy.subtext,
    store: store.store_name ?? "",
    accent: popCopy.accent,
  });

  const baseUrl = "https://li-noa.jp/api/pop";
  const originalUrl = `${baseUrl}?${params.toString()}&size=large`;
  const previewUrl = `${baseUrl}?${params.toString()}&size=small`;

  await replyMessage(replyToken, [
    {
      type: "image",
      originalContentUrl: originalUrl,
      previewImageUrl: previewUrl,
    },
    {
      type: "text",
      text: [
        `【POP画像を生成しました】`,
        ``,
        `コピー: ${popCopy.headline}`,
        `${popCopy.subtext}`,
        ``,
        `※ 画像を長押しで保存できます`,
        `※ もう一度「POP」と送ると別パターンが生成されます`,
      ].join("\n"),
    },
  ]);
}

// ============================================
// 自由対話ハンドラ（AI秘書チャット）
// トリガーに一致しない自由なメッセージに対して、
// 店舗データを踏まえたAI応答を返す
// ============================================
async function handleFreeChat(
  replyToken: string,
  store: { id: string; store_name: string | null; genre: string | null; seat_count: number | null; opening_hours: string | null },
  userMessage: string
): Promise<void> {
  // 並列でコンテキストデータを取得
  const [recentReports, recentContexts, recentConversations] = await Promise.all([
    getDailyReports(store.id, 14),
    getRecentContexts(store.id, 20),
    getRecentConversations(store.id, 10),
  ]);

  const reply = await chatWithContext(userMessage, {
    storeName: store.store_name ?? "お店",
    genre: store.genre ?? "飲食店",
    seatCount: store.seat_count,
    openingHours: store.opening_hours,
    recentReports,
    recentContexts,
    recentConversations,
  });

  // 会話履歴を保存
  await saveConversation(store.id, "user", userMessage);
  await saveConversation(store.id, "assistant", reply);

  await replyMessage(replyToken, [
    { type: "text", text: reply },
  ]);
}
