// ============================================
// LINE Webhook エンドポイント
// 設計書: docs/mvp-design.md
//
// 処理フロー:
// 1. 署名検証
// 2. メッセージをDBに保存（intent付き）
// 3. 意図に応じたハンドラーへ振り分け
// 4. 返信をDBに保存
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { defaultLineClient } from "@/lib/line";
import { getStoreByLineUserId, createStore, saveMessage } from "@/lib/db";
import { classifyIntent } from "@/lib/ai/intent-classifier";
import { routeToHandler } from "@/lib/handlers";
import type { LineWebhookBody, LineWebhookEvent } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  if (!defaultLineClient.verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const webhookBody: LineWebhookBody = JSON.parse(body);

  for (const event of webhookBody.events) {
    await handleEvent(event);
  }

  return NextResponse.json({ status: "ok" });
}

async function handleEvent(event: LineWebhookEvent): Promise<void> {
  switch (event.type) {
    case "follow":
      await handleFollow(event);
      break;
    case "message":
      await handleMessage(event);
      break;
    default:
      break;
  }
}

// ============================================
// 友だち追加イベント
// ============================================
async function handleFollow(event: LineWebhookEvent): Promise<void> {
  const lineUserId = event.source.userId;

  let store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    store = await createStore(lineUserId);
  }
  if (!store) {
    console.error("handleFollow: store作成に失敗", lineUserId);
    return;
  }

  const welcomeText =
    "はじめまして！Linoa（リノア）です。\n" +
    "あなたのお店の「専属AI秘書」として、日々の経営をサポートします。\n\n" +
    "まずはお店の名前を教えてください。";

  await defaultLineClient.replyMessage(event.replyToken, [
    { type: "text", text: welcomeText },
  ]);

  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "outgoing",
    content: welcomeText,
  });
}

// ============================================
// テキストメッセージイベント
// 意図分類 → ハンドラー振り分け → 返信
// ============================================
async function handleMessage(event: LineWebhookEvent): Promise<void> {
  if (event.message?.type !== "text" || !event.message.text) return;

  const lineUserId = event.source.userId;
  const userText = event.message.text;

  const store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    await defaultLineClient.replyMessage(event.replyToken, [
      { type: "text", text: "お店の登録が見つかりません。友だち追加からやり直してください。" },
    ]);
    return;
  }

  // 意図分類（Claude API: max_tokens 20）
  const intent = await classifyIntent(userText);

  // 受信メッセージをintent付きで保存
  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "incoming",
    content: userText,
    intent,
  });

  // intent → ハンドラーへ振り分けて返信テキストを生成
  let replyText: string;
  const start = Date.now();
  try {
    replyText = await routeToHandler(intent, store, userText);
  } catch (error) {
    console.error("routeToHandler error:", error);
    replyText = "少し混み合っています。1分後にもう一度お試しください。";
  }
  const elapsed = Date.now() - start;
  // 7秒超えたら警告（Vercel無料プランの10秒制限の手前で気づけるように）
  if (elapsed > 7000) {
    console.warn(`[処理時間警告] ${elapsed}ms / intent: ${intent} / store: ${store.id}`);
  }

  await defaultLineClient.replyMessage(event.replyToken, [
    { type: "text", text: replyText },
  ]);

  // 送信メッセージを保存
  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "outgoing",
    content: replyText,
    intent,
  });
}
