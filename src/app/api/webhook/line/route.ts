import { NextRequest, NextResponse } from "next/server";
import { defaultLineClient } from "@/lib/line";
import { handleEvent } from "@/lib/webhook-handlers";
import type { LineWebhookBody } from "@/types";

// ============================================
// 開発用シングルテナントWebhook
// 環境変数のLINEチャネルを使用する（テスト・開発専用）
// マルチテナント本番は /api/webhook/line/[ownerId]/route.ts を使用する
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (!defaultLineClient.verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const webhookBody: LineWebhookBody = JSON.parse(body);

    await Promise.all(
      webhookBody.events.map((event) => handleEvent(event, defaultLineClient))
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ status: "ok" });
  }
}
