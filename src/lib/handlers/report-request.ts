// ============================================
// レポートリクエストハンドラー
// 「今月の売上」「先週どうだった」→ 集計 + グラフ画像を返す
// テキストサマリーとQuickChartグラフ画像をセットで返信する
// ============================================

import { getDailySalesRange } from "@/lib/db";
import { buildSalesChartUrl } from "@/lib/chart/quickchart";
import { getTodayJst, formatCurrency } from "@/lib/utils";
import type { Store, LineMessage } from "@/types";

// メッセージのキーワードから集計期間を決定する
function detectPeriod(message: string): { from: string; to: string; label: string } {
  const today = getTodayJst();
  const [y, m] = today.split("-").map(Number);

  // 今月
  if (/今月/.test(message)) {
    const from = `${y}-${String(m).padStart(2, "0")}-01`;
    return { from, to: today, label: `${m}月の売上` };
  }

  // 先月
  if (/先月/.test(message)) {
    const pm = m === 1 ? 12 : m - 1;
    const py = m === 1 ? y - 1 : y;
    const from = `${py}-${String(pm).padStart(2, "0")}-01`;
    const to = `${y}-${String(m).padStart(2, "0")}-01`;
    return { from, to, label: `${pm}月の売上` };
  }

  // 先週（直近7日）
  if (/先週|最近|直近/.test(message)) {
    const d = new Date(today + "T00:00:00+09:00");
    d.setDate(d.getDate() - 7);
    const from = d.toISOString().split("T")[0];
    return { from, to: today, label: "直近7日の売上" };
  }

  // デフォルト: 今月
  const from = `${y}-${String(m).padStart(2, "0")}-01`;
  return { from, to: today, label: `${m}月の売上` };
}

export async function handleReportRequest(
  store: Store,
  message: string
): Promise<LineMessage[]> {
  const { from, to, label } = detectPeriod(message);
  const records = await getDailySalesRange(store.id, from, to);

  if (records.length === 0) {
    return [{ type: "text", text: `${label}のデータがまだありません。\n売上を記録すると、ここでレポートを確認できます。` }];
  }

  // 集計
  const totalRevenue = records.reduce((s, r) => s + (r.revenue ?? 0), 0);
  const totalCustomers = records.reduce((s, r) => s + (r.customer_count ?? 0), 0);
  const businessDays = records.filter((r) => r.revenue != null).length;
  const avgRevenue = businessDays > 0 ? Math.round(totalRevenue / businessDays) : 0;
  const avgSpend =
    totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  // テキストサマリー
  const lines = [
    `📊 ${label}`,
    ``,
    `売上合計: ${formatCurrency(totalRevenue)}`,
    `営業日数: ${businessDays}日`,
    `日平均: ${formatCurrency(avgRevenue)}`,
  ];
  if (totalCustomers > 0) {
    lines.push(`客数合計: ${totalCustomers}人`);
    lines.push(`客単価: ${formatCurrency(avgSpend)}`);
  }
  const summaryText = lines.join("\n");

  // グラフ用データ（売上がある日のみ）
  const chartData = records.filter((r) => r.revenue != null);
  const labels = chartData.map((r) => {
    const [, mm, dd] = r.date.split("-");
    return `${Number(mm)}/${Number(dd)}`;
  });
  const revenues = chartData.map((r) => r.revenue ?? 0);

  const chartUrl = buildSalesChartUrl({ labels, revenues });

  return [
    { type: "text", text: summaryText },
    {
      type: "image",
      originalContentUrl: chartUrl,
      previewImageUrl: chartUrl,
    },
  ];
}
