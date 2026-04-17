// ============================================
// Claude API クライアント
// Anthropic SDK のラッパー。全ハンドラーから使う共通関数。
// モデルはここに集約し、変更時は1箇所だけ直せばいい。
// ============================================

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 使用モデル（設計書で指定されたモデル）
const MODEL = "claude-sonnet-4-20250514";

// システムプロンプト + ユーザーメッセージでClaudeを呼ぶ基本関数
// 意図分類: maxTokens: 20
// コンテンツ生成: maxTokens: 500（デフォルト）
export async function callClaude(params: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 500,
    system: params.systemPrompt,
    messages: [{ role: "user", content: params.userMessage }],
  });

  const content = message.content[0];
  if (content.type !== "text") return "";
  return content.text.trim();
}

// 画像 + テキストでClaudeを呼ぶ（Vision対応）
// オーナーが写真を送ってきた時のキャプション生成に使う
export async function callClaudeWithImage(params: {
  systemPrompt: string;
  userMessage: string;
  imageBase64: string;
  imageMimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  maxTokens?: number;
}): Promise<string> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: params.maxTokens ?? 500,
    system: params.systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.imageMimeType,
              data: params.imageBase64,
            },
          },
          { type: "text", text: params.userMessage },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== "text") return "";
  return content.text.trim();
}
