import { NextRequest, NextResponse } from "next/server";
import { verifySignature, replyMessage } from "@/lib/line";
import { supabase } from "@/lib/supabase";
import type { LineWebhookBody, LineWebhookEvent } from "@/types";

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
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("line_user_id", lineUserId)
    .single();

  if (!existing) {
    // 新規店舗レコード作成
    const { error } = await supabase.from("stores").insert({
      line_user_id: lineUserId,
    });

    if (error) {
      console.error("Failed to create store:", error);
    }
  }

  // ウェルカムメッセージ
  await replyMessage(event.replyToken, [
    {
      type: "text",
      text: "はじめまして！Linoa（リノア）です。\nあなたのお店の「専属AI秘書」として、日々の経営をサポートします。\n\nまずはお店の名前を教えていただけますか？",
    },
  ]);
}

// ============================================
// テキストメッセージイベント
// Sprint 1: エコー返信（Sprint 2 で Claude API に差し替え）
// ============================================
async function handleMessage(event: LineWebhookEvent): Promise<void> {
  if (event.message?.type !== "text" || !event.message.text) {
    return;
  }

  const userMessage = event.message.text;

  // エコー返信（Sprint 2 で Claude API 応答に置き換え）
  await replyMessage(event.replyToken, [
    {
      type: "text",
      text: `「${userMessage}」を受け取りました。（現在テストモードです）`,
    },
  ]);
}
