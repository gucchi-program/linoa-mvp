// ============================================
// webhook-handlers.ts
// LINE Webhookのイベント処理ロジック（共通モジュール）
//
// 既存の /api/webhook/line/route.ts と
// マルチテナント用 /api/webhook/line/[ownerId]/route.ts の両方から使用する。
// LineClient を注入することで、テナントごとのLINEチャネル認証情報を透過的に扱える。
// ============================================

import { supabase } from "./supabase";
import { toJstDateString } from "./utils";
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
  getActiveExpiryItems,
} from "@/lib/db";
import { processOnboardingInput, getOnboardingQuestion } from "@/lib/onboarding";
import {
  isReportTrigger,
  isCancelWord,
  startReportSession,
  processReportInput,
  cancelReportSession,
} from "@/lib/report-session";
import {
  analyzeMemo,
  generateSnsPost,
  generatePopCopy,
  chatWithContext,
  generateForecast,
} from "@/lib/claude";
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
import type { LineWebhookEvent, ReportSession } from "@/types";
import type { LineClient, LineMessage } from "@/lib/line";

// ダッシュボードURLのベース（サブドメイン対応のために引数で受け取る）
const DEFAULT_DASHBOARD_BASE = "https://li-noa.jp";

// ============================================
// トリガー判定ヘルパー
// ============================================

function isReportViewTrigger(message: string): boolean {
  const triggers = ["レポート", "れぽーと", "レポ", "売上確認", "ダッシュボード"];
  return triggers.some((t) => message.includes(t));
}

function isSnsTrigger(message: string): boolean {
  const triggers = ["SNS", "sns", "投稿", "インスタ", "ツイート"];
  return triggers.some((t) => message.includes(t));
}

function isPopTrigger(message: string): boolean {
  const triggers = ["POP", "pop", "ポップ", "ぽっぷ"];
  return triggers.some((t) => message.includes(t));
}

function isForecastTrigger(message: string): boolean {
  return /仕込み|予測|来週|需要|仕入れ/.test(message);
}

// ============================================
// メインエントリ: イベントを振り分ける
// lineClient: テナントのLINEチャネル認証情報にバインドされたクライアント
// dashboardBase: ダッシュボードURLのベース（例: "https://clientA.li-noa.jp"）
// ============================================
export async function handleEvent(
  event: LineWebhookEvent,
  lineClient: LineClient,
  dashboardBase: string = DEFAULT_DASHBOARD_BASE
): Promise<void> {
  switch (event.type) {
    case "follow":
      await handleFollow(event, lineClient);
      break;
    case "message":
      await handleMessage(event, lineClient, dashboardBase);
      break;
    default:
      break;
  }
}

// ============================================
// 友だち追加（follow）イベント
// ============================================
async function handleFollow(
  event: LineWebhookEvent,
  lineClient: LineClient
): Promise<void> {
  const lineUserId = event.source.userId;
  const existing = await getStoreByLineUserId(lineUserId);

  if (!existing) {
    const { error } = await supabase.from("stores").insert({
      line_user_id: lineUserId,
    });
    if (error) {
      console.error("Failed to create store:", error);
    }

    await lineClient.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `はじめまして！Linoa（リノア）です。\nあなたのお店の「専属AI秘書」として、日々の経営をサポートします。\n\nまずは${getOnboardingQuestion("store_name")}`,
      },
    ]);
    return;
  }

  if (existing.onboarding_completed) {
    await lineClient.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "おかえりなさい！Linoaです。\nまた一緒に頑張りましょう。「日報」と送ると日報入力が始まります。",
      },
    ]);
  } else {
    const question = getOnboardingQuestion(existing.onboarding_step);
    await lineClient.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `おかえりなさい！Linoaです。\n登録の続きから始めましょう。\n\n${question}`,
      },
    ]);
  }
}

