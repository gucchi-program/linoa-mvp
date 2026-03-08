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

// ============================================
// SNS投稿文生成
// 店舗情報と直近の日報データからSNS投稿文を生成
// ============================================
interface SnsPostInput {
  storeName: string;
  genre: string;
  latestMemo: string | null;
  request?: string; // ユーザーからのリクエスト（「ランチのPR」など）
}

export interface SnsPostOutput {
  instagram: string;
  twitter: string;
}

const SNS_SYSTEM_PROMPT = `あなたは飲食店のSNS運用を代行するプロのマーケターです。
店舗情報をもとに、Instagram用とX（Twitter）用の投稿文を作成してください。

## 出力形式（JSON）
{
  "instagram": "Instagram用の投稿文（改行・絵文字・ハッシュタグ10個以上を含む。200〜300文字）",
  "twitter": "X用の投稿文（140文字以内。ハッシュタグ3〜5個を含む）"
}

## ルール
- 実在の人名や具体的な住所は含めない
- お店の雰囲気が伝わる温かいトーンで書く
- 季節感を意識する
- ハッシュタグは日本語で、その業態の人が検索しそうなワードを選ぶ
- 「本日のおすすめ」「季節限定」など来店動機を作る表現を入れる
- JSON以外の文字列を出力しないこと`;

export async function generateSnsPost(input: SnsPostInput): Promise<SnsPostOutput> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][now.getDay()];

    const userMessage = [
      `## 店舗情報`,
      `店名: ${input.storeName}`,
      `業態: ${input.genre}`,
      `現在: ${month}月（${dayOfWeek}曜日）`,
      input.latestMemo ? `\n## 最近の所感\n${input.latestMemo}` : "",
      input.request ? `\n## オーナーからのリクエスト\n${input.request}` : "",
    ].join("\n");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SNS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in response");
    }

    const parsed = JSON.parse(textBlock.text) as SnsPostOutput;
    if (!parsed.instagram || !parsed.twitter) {
      throw new Error("Invalid response format");
    }
    return parsed;
  } catch (error) {
    console.error("SNS post generation error:", error);
    return {
      instagram: "投稿文の生成に失敗しました。もう一度お試しください。",
      twitter: "投稿文の生成に失敗しました。",
    };
  }
}

// ============================================
// POP用コピー生成
// 店頭POP・メニューボード用のキャッチコピーを生成
// ============================================
export interface PopCopyOutput {
  headline: string;    // メインコピー（短い、太字用）
  subtext: string;     // サブテキスト（補足説明）
  accent: string;      // アクセント色のテーマ（warm/cool/festive）
}

const POP_SYSTEM_PROMPT = `あなたは飲食店の販促物を作るプロのコピーライターです。
店頭POPやメニューボード用のキャッチコピーを作成してください。

## 出力形式（JSON）
{
  "headline": "メインコピー（10〜20文字、インパクトのある短文）",
  "subtext": "補足テキスト（20〜40文字、具体的な説明）",
  "accent": "テーマカラー（warm/cool/festive のいずれか）"
}

## accentの使い分け
- warm: 和食、居酒屋、カフェなど温かみのある業態（暖色系）
- cool: バー、モダンレストランなど洗練された業態（寒色系）
- festive: イベント、季節限定メニューなど華やかな場面（カラフル）

## ルール
- キャッチーで目を引く表現を使う
- お客さんの食欲や好奇心を刺激する言葉を選ぶ
- 季節感を意識する
- JSON以外の文字列を出力しないこと`;

export async function generatePopCopy(input: SnsPostInput): Promise<PopCopyOutput> {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;

    const userMessage = [
      `## 店舗情報`,
      `店名: ${input.storeName}`,
      `業態: ${input.genre}`,
      `季節: ${month}月`,
      input.request ? `\n## オーナーからのリクエスト\n${input.request}` : "",
    ].join("\n");

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 512,
      system: POP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text in response");
    }

    const parsed = JSON.parse(textBlock.text) as PopCopyOutput;
    if (!parsed.headline || !parsed.subtext) {
      throw new Error("Invalid response format");
    }
    return parsed;
  } catch (error) {
    console.error("POP copy generation error:", error);
    return {
      headline: "本日のおすすめ",
      subtext: "スタッフイチオシの一品をご用意しました",
      accent: "warm",
    };
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
