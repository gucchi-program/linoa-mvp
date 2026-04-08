// ============================================
// LINE Webhook エンドポイント（新設計版）
// 設計書: docs/mvp-design.md
//
// Step 1: 署名検証 → messagesに保存 → オウム返し
// Step 2以降: 意図分類 → ハンドラーに振り分け
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { defaultLineClient } from "@/lib/line";
import {
  getStoreByLineUserId,
  createStore,
  saveMessage,
} from "@/lib/db";
import type { LineWebhookBody, LineWebhookEvent } from "@/types";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-line-signature");

  // 署名がない場合は即拒否
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // LINE Channel Secretで署名を検証
  if (!defaultLineClient.verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const webhookBody: LineWebhookBody = JSON.parse(body);

  // イベントを順番に処理する
  // 注意: Claude API呼び出し（Step 2以降）は時間がかかるため、
  // そのタイミングで非同期化を検討する
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
// storesレコードを作成してウェルカムメッセージを送る
// ============================================
async function handleFollow(event: LineWebhookEvent): Promise<void> {
  const lineUserId = event.source.userId;

  // 既存レコードを確認（ブロック解除からの再follow対応）
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

  // 送信したウェルカムメッセージをログに保存
  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "outgoing",
    content: welcomeText,
  });
}

// ============================================
// テキストメッセージイベント
// Step 1: messagesに保存してそのまま返す（オウム返し）
// Step 2以降: 意図分類 → ハンドラーへ振り分け
// ============================================
async function handleMessage(event: LineWebhookEvent): Promise<void> {
  if (event.message?.type !== "text" || !event.message.text) return;

  const lineUserId = event.source.userId;
  const userText = event.message.text;

  // 店舗レコードを取得
  const store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    await defaultLineClient.replyMessage(event.replyToken, [
      { type: "text", text: "お店の登録が見つかりません。友だち追加からやり直してください。" },
    ]);
    return;
  }

  // 受信メッセージをDBに保存
  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "incoming",
    content: userText,
  });

  // オウム返し
  const replyText = `受信：${userText}`;
  await defaultLineClient.replyMessage(event.replyToken, [
    { type: "text", text: replyText },
  ]);

  // 送信メッセージをDBに保存
  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "outgoing",
    content: replyText,
  });
}
