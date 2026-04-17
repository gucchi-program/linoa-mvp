// ============================================
// LINE Webhook エンドポイント
// 設計書: docs/mvp-design.md
//
// 処理フロー:
// 1. 署名検証
// 2. メッセージをDBに保存（intent付き）
// 3. 意図に応じたハンドラーへ振り分け
// 4. 返信をDBに保存
//
// image メッセージ対応（migration 013〜）:
// - 写真を受け取ったらInstagram投稿フローへ
// - 30分タイマー + LINEでプレビュー送信
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { defaultLineClient, downloadLineImage } from "@/lib/line";
import {
  getStoreByLineUserId,
  createStore,
  saveMessage,
  savePendingContent,
  cancelLatestPendingContent,
  uploadStoreImage,
} from "@/lib/db";
import { classifyIntent } from "@/lib/ai/intent-classifier";
import { routeToHandler } from "@/lib/handlers";
import { callClaudeWithImage } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/store-profile";
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

  // Vercelのレスポンス制限（10秒）を避けるため、即座に200を返す
  // 各イベントの処理はawaitせず並列で実行
  Promise.all(webhookBody.events.map(handleEvent)).catch((err) => {
    console.error("webhook event processing error:", err);
  });

  return NextResponse.json({ status: "ok" });
}

async function handleEvent(event: LineWebhookEvent): Promise<void> {
  switch (event.type) {
    case "follow":
      await handleFollow(event);
      break;
    case "message":
      if (event.message?.type === "text") {
        await handleTextMessage(event);
      } else if (event.message?.type === "image") {
        await handleImageMessage(event);
      }
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
// テキストメッセージ
// 「キャンセル」は意図分類を通さず直接処理する
// ============================================
async function handleTextMessage(event: LineWebhookEvent): Promise<void> {
  if (!event.message?.text) return;

  const lineUserId = event.source.userId;
  const userText = event.message.text.trim();

  const store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    await defaultLineClient.replyMessage(event.replyToken, [
      { type: "text", text: "お店の登録が見つかりません。友だち追加からやり直してください。" },
    ]);
    return;
  }

  // 「キャンセル」は意図分類せずに直接処理（Claude API呼び出しを節約）
  if (/^キャンセル$|^きゃんせる$|^cancel$/i.test(userText)) {
    const cancelled = await cancelLatestPendingContent(store.id);
    const replyText = cancelled
      ? "投稿をキャンセルしました。\n変更する場合は、もう一度写真を送ってください。"
      : "キャンセルできる投稿が見つかりませんでした。\nすでに投稿済みか時間が過ぎています。";

    await defaultLineClient.replyMessage(event.replyToken, [
      { type: "text", text: replyText },
    ]);
    return;
  }

  // 意図分類（Claude API: max_tokens 20）
  const intent = await classifyIntent(userText);

  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "incoming",
    content: userText,
    intent,
  });

  let replyMessages: import("@/types").LineMessage[];
  const start = Date.now();
  try {
    replyMessages = await routeToHandler(intent, store, userText);
  } catch (error) {
    console.error("routeToHandler error:", error);
    replyMessages = [{ type: "text", text: "少し混み合っています。1分後にもう一度お試しください。" }];
  }

  if (Date.now() - start > 7000) {
    console.warn(`[処理時間警告] ${Date.now() - start}ms / intent: ${intent}`);
  }

  await defaultLineClient.replyMessage(event.replyToken, replyMessages);

  const replyText = replyMessages
    .map((m) => (m.type === "text" ? m.text : m.type === "flex" ? m.altText : ""))
    .join(" ");
  await saveMessage({
    storeId: store.id,
    lineUserId,
    direction: "outgoing",
    content: replyText,
    intent,
  });
}

// ============================================
// 画像メッセージ → Instagram自動投稿フロー
// 1. LINE APIから画像をダウンロード
// 2. Supabase Storageにアップロード（公開URL取得）
// 3. Claude Visionでキャプション生成
// 4. generated_contentsにpendingで保存（30分タイマー）
// 5. LINEでプレビューを送信
// ============================================
async function handleImageMessage(event: LineWebhookEvent): Promise<void> {
  if (!event.message?.id) return;

  const lineUserId = event.source.userId;
  const messageId = event.message.id;

  const store = await getStoreByLineUserId(lineUserId);
  if (!store) {
    await defaultLineClient.replyMessage(event.replyToken, [
      { type: "text", text: "お店の登録が見つかりません。友だち追加からやり直してください。" },
    ]);
    return;
  }

  // Instagram連携が未設定の場合は案内して終了
  if (!store.instagram_business_account_id || !store.instagram_access_token) {
    await defaultLineClient.replyMessage(event.replyToken, [
      {
        type: "text",
        text: "Instagram連携がまだ設定されていません。\n" +
          "app.li-noa.jp にログインして設定してください。",
      },
    ]);
    return;
  }

  // 受信中メッセージを即座に返しながら処理を続ける
  await defaultLineClient.replyMessage(event.replyToken, [
    { type: "text", text: "写真を受け取りました！\nInstagramの投稿文を生成しています..." },
  ]);

  try {
    // LINE APIから画像をダウンロード
    const imageBuffer = await downloadLineImage(messageId);

    // Supabase Storageにアップロード
    const filename = `${Date.now()}.jpg`;
    const imageUrl = await uploadStoreImage(imageBuffer, store.id, filename);

    // Claude Visionでキャプション生成
    const systemPrompt = buildSystemPrompt(store);
    const imageBase64 = imageBuffer.toString("base64");
    const caption = await callClaudeWithImage({
      systemPrompt:
        systemPrompt +
        "\n\n【追加ルール】\n" +
        "この写真を見て、Instagramに投稿する文章を作成してください。\n" +
        "- 料理や店内の魅力が伝わる内容にする\n" +
        "- ハッシュタグを3〜5個つける\n" +
        "- 200文字以内にまとめる\n" +
        "- 投稿文のみを返す（説明不要）",
      userMessage: "この写真のInstagram投稿文を作ってください。",
      imageBase64,
      imageMimeType: "image/jpeg",
      maxTokens: 400,
    });

    // pendingとして保存（30分後に自動投稿）
    await savePendingContent({
      storeId: store.id,
      imageUrl,
      caption,
      lineUserId,
    });

    // Push messageでプレビューを送信（replyTokenは使用済みのためpushを使う）
    const previewText =
      `📸 投稿プレビュー\n\n${caption}\n\n` +
      `━━━━━━━━━━━━━━\n` +
      `30分後にInstagramに投稿します。\n` +
      `取り消す場合は「キャンセル」と返信してください。`;

    await defaultLineClient.pushMessage(lineUserId, [
      {
        type: "image",
        originalContentUrl: imageUrl,
        previewImageUrl: imageUrl,
      },
      { type: "text", text: previewText },
    ]);

    await saveMessage({
      storeId: store.id,
      lineUserId,
      direction: "outgoing",
      content: previewText,
      messageType: "instagram_pending",
    });
  } catch (error) {
    console.error("handleImageMessage error:", error);
    await defaultLineClient.pushMessage(lineUserId, [
      {
        type: "text",
        text: "投稿の準備中にエラーが発生しました。もう一度写真を送ってみてください。",
      },
    ]);
  }
}
