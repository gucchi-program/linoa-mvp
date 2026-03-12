import Anthropic from "@anthropic-ai/sdk";
import { getDailyReports, getRecentContexts } from "./db";

// AI施策提案エンジン
// 日報データのパターンを分析し、具体的なアクション提案を生成する

const anthropic = new Anthropic();
const MODEL = "claude-sonnet-4-20250514";

interface SuggestionInput {
  storeId: string;
  storeName: string;
  genre: string;
}

export interface Suggestion {
  trigger: string;   // 提案のきっかけ（「売上が前週比20%減」等）
  suggestion: string; // 具体的なアクション提案
  priority: "high" | "medium" | "low";
}

const SUGGESTION_SYSTEM_PROMPT = `あなたは「Linoa（リノア）」、個人経営の飲食店向けAI経営秘書です。
日報データを分析し、オーナーが今すぐ実行できる具体的なアクション提案を生成してください。

## 出力形式（JSON配列）
[
  {
    "trigger": "提案のきっかけとなったデータの事実（1文）",
    "suggestion": "具体的なアクション提案（2〜3文）",
    "priority": "high/medium/low"
  }
]

## 提案のパターン例
- 売上が前週比で大幅減 → 集客施策の提案
- 特定曜日に客数が少ない → その曜日限定の施策
- 天候と売上の相関 → 雨の日対策
- 客単価が下がっている → メニュー構成の見直し
- 予約数が増えている → 予約特典の提案
- 所感から読み取れる課題 → 具体的な解決策

## ルール
- 提案は最大3つまで（本当に有用なものだけ）
- 「来週の月曜に試してみませんか？」のように実行タイミングまで提案する
- データが少ない場合は無理に提案しない（空配列を返してOK）
- JSON以外の文字列を出力しないこと
- 親しみやすいトーンで、オーナーの味方として書く`;

export async function generateSuggestions(input: SuggestionInput): Promise<Suggestion[]> {
  try {
    // 直近30日の日報を取得
    const reports = await getDailyReports(input.storeId, 30);

    // 最低5日分のデータがないと分析の精度が低い
    if (reports.length < 5) return [];

    // 抽出コンテキスト（蓄積知識）を取得
    const contexts = await getRecentContexts(input.storeId, 15);

    // 前週・今週の分析データを構築
    const now = new Date();
    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];
    const nowStr = now.toISOString().split("T")[0];

    const thisWeek = reports.filter((r) => r.report_date > weekAgoStr && r.report_date <= nowStr);
    const lastWeek = reports.filter((r) => r.report_date > twoWeeksAgoStr && r.report_date <= weekAgoStr);

    // 曜日別統計
    const dayStats: Record<string, { revenue: number[]; customers: number[] }> = {};
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    for (const r of reports) {
      const d = new Date(r.report_date + "T00:00:00");
      const day = dayNames[d.getDay()];
      if (!dayStats[day]) dayStats[day] = { revenue: [], customers: [] };
      dayStats[day].revenue.push(r.revenue ?? 0);
      dayStats[day].customers.push(r.customer_count ?? 0);
    }

    // テキスト形式に整形
    const reportLines = reports.slice(-14).map((r) => {
      const parts = [r.report_date];
      if (r.weather) parts.push(`天気:${r.weather}`);
      if (r.revenue !== null) parts.push(`売上:${r.revenue.toLocaleString()}円`);
      if (r.customer_count !== null) parts.push(`客数:${r.customer_count}人`);
      if (r.memo) parts.push(`所感:${r.memo}`);
      return parts.join(" / ");
    });

    const thisWeekRevenue = thisWeek.reduce((s, r) => s + (r.revenue ?? 0), 0);
    const lastWeekRevenue = lastWeek.reduce((s, r) => s + (r.revenue ?? 0), 0);
    const thisWeekCustomers = thisWeek.reduce((s, r) => s + (r.customer_count ?? 0), 0);
    const lastWeekCustomers = lastWeek.reduce((s, r) => s + (r.customer_count ?? 0), 0);

    const dayStatsLines = Object.entries(dayStats).map(([day, s]) => {
      const avgRev = Math.round(s.revenue.reduce((a, b) => a + b, 0) / s.revenue.length);
      const avgCust = Math.round(s.customers.reduce((a, b) => a + b, 0) / s.customers.length);
      return `${day}: 平均売上${avgRev.toLocaleString()}円, 平均客数${avgCust}人（${s.revenue.length}日分）`;
    });

    const contextLines = contexts.map((c) => `- [${c.context_type}] ${c.content}`);

    const userMessage = [
      `## 店舗情報`,
      `店名: ${input.storeName}`,
      `業態: ${input.genre}`,
      "",
      `## 今週 vs 前週`,
      `今週売上: ${thisWeekRevenue.toLocaleString()}円（${thisWeek.length}日分）`,
      `前週売上: ${lastWeekRevenue.toLocaleString()}円（${lastWeek.length}日分）`,
      `今週客数: ${thisWeekCustomers}人`,
      `前週客数: ${lastWeekCustomers}人`,
      "",
      `## 曜日別統計`,
      ...dayStatsLines,
      "",
      `## 直近14日の日報`,
      ...reportLines,
      ...(contextLines.length > 0 ? ["", "## 蓄積情報", ...contextLines] : []),
    ].join("\n");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SUGGESTION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return [];

    const parsed = JSON.parse(textBlock.text) as Suggestion[];
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((s) => s.trigger && s.suggestion && s.priority);
  } catch (error) {
    console.error("AI suggestion error:", error);
    return [];
  }
}
