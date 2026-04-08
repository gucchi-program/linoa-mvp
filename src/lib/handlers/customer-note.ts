// ============================================
// 顧客メモ登録ハンドラー
// 「田中さんは赤ワイン好き」→ customer_notesにUPSERT
// 同名顧客が既にいれば既存notesにマージする
// ============================================

import { callClaude } from "@/lib/ai/client";
import { CUSTOMER_PARSER_PROMPT } from "@/lib/ai/prompts/customer-parser";
import { upsertCustomerNote } from "@/lib/db";
import type { Store } from "@/types";

interface ParsedCustomer {
  customer_name: string;
  notes: Record<string, string>;
}

export async function handleCustomerNote(store: Store, message: string): Promise<string> {
  let parsed: ParsedCustomer;
  try {
    const raw = await callClaude({
      systemPrompt: CUSTOMER_PARSER_PROMPT,
      userMessage: message,
      maxTokens: 200,
    });
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("customer-note parse error:", e);
    return "すみません、うまく読み取れませんでした。\n「田中さんは赤ワイン好き」のような形式で送ってもらえますか？";
  }

  if (!parsed.customer_name) {
    return "お客様のお名前が読み取れませんでした。もう一度教えてください。";
  }

  try {
    await upsertCustomerNote({
      storeId: store.id,
      customerName: parsed.customer_name,
      notesUpdate: parsed.notes ?? {},
    });
  } catch {
    return "保存中にエラーが発生しました。もう一度お試しください。";
  }

  const notesSummary = Object.entries(parsed.notes ?? {})
    .map(([k, v]) => {
      const labels: Record<string, string> = {
        preferences: "好み",
        allergies: "アレルギー",
        birthday: "誕生日",
        memo: "メモ",
      };
      return `${labels[k] ?? k}: ${v}`;
    })
    .join("、");

  return `${parsed.customer_name}さんの情報を保存しました。\n${notesSummary}`;
}
