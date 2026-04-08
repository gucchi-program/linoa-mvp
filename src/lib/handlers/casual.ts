// ============================================
// 雑談・経営相談ハンドラー
// 挨拶・雑談・経営相談・その他分類不能なメッセージを処理する。
// 店舗プロファイルをSystem Promptに注入して「この店のAI秘書」として応答する。
// ============================================

import { callClaude } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/store-profile";
import type { Store } from "@/types";

export async function handleCasual(store: Store, message: string): Promise<string> {
  const systemPrompt = buildSystemPrompt(store);

  try {
    return await callClaude({
      systemPrompt,
      userMessage: message,
      maxTokens: 500,
    });
  } catch (error) {
    console.error("handleCasual error:", error);
    return "少し混み合っています。1分後にもう一度お試しください。";
  }
}
