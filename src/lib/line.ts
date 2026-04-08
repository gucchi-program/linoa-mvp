import crypto from "crypto";

const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const LINE_API_BASE = "https://api.line.me/v2/bot";

// LINEメッセージ型（テキスト・画像・Flexに対応）
// Flex Message: カード型レイアウト。SNS投稿案や売上レポートの表示に使う
export type LineMessage =
  | { type: "text"; text: string }
  | { type: "image"; originalContentUrl: string; previewImageUrl: string }
  | { type: "flex"; altText: string; contents: object };

// ============================================
// LineClient: テナントごとの認証情報にバインドされたクライアント
// マルチテナントWebhookで使用。DBから取得したチャネル情報で生成する
// ============================================
export interface LineClient {
  verifySignature(body: string, signature: string): boolean;
  replyMessage(replyToken: string, messages: LineMessage[]): Promise<void>;
  pushMessage(to: string, messages: LineMessage[]): Promise<void>;
}

export function createLineClient(channelSecret: string, accessToken: string): LineClient {
  return {
    verifySignature(body: string, signature: string): boolean {
      const hmac = crypto.createHmac("SHA256", channelSecret);
      hmac.update(body);
      const digest = hmac.digest("base64");
      return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    },
    async replyMessage(replyToken: string, messages: LineMessage[]): Promise<void> {
      const res = await fetch(`${LINE_API_BASE}/message/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ replyToken, messages }),
      });
      if (!res.ok) {
        const error = await res.text();
        console.error("LINE reply failed:", error);
        throw new Error(`LINE reply failed: ${res.status}`);
      }
    },
    async pushMessage(to: string, messages: LineMessage[]): Promise<void> {
      const res = await fetch(`${LINE_API_BASE}/message/push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ to, messages }),
      });
      if (!res.ok) {
        const error = await res.text();
        console.error("LINE push failed:", error);
        throw new Error(`LINE push failed: ${res.status}`);
      }
    },
  };
}

// ============================================
// 環境変数を使うデフォルトクライアント
// 開発用チャネルおよびcronジョブで使用する
// ============================================
export const defaultLineClient: LineClient = createLineClient(CHANNEL_SECRET, CHANNEL_ACCESS_TOKEN);

// ============================================
// 後方互換のスタンドアロン関数（デフォルトクライアントに委譲）
// cronジョブ等の既存コードから引き続き呼び出せる
// ============================================
export function verifySignature(body: string, signature: string): boolean {
  return defaultLineClient.verifySignature(body, signature);
}

export async function replyMessage(
  replyToken: string,
  messages: LineMessage[]
): Promise<void> {
  return defaultLineClient.replyMessage(replyToken, messages);
}

export async function pushMessage(
  to: string,
  messages: LineMessage[]
): Promise<void> {
  return defaultLineClient.pushMessage(to, messages);
}
