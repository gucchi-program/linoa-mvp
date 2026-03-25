import { createExpiryItem, getActiveExpiryItems } from "./db";
import { parseJapaneseDate } from "./utils";
import type { ExpiryStep } from "@/types";

// ============================================
// 賞味期限入力セッション管理
// report_sessionsとは独立したインメモリ管理
// Webhookはステートレスだが、LINE Botの応答速度を考慮すると
// 1メッセージずつの逐次処理なので、Map管理で十分
// ============================================

interface ExpirySession {
  storeId: string;
  step: ExpiryStep;
  itemName?: string;
  expiryDate?: string;
  quantity?: string;
  createdAt: number;
}

// インメモリセッション（プロセス再起動で消える。入力途中のデータは失われるが許容範囲）
const sessions = new Map<string, ExpirySession>();

// 30分でセッション自動破棄
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// ============================================
// トリガー判定
// ============================================
export function isExpiryTrigger(message: string): boolean {
  const triggers = ["賞味期限", "消費期限", "期限管理", "期限登録"];
  return triggers.some((t) => message.includes(t));
}

// ============================================
// 賞味期限一覧トリガー判定
// ============================================
export function isExpiryListTrigger(message: string): boolean {
  const triggers = ["期限一覧", "期限リスト", "期限確認"];
  return triggers.some((t) => message.includes(t));
}

// ============================================
// セッション開始
// ============================================
export function startExpirySession(storeId: string): string {
  sessions.set(storeId, {
    storeId,
    step: "item_name",
    createdAt: Date.now(),
  });
  return "食材の賞味期限を登録します。\n\n食材名を入力してください（例: 鶏もも肉）";
}

// ============================================
// アクティブセッション取得
// ============================================
export function getActiveExpirySession(storeId: string): ExpirySession | null {
  const session = sessions.get(storeId);
  if (!session) return null;

  // タイムアウトチェック
  if (Date.now() - session.createdAt > SESSION_TIMEOUT_MS) {
    sessions.delete(storeId);
    return null;
  }
  return session;
}

// ============================================
// セッションキャンセル
// ============================================
export function cancelExpirySession(storeId: string): void {
  sessions.delete(storeId);
}

// ============================================
// 入力処理
// ============================================
export async function processExpiryInput(
  storeId: string,
  userInput: string
): Promise<{ done: boolean; message: string }> {
  const session = sessions.get(storeId);
  if (!session) {
    return { done: true, message: "セッションが見つかりません。「賞味期限」と送って再度お試しください。" };
  }

  switch (session.step) {
    case "item_name": {
      session.itemName = userInput.trim();
      session.step = "expiry_date";
      return {
        done: false,
        message: `「${session.itemName}」ですね。\n\n賞味期限を入力してください（例: 3/15, 2026-03-15, 3日後）`,
      };
    }

    case "expiry_date": {
      const parsed = parseJapaneseDate(userInput.trim());
      if (!parsed) {
        return {
          done: false,
          message: "日付を認識できませんでした。\n「3/15」「2026-03-15」「3日後」などの形式で入力してください。",
        };
      }
      session.expiryDate = parsed;
      session.step = "quantity";
      return {
        done: false,
        message: `期限: ${parsed}\n\n数量を入力してください（例: 3パック、2kg）\nスキップする場合は「なし」と送ってください。`,
      };
    }

    case "quantity": {
      const skip = ["なし", "スキップ", "ー", "-", "skip"].includes(userInput.trim().toLowerCase());
      session.quantity = skip ? undefined : userInput.trim();

      // 登録実行
      await createExpiryItem({
        storeId,
        itemName: session.itemName!,
        expiryDate: session.expiryDate!,
        quantity: session.quantity,
      });

      const quantityText = session.quantity ? `\n数量: ${session.quantity}` : "";
      const message = [
        `登録しました！`,
        ``,
        `食材: ${session.itemName}`,
        `期限: ${session.expiryDate}${quantityText}`,
        ``,
        `期限の2日前にお知らせします。`,
        `続けて登録する場合は「賞味期限」と送ってください。`,
      ].join("\n");

      sessions.delete(storeId);
      return { done: true, message };
    }

    default:
      sessions.delete(storeId);
      return { done: true, message: "" };
  }
}

// ============================================
// 賞味期限一覧メッセージ生成
// ============================================
export async function getExpiryListMessage(storeId: string): Promise<string> {
  const items = await getActiveExpiryItems(storeId);

  if (items.length === 0) {
    return "登録中の賞味期限はありません。\n「賞味期限」と送ると登録できます。";
  }

  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const todayStr = new Date(now.getTime() + jstOffset).toISOString().split("T")[0];

  const lines = items.map((item) => {
    const daysLeft = Math.ceil(
      (new Date(item.expiry_date).getTime() - new Date(todayStr).getTime()) / (24 * 60 * 60 * 1000)
    );
    const urgency = daysLeft <= 0 ? "【期限切れ】" : daysLeft <= 2 ? "【まもなく】" : "";
    const qty = item.quantity ? `（${item.quantity}）` : "";
    return `${urgency}${item.item_name}${qty} → ${item.expiry_date}（${daysLeft <= 0 ? "期限切れ" : `あと${daysLeft}日`}）`;
  });

  return [`賞味期限一覧（${items.length}件）`, "", ...lines, "", "「賞味期限」で新規登録できます。"].join("\n");
}