// ============================================
// テキストメッセージイベント
// ============================================
async function handleMessage(
  event: LineWebhookEvent,
  lineClient: LineClient,
  dashboardBase: string
): Promise<void> {
  if (event.message?.type !== "text" || !event.message.text) {
    return;
  }

  const lineUserId = event.source.userId;
  const userMessage = event.message.text;

  const store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    await lineClient.replyMessage(event.replyToken, [
      { type: "text", text: "お店の登録が見つかりません。友だち追加からやり直してください。" },
    ]);
    return;
  }

  if (!store.onboarding_completed) {
    const result = await processOnboardingInput(store, userMessage);
    await lineClient.replyMessage(event.replyToken, [
      { type: "text", text: result.message },
    ]);
    return;
  }

  // 「レポート」トリガー → ダッシュボードURLを返す
  if (isReportViewTrigger(userMessage)) {
    const owner = await getOwnerByLineUserId(lineUserId);
    if (owner) {
      const token = await createDashboardToken(owner.id);
      const dashboardUrl = `${dashboardBase}/dashboard?token=${token}`;
      await lineClient.replyMessage(event.replyToken, [
        {
          type: "text",
          text: `レポートはこちらからご覧いただけます（24時間有効）\n\n${dashboardUrl}`,
        },
      ]);
    } else {
      await lineClient.replyMessage(event.replyToken, [
        { type: "text", text: "オーナー情報が見つかりません。" },
      ]);
    }
    return;
  }

  if (isSnsTrigger(userMessage)) {
    await handleSnsGenerate(event.replyToken, store, lineClient);
    return;
  }

  if (isPopTrigger(userMessage)) {
    await handlePopGenerate(event.replyToken, store, lineClient);
    return;
  }

  if (isExpiryTrigger(userMessage)) {
    const message = startExpirySession(store.id);
    await lineClient.replyMessage(event.replyToken, [{ type: "text", text: message }]);
    return;
  }

  if (isExpiryListTrigger(userMessage)) {
    const message = await getExpiryListMessage(store.id);
    await lineClient.replyMessage(event.replyToken, [{ type: "text", text: message }]);
    return;
  }

  const expirySession = getActiveExpirySession(store.id);
  if (expirySession) {
    if (isCancelWord(userMessage)) {
      cancelExpirySession(store.id);
      await lineClient.replyMessage(event.replyToken, [
        { type: "text", text: "賞味期限の登録をキャンセルしました。" },
      ]);
      return;
    }
    const expiryResult = await processExpiryInput(store.id, userMessage);
    await lineClient.replyMessage(event.replyToken, [{ type: "text", text: expiryResult.message }]);
    return;
  }

  if (isShiftTrigger(userMessage)) {
    const message = startShiftSession(store.id);
    await lineClient.replyMessage(event.replyToken, [{ type: "text", text: message }]);
    return;
  }

  const shiftSession = getActiveShiftSession(store.id);
  if (shiftSession) {
    if (isCancelWord(userMessage)) {
      cancelShiftSession(store.id);
      await lineClient.replyMessage(event.replyToken, [
        { type: "text", text: "シフト管理を終了しました。" },
      ]);
      return;
    }
    const shiftResult = await processShiftInput(store.id, userMessage);
    await lineClient.replyMessage(event.replyToken, [{ type: "text", text: shiftResult.message }]);
    return;
  }

  if (isForecastTrigger(userMessage)) {
    await handleForecast(event.replyToken, store, lineClient);
    return;
  }

  const activeSession = await getActiveSession(store.id);

  if (isReportTrigger(userMessage)) {
    const { question } = await startReportSession(store.id);
    await lineClient.replyMessage(event.replyToken, [
      { type: "text", text: `日報を入力します。\n\n${question}` },
    ]);
    return;
  }

  if (!activeSession) {
    await handleFreeChat(event.replyToken, store, userMessage, lineClient);
    return;
  }

  if (isCancelWord(userMessage)) {
    await cancelReportSession(activeSession);
    await lineClient.replyMessage(event.replyToken, [
      { type: "text", text: "日報入力をキャンセルしました。" },
    ]);
    return;
  }

  const result = await processReportInput(activeSession, userMessage);

  if (!result.done) {
    await lineClient.replyMessage(event.replyToken, [{ type: "text", text: result.question }]);
    return;
  }

  await handleReportComplete(event.replyToken, store.id, result.session, lineClient);
}

