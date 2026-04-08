// ============================================
// 顧客情報照会ハンドラー
// 「田中さんの情報」→ customer_notesを検索して返答
// 名前の部分一致で検索するため「田中」で「田中太郎」も引っかかる
// ============================================

import { callClaude } from "@/lib/ai/client";
import { findCustomerNotes } from "@/lib/db";
import type { Store } from "@/types";

// メッセージから検索したい名前を抽出する（簡易実装）
// 「田中さんの情報」「田中さんって何好きだっけ」→「田中」
async function extractCustomerName(message: string): Promise<string> {
  const raw = await callClaude({
    systemPrompt:
      "メッセージから検索したい顧客の名前だけを返してください。敬称（さん・様・氏）は除く。名前のみを返してください。",
    userMessage: message,
    maxTokens: 20,
  });
  return raw.trim();
}

export async function handleCustomerQuery(store: Store, message: string): Promise<string> {
  let name: string;
  try {
    name = await extractCustomerName(message);
  } catch {
    return "お名前が読み取れませんでした。「田中さんの情報」のように送ってもらえますか？";
  }

  if (!name) {
    return "検索するお客様のお名前を教えてください。";
  }

  const results = await findCustomerNotes(store.id, name);

  if (results.length === 0) {
    return `「${name}」さんの情報はまだ登録されていません。\n情報を登録する場合は「${name}さんは〜」と送ってください。`;
  }

  // 複数ヒットした場合は全件返す
  return results
    .map((c) => {
      const lines = [`【${c.customer_name}さん】`];
      if (c.visit_count > 0) lines.push(`来店回数: ${c.visit_count}回`);
      if (c.last_visit) lines.push(`最終来店: ${c.last_visit}`);
      if (c.birthday) lines.push(`誕生日: ${c.birthday}`);

      const notes = c.notes as Record<string, string>;
      const labelMap: Record<string, string> = {
        preferences: "好み",
        allergies: "アレルギー",
        memo: "メモ",
      };
      Object.entries(notes).forEach(([k, v]) => {
        lines.push(`${labelMap[k] ?? k}: ${v}`);
      });

      return lines.join("\n");
    })
    .join("\n\n");
}
