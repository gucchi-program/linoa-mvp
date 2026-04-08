// ============================================
// 売上入力ハンドラー
// 「今日18万52人」のような自然言語をパースしてdaily_salesに保存する。
// 保存後は当日の記録サマリーと今月累計を返信する。
// ============================================

import { callClaude } from "@/lib/ai/client";
import { buildSalesParserPrompt } from "@/lib/ai/prompts/sales-parser";
import { upsertDailySale, getMonthlySummary } from "@/lib/db";
import { getTodayJst, formatDateJa, formatCurrency } from "@/lib/utils";
import type { Store } from "@/types";

// Claudeが返すJSONの型
interface ParsedSales {
  revenue: number | null;
  customer_count: number | null;
  date: string;
  memo: string | null;
}

export async function handleSalesInput(store: Store, message: string): Promise<string> {
  const today = getTodayJst();

  // Claude APIで自然言語 → JSON変換
  let parsed: ParsedSales;
  try {
    const raw = await callClaude({
      systemPrompt: buildSalesParserPrompt(today),
      userMessage: message,
      maxTokens: 200,
    });

    // コードブロック記法が混入した場合に除去する
    const cleaned = raw.replace(/```json\n?|\```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error("sales parse error:", e);
    return "すみません、うまく読み取れませんでした。\n「今日18万、52人」のような形式で送ってもらえますか？";
  }

  // revenue も customer_count もない場合はパース失敗とみなす
  if (parsed.revenue == null && parsed.customer_count == null) {
    return "売上か客数の情報が読み取れませんでした。\n「今日18万、52人」のような形式で送ってもらえますか？";
  }

  // DBに保存（同日2回目は上書き）
  try {
    await upsertDailySale({
      storeId: store.id,
      date: parsed.date ?? today,
      revenue: parsed.revenue,
      customerCount: parsed.customer_count,
      memo: parsed.memo,
    });
  } catch {
    return "保存中にエラーが発生しました。もう一度お試しください。";
  }

  // 今月のサマリーを取得
  const [year, month] = (parsed.date ?? today).split("-").map(Number);
  const summary = await getMonthlySummary(store.id, year, month);

  // 返信メッセージを組み立てる
  const lines: string[] = [];
  lines.push(`記録しました！`);
  lines.push(``);
  lines.push(`--- ${formatDateJa(parsed.date ?? today)} ---`);

  if (parsed.revenue != null) {
    lines.push(`売上：${formatCurrency(parsed.revenue)}`);
  }
  if (parsed.customer_count != null) {
    lines.push(`客数：${parsed.customer_count}人`);
  }
  if (parsed.revenue != null && parsed.customer_count != null && parsed.customer_count > 0) {
    const avgSpend = Math.round(parsed.revenue / parsed.customer_count);
    lines.push(`客単価：${formatCurrency(avgSpend)}`);
  }
  if (parsed.memo) {
    lines.push(`メモ：${parsed.memo}`);
  }

  if (summary.businessDays > 0) {
    lines.push(``);
    lines.push(`今月累計`);
    lines.push(`売上：${formatCurrency(summary.totalRevenue)}`);
    lines.push(`営業：${summary.businessDays}日`);
    if (summary.totalCustomers > 0) {
      lines.push(`客数：${summary.totalCustomers}人`);
    }
  }

  return lines.join("\n");
}
