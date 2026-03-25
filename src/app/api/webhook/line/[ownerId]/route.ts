import { NextRequest, NextResponse } from "next/server";
import { createLineClient } from "@/lib/line";
import { getOwnerById } from "@/lib/db";
import { handleEvent } from "@/lib/webhook-handlers";
import type { LineWebhookBody } from "@/types";

// ============================================
// マルチテナント対応Webhook
// URL: /api/webhook/line/[ownerId]
//
// 受注後のオンボーディングフロー:
// 1. 運営がowner_idをDBに登録し、チャネル情報を設定する
// 2. LINE公式アカウントのWebhook URLをこのエンドポイントに設定する
//    例: https://li-noa.jp/api/webhook/line/abc123
// 3. クライアントが友達追加 → このエンドポイントが呼ばれる
// ============================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const { ownerId } = await params;
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // DBからオーナーのチャネル認証情報を取得
    const owner = await getOwnerById(ownerId);

    if (!owner) {
      console.error(`Webhook: owner not found: ${ownerId}`);
      // セキュリティのため404ではなく200を返す（LINEには常に200が必要）
      return NextResponse.json({ status: "ok" });
    }

    if (!owner.is_active) {
      console.error(`Webhook: owner not active: ${ownerId}`);
      return NextResponse.json({ status: "ok" });
    }

    if (!owner.line_channel_secret || !owner.line_channel_access_token) {
      console.error(`Webhook: owner missing channel credentials: ${ownerId}`);
      return NextResponse.json({ status: "ok" });
    }

    // テナント固有のLineClientを生成
    const lineClient = createLineClient(
      owner.line_channel_secret,
      owner.line_channel_access_token
    );

    // テナントのチャネルシークレットで署名を検証
    if (!lineClient.verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const webhookBody: LineWebhookBody = JSON.parse(body);

    // サブドメインが設定されていればそちらのダッシュボードURLを使う
    const dashboardBase = owner.subdomain
      ? `https://${owner.subdomain}.li-noa.jp`
      : "https://li-noa.jp";

    await Promise.all(
      webhookBody.events.map((event) =>
        handleEvent(event, lineClient, dashboardBase)
      )
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Multi-tenant webhook error:", error);
    // エラーでも200を返す（LINEのリトライを防ぐ）
    return NextResponse.json({ status: "ok" });
  }
}
