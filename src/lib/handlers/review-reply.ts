// ============================================
// 口コミ返信生成ハンドラー
// オーナーが口コミテキストをLINEに貼り付けると返信案を生成する。
// 店舗プロファイルを注入して、この店らしいトーンで返信する。
// 生成結果はgenerated_contentsに保存（status: draft）。
// ============================================

import { callClaude } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/store-profile";
import { REVIEW_REPLY_SYSTEM_SUFFIX } from "@/lib/ai/prompts/review-reply";
import { saveGeneratedContent } from "@/lib/db";
import type { Store } from "@/types";

export async function handleReviewReply(store: Store, message: string): Promise<string> {
  const systemPrompt = buildSystemPrompt(store) + REVIEW_REPLY_SYSTEM_SUFFIX;

  let replyDraft: string;
  try {
    replyDraft = await callClaude({
      systemPrompt,
      userMessage: `以下の口コミへの返信案を作成してください。\n\n${message}`,
      maxTokens: 300,
    });
  } catch (e) {
    console.error("review-reply error:", e);
    return "少し混み合っています。1分後にもう一度お試しください。";
  }

  // 生成した返信案を保存
  await saveGeneratedContent({
    storeId: store.id,
    contentType: "review_reply",
    inputText: message,
    generatedText: replyDraft,
    platform: "google_business",
  });

  return `【返信案】\n\n${replyDraft}\n\n─\nそのままコピーして使えます。\n「別の案を作って」で別パターンも生成できます。`;
}
