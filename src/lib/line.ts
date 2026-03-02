import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_API_BASE = "https://api.line.me/v2/bot";

// ============================================
// 署名検証
// LINE PlatformがWebhookリクエストに付与する
// X-Line-Signature ヘッダーの値を検証する
// HMAC-SHA256でリクエストボディのダイジェストを計算し、
// Base64エンコードした値と比較する
// ============================================
export function verifySignature(body: string, signature: string): boolean {
  const hmac = crypto.createHmac("SHA256", CHANNEL_SECRET);
  hmac.update(body);
  const digest = hmac.digest("base64");
  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  );
}

// ============================================
// リプライメッセージ送信
// replyToken を使って即座に返信する（無料）
// ============================================
export async function replyMessage(
  replyToken: string,
  messages: Array<{ type: string; text: string }>
): Promise<void> {
  const res = await fetch(`${LINE_API_BASE}/message/reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ replyToken, messages }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("LINE reply failed:", error);
    throw new Error(`LINE reply failed: ${res.status}`);
  }
}

// ============================================
// プッシュメッセージ送信
// 任意のタイミングでユーザーにメッセージを送る
// 従量課金対象のため、Cron等での通知用
// ============================================
export async function pushMessage(
  to: string,
  messages: Array<{ type: string; text: string }>
): Promise<void> {
  const res = await fetch(`${LINE_API_BASE}/message/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("LINE push failed:", error);
    throw new Error(`LINE push failed: ${res.status}`);
  }
}