// ============================================
// 日報入力完了時の処理
// ============================================
async function handleReportComplete(
  replyToken: string,
  storeId: string,
  session: ReportSession,
  lineClient: LineClient
): Promise<void> {
  const reportDate = toJstDateString();

  const customerCount = session.customer_count ?? 0;
  const revenue = session.revenue ?? 0;
  const reservationCount = session.reservation_count ?? 0;
  const memo = session.memo ?? "";

  const weather = await getWeather(reportDate);

  await upsertDailyReport({
    storeId,
    reportDate,
    customerCount,
    revenue,
    reservationCount,
    memo,
    weather,
  });

  const analysis = await analyzeMemo(memo, { customerCount, revenue, reservationCount });

  if (analysis.extracted_contexts.length > 0) {
    await saveExtractedContexts(storeId, analysis.extracted_contexts, memo);
  }

  await saveConversation(storeId, "user", `[日報所感] ${memo}`);
  await saveConversation(storeId, "assistant", `[AIフィードバック] ${analysis.feedback}`);

  const summaryLines = [`日報を記録しました`, ``, `--- ${reportDate} ---`];
  if (weather) summaryLines.push(`天気: ${weather}`);
  summaryLines.push(
    `客数: ${customerCount}人`,
    `売上: ${revenue.toLocaleString()}円`,
    `予約: ${reservationCount}件`,
    `所感: ${memo.length > 50 ? memo.substring(0, 50) + "..." : memo}`
  );
  const summary = summaryLines.join("\n");

  await lineClient.replyMessage(replyToken, [
    { type: "text", text: summary },
    { type: "text", text: `\n${analysis.feedback}` },
  ]);
}

// ============================================
// SNS投稿文生成ハンドラ
// ============================================
async function handleSnsGenerate(
  replyToken: string,
  store: { id: string; store_name: string | null; genre: string | null },
  lineClient: LineClient
): Promise<void> {
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

  await lineClient.replyMessage(replyToken, [
    { type: "text", text: `【Instagram用】\n\n${result.instagram}` },
    {
      type: "text",
      text: `【X（Twitter）用】\n\n${result.twitter}\n\n※ そのままコピーして投稿できます`,
    },
  ]);
}

// ============================================
// POP画像生成ハンドラ
// ============================================
async function handlePopGenerate(
  replyToken: string,
  store: { id: string; store_name: string | null; genre: string | null },
  lineClient: LineClient
): Promise<void> {
  const popCopy = await generatePopCopy({
    storeName: store.store_name ?? "お店",
    genre: store.genre ?? "飲食店",
    latestMemo: null,
  });

  const params = new URLSearchParams({
    headline: popCopy.headline,
    subtext: popCopy.subtext,
    store: store.store_name ?? "",
    accent: popCopy.accent,
  });

  const baseUrl = "https://li-noa.jp/api/pop";
  const originalUrl = `${baseUrl}?${params.toString()}&size=large`;
  const previewUrl = `${baseUrl}?${params.toString()}&size=small`;

  await lineClient.replyMessage(replyToken, [
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
// ============================================
async function handleFreeChat(
  replyToken: string,
  store: {
    id: string;
    store_name: string | null;
    genre: string | null;
    seat_count: number | null;
    opening_hours: string | null;
  },
  userMessage: string,
  lineClient: LineClient
): Promise<void> {
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

  await saveConversation(store.id, "user", userMessage);
  await saveConversation(store.id, "assistant", reply);

  await lineClient.replyMessage(replyToken, [{ type: "text", text: reply }]);
}

// ============================================
// 需要予測・仕入れアドバイスハンドラ
// ============================================
async function handleForecast(
  replyToken: string,
  store: { id: string; store_name: string | null; genre: string | null },
  lineClient: LineClient
): Promise<void> {
  const [reports, expiryItems] = await Promise.all([
    getDailyReports(store.id, 30),
    getActiveExpiryItems(store.id),
  ]);

  if (reports.length === 0) {
    await lineClient.replyMessage(replyToken, [
      { type: "text", text: "今日もお疲れ様でした。" },
    ]);
    return;
  }

  const result = await generateForecast({
    storeName: store.store_name ?? "お店",
    genre: store.genre ?? "飲食店",
    reports,
    expiryItems: expiryItems.map((e) => ({
      item_name: e.item_name,
      expiry_date: e.expiry_date,
      quantity: e.quantity,
    })),
  });

  await lineClient.replyMessage(replyToken, [
    { type: "text", text: `【来週の需要予測】\n\n${result.forecast}` },
    { type: "text", text: `【仕込み量アドバイス】\n\n${result.procurement}` },
  ]);
}

