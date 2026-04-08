// ============================================
// 意図分類モジュール
// オーナーのメッセージをClaude APIで9カテゴリに分類する。
// max_tokens: 20 で軽量に呼ぶ（カテゴリ名だけ返させる）。
// 分類失敗・不明な場合は 'casual' にフォールバックする。
// ============================================

import { callClaude } from "./client";
import type { MessageIntent } from "@/types";

const VALID_INTENTS: MessageIntent[] = [
  "sns_post_request",
  "sales_input",
  "customer_note",
  "customer_query",
  "inventory",
  "review_reply_request",
  "report_request",
  "question",
  "casual",
];

// 設計書に記載されている意図分類プロンプト
const CLASSIFIER_SYSTEM_PROMPT = `あなたは飲食店オーナー向けAIアシスタント「Linoa」のメッセージ分類器です。
以下のメッセージを読み、最も適切なカテゴリを1つだけ返してください。

カテゴリ:
- sns_post_request: SNSやGoogleに投稿したい、おすすめメニューの紹介依頼、「投稿作って」等
- sales_input: 売上、客数、客単価に関する数値の報告。「今日○万」「○人来た」等
- customer_note: 常連客やお客さんに関するメモ・情報の記録。「田中さんは〜」等
- customer_query: 特定の顧客の情報を知りたい。「田中さんの情報」「田中さんって何好きだっけ」等
- inventory: 食材の入荷、在庫、仕入れに関する情報。「鶏肉20kg入荷」「あと5kg」等
- review_reply_request: 口コミへの返信を作ってほしい。口コミテキストが含まれる場合も
- report_request: 売上レポートやサマリーを見たい。「今月の売上」「先週どうだった」等
- question: 経営やオペレーションに関する質問・相談。「値上げすべき？」等
- casual: 挨拶、雑談、お礼、その他

カテゴリ名のみを返してください。余計な文章は不要です。`;

export async function classifyIntent(message: string): Promise<MessageIntent> {
  try {
    const result = await callClaude({
      systemPrompt: CLASSIFIER_SYSTEM_PROMPT,
      userMessage: message,
      maxTokens: 20,
    });

    const intent = result.trim().toLowerCase() as MessageIntent;

    if (VALID_INTENTS.includes(intent)) {
      return intent;
    }

    // Claudeが想定外の文字列を返した場合のフォールバック
    console.warn(`classifyIntent: 不明なカテゴリ "${result}"、casualにフォールバック`);
    return "casual";
  } catch (error) {
    // API障害時はエラーを伝播させず、casualにフォールバック
    console.error("classifyIntent error:", error);
    return "casual";
  }
}
