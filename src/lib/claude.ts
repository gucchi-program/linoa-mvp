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
