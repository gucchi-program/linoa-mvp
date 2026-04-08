// ============================================
// 在庫・仕入れメモハンドラー
// 「鶏肉20kg入荷」→ inventory_logsに追記
// 追記型なので同じ食材のレコードが複数あっても問題ない
// ============================================

import { callClaude } from "@/lib/ai/client";
import { INVENTORY_PARSER_PROMPT } from "@/lib/ai/prompts/inventory-parser";
import { saveInventoryLog } from "@/lib/db";
import type { Store } from "@/types";

interface ParsedInventory {
  item_name: string;
  quantity: number | null;
  unit: string | null;
  action: "received" | "used" | "note" | "waste" | null;
  memo: string | null;
}

const ACTION_LABELS: Record<string, string> = {
  received: "入荷",
  used: "使用",
  waste: "廃棄",
  note: "メモ",
};

export async function handleInventory(store: Store, message: string): Promise<string> {
  let parsed: ParsedInventory;
  try {
    const raw = await callClaude({
      systemPrompt: INVENTORY_PARSER_PROMPT,
      userMessage: message,
      maxTokens: 150,
    });
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("inventory parse error:", e);
    return "すみません、うまく読み取れませんでした。\n「鶏肉20kg入荷」のような形式で送ってもらえますか？";
  }

  if (!parsed.item_name) {
    return "食材名が読み取れませんでした。もう一度教えてください。";
  }

  try {
    await saveInventoryLog({
      storeId: store.id,
      itemName: parsed.item_name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      action: parsed.action,
      memo: parsed.memo,
    });
  } catch {
    return "保存中にエラーが発生しました。もう一度お試しください。";
  }

  const actionLabel = ACTION_LABELS[parsed.action ?? "note"] ?? "記録";
  const quantityStr =
    parsed.quantity != null && parsed.unit
      ? ` ${parsed.quantity}${parsed.unit}`
      : parsed.quantity != null
      ? ` ${parsed.quantity}`
      : "";

  const lines = [`記録しました`, `${parsed.item_name}${quantityStr}　${actionLabel}`];
  if (parsed.memo) lines.push(`メモ: ${parsed.memo}`);

  return lines.join("\n");
}
