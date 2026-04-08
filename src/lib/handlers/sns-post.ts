// ============================================
// SNS投稿生成ハンドラー
// オーナーのリクエストからInstagram/X用の投稿案を生成する。
// 返信はFlex Message（カード型）で送り、「OK」「別案」ボタンを表示する。
// 生成した投稿案はgenerated_contentsに保存（status: draft）。
// ============================================

import { callClaude } from "@/lib/ai/client";
import { buildSystemPrompt } from "@/lib/ai/store-profile";
import { SNS_POST_SYSTEM_SUFFIX } from "@/lib/ai/prompts/sns-post";
import { buildSnsPostFlex } from "@/lib/flex-templates";
import { saveGeneratedContent } from "@/lib/db";
import type { Store, LineMessage } from "@/types";

// SNS投稿ハンドラーはFlex Messageを返すため、
// 他のハンドラーと異なりstring[]ではなくLineMessage[]を返す
export async function handleSnsPost(
  store: Store,
  message: string
): Promise<LineMessage[]> {
  // 店舗プロファイル + SNS生成ルールを合わせたSystem Promptを構築
  const systemPrompt = buildSystemPrompt(store) + SNS_POST_SYSTEM_SUFFIX;

  let instagram = "";
  let twitter = "";

  try {
    const raw = await callClaude({
      systemPrompt,
      userMessage: message,
      maxTokens: 600,
    });

    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    instagram = parsed.instagram ?? "";
    twitter = parsed.twitter ?? "";
  } catch (e) {
    console.error("sns-post parse error:", e);
    return [
      {
        type: "text",
        text: "投稿案の生成中にエラーが発生しました。もう一度お試しください。",
      },
    ];
  }

  if (!instagram && !twitter) {
    return [{ type: "text", text: "投稿案を生成できませんでした。もう少し詳しく教えてもらえますか？" }];
  }

  // 生成した投稿案をDBに保存
  await saveGeneratedContent({
    storeId: store.id,
    contentType: "sns_post",
    inputText: message,
    generatedText: JSON.stringify({ instagram, twitter }),
    platform: "instagram,twitter",
  });

  // Flex Messageで投稿案を返す
  return [
    {
      type: "flex",
      altText: "SNS投稿案を作成しました",
      contents: buildSnsPostFlex(instagram, twitter),
    },
  ];
}
