import Anthropic from "@anthropic-ai/sdk";
import type { MemoAnalysis } from "@/types";

// Anthropic SDK クライアント
// 環境変数 ANTHROPIC_API_KEY を自動で読み取る
const anthropic = new Anthropic();

// コスト効率重視でSonnetを使用
const MODEL = "claude-sonnet-4-20250514";

// ============================================
// システムプロンプト
// 居酒屋経営アドバイザー「Linoa」として所感を分析し、
// JSON形式で構造化データ + フィードバックを返す
// ============================================
const SYSTEM_PROMPT = `あなたは「Linoa（リノア）」という名前の、個人経営の飲食店向けAI経営アドバイザーです。
オーナーが入力した日報の所感を分析し、以下のJSON形式で返してください。

## 出力形式（JSON）
{
  "feedback": "オーナーへの短いフィードバックコメント（2〜3文）",
  "extracted_contexts": [
    {
      "context_type": "タグ名",
      "content": "抽出した情報の要約"
    }
  ]
}

## context_typeのタグ一覧
- customer_info: 常連客・新規客に関する情報（例: 「常連の佐藤さんが友達3人連れてきた」）
- staff_info: スタッフに関する情報（例: 「新人バイトが入った」「田中が体調不良で休み」）
- menu_feedback: メニューに対する反応（例: 「新メニューのもつ鍋が好評」）
- external_factor: 外部要因（例: 「近くでイベントがあった」「雨で客足が鈍い」）
- operational_issue: 運営上の課題（例: 「仕入れが遅れた」「エアコン故障」）
- positive_signal: ポジティブなシグナル（例: 「満席になった」「リピーター増加」）

## ルール
- feedbackは親しみやすく、具体的なアドバイスや気づきを含める
- extracted_contextsは所感から読み取れる情報のみ（無理に全タグを埋めない）
- 所感が短い・情報が少ない場合はextracted_contextsを空配列にしてよい
- JSON以外の文字列を出力しないこと`;

// ============================================
// 所感分析
// Claude APIに所感テキストを送り、構造化データを取得
// タイムアウト・エラー時はフォールバックを返す
// ============================================
export async function analyzeMemo(
  memo: string,
  context?: { customerCount: number; revenue: number; reservationCount: number }
): Promise<MemoAnalysis> {
  try {
    // ユーザーメッセージに数値コンテキストを付加
    let userMessage = `## 本日の数値\n`;
    if (context) {
      userMessage += `- 客数: ${context.customerCount}人\n`;
      userMessage += `- 売上: ${context.revenue.toLocaleString()}円\n`;
      userMessage += `- 予約件数: ${context.reservationCount}件\n\n`;
    }
    userMessage += `## オーナーの所感\n${memo}`;

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    // テキストブロックからJSON抽出
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return fallbackAnalysis();
    }

    const parsed = JSON.parse(textBlock.text) as MemoAnalysis;

    // 最低限のバリデーション
    if (!parsed.feedback || !Array.isArray(parsed.extracted_contexts)) {
      return fallbackAnalysis();
    }

    return parsed;
  } catch (error) {
    console.error("Claude API error:", error);
    return fallbackAnalysis();
  }
}

// ============================================
// フォールバック
// APIエラー時でも日報保存は完了させる
// ============================================
function fallbackAnalysis(): MemoAnalysis {
  return {
    feedback: "所感を記録しました。引き続き頑張っていきましょう！",
    extracted_contexts: [],
  };
}

// ============================================
// 週次レポート生成
// 1週間分の日報データをClaude APIに渡し、
// 売上トレンド分析と改善提案を生成する
// ============================================
interface WeeklyReportInput {
  storeName: string;
  genre: string;
  startDate: string;
  endDate: string;
  reports: {
    report_date: string;
    revenue: number | null;
    customer_count: number | null;
    reservation_count: number | null;
    weather: string | null;
    memo: string | null;
  }[];
}

interface WeeklyReportOutput {
  summary: string;
  advice: string;
}

const WEEKLY_SYSTEM_PROMPT = `あなたは「Linoa（リノア）」という名前の、個人経営の飲食店向けAI経営アドバイザーです。
1週間分の日報データを分析し、以下のJSON形式で週次レポートを作成してください。

## 出力形式（JSON）
{
  "summary": "今週の振り返りサマリー（3〜5行程度）",
  "advice": "来週に向けた具体的なアドバイス（3〜5行程度）"
}

## summaryに含める内容
- 総売上・平均売上・前週比（前週データがある場合）
- 客数のトレンド（増減傾向）
- 天候と売上の関連性（天候データがある場合）
- 特に良かった日・悪かった日のハイライト

## adviceに含める内容
- データから読み取れる具体的な改善ポイント
- 曜日別の傾向に基づく施策提案
- オーナーの所感から読み取れる課題への対応策
- 来週試してみてほしいアクション（1つ具体的に）

## ルール
- 親しみやすく、具体的で実行可能なアドバイスを心がける
- 数字を使って客観的に分析する
- ネガティブな指摘も前向きな提案とセットにする
- JSON以外の文字列を出力しないこと`;

export async function generateWeeklyReport(
  input: WeeklyReportInput
): Promise<WeeklyReportOutput> {
  try {
    // 日報データをテキスト形式に整形
    const reportLines = input.reports.map((r) => {
      const parts = [`${r.report_date}`];
      if (r.weather) parts.push(`天気:${r.weather}`);
      if (r.revenue !== null) parts.push(`売上:${r.revenue.toLocaleString()}円`);
      if (r.customer_count !== null) parts.push(`客数:${r.customer_count}人`);
      if (r.reservation_count !== null) parts.push(`予約:${r.reservation_count}件`);
      if (r.memo) parts.push(`所感:${r.memo}`);
      return parts.join(" / ");
    });

    const userMessage = [
      `## 店舗情報`,
      `店名: ${input.storeName}`,
      `業態: ${input.genre}`,
      `期間: ${input.startDate} 〜 ${input.endDate}`,
      ``,
      `## 日報データ（${input.reports.length}日分）`,
      ...reportLines,
    ].join("\n");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: WEEKLY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return fallbackWeeklyReport(input);
    }

    const parsed = JSON.parse(textBlock.text) as WeeklyReportOutput;
    if (!parsed.summary || !parsed.advice) {
      return fallbackWeeklyReport(input);
    }

    return parsed;
  } catch (error) {
    console.error("Weekly report generation error:", error);
    return fallbackWeeklyReport(input);
  }
}

function fallbackWeeklyReport(input: WeeklyReportInput): WeeklyReportOutput {
  const totalRevenue = input.reports.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
  const totalCustomers = input.reports.reduce((sum, r) => sum + (r.customer_count ?? 0), 0);

  return {
    summary: [
      `今週は${input.reports.length}日分の日報が記録されました。`,
      `総売上: ${totalRevenue.toLocaleString()}円`,
      `総客数: ${totalCustomers}人`,
    ].join("\n"),
    advice: "日報データが蓄積されるほど、より具体的な分析ができるようになります。引き続き日報入力を続けていきましょう！",
  };
}
