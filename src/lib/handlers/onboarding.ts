// ============================================
// オンボーディングハンドラー
// stores.onboarding_completed が false の店舗からのメッセージを処理する。
// Claude API で店舗情報を構造化抽出し、必須項目（店名＋業態）が
// 揃ったタイミングで onboarding_completed を true に更新する。
// ============================================

import { callClaude } from "@/lib/ai/client";
import { updateStore } from "@/lib/db";
import { buildOnboardingExtractorPrompt } from "@/lib/ai/prompts/onboarding-extractor";
import { buildOnboardingGuideFlex } from "@/lib/flex-templates";
import type { Store, LineMessage } from "@/types";

// Claudeが返すJSONの型
interface ExtractedProfile {
  store_name: string | null;
  store_type: string | null;
  area: string | null;
  seat_count: number | null;
  price_range: string | null;
  years_in_business: number | null;
  specialty: string | null;
  customer_profile: string | null;
  owner_name: string | null;
}

// 確定意思を示す返答パターン（「OK」「はい」など）
const CONFIRM_PATTERN = /^(ok|オーケー|はい|よろしく|大丈夫|だいじょうぶ|お願いします|完了|これで|それで)$/i;

export async function handleOnboarding(
  store: Store,
  message: string
): Promise<LineMessage[]> {
  // 既に必須項目が揃っている状態で「OK」等が来たら即完了
  if (CONFIRM_PATTERN.test(message.trim()) && store.store_name && store.store_type) {
    return await completeOnboarding(store);
  }

  // Claude API で構造化抽出
  let extracted: ExtractedProfile;
  try {
    const raw = await callClaude({
      systemPrompt: buildOnboardingExtractorPrompt(),
      userMessage: message,
      maxTokens: 400,
    });
    const cleaned = raw.replace(/```json\n?|```/g, "").trim();
    extracted = JSON.parse(cleaned);
  } catch (e) {
    console.error("onboarding extract error:", e);
    return [{
      type: "text",
      text:
        "うまく読み取れませんでした。もう少しだけ詳しく教えてください。\n\n" +
        "例：「宝塚で15年やってる居酒屋『鳥源』。20席で、唐揚げと日本酒が自慢」",
    }];
  }

  // 既存値がnullのものだけ更新する（同じ項目を上書きしない）
  const updates: Partial<Store> = {};
  if (extracted.store_name && !store.store_name) updates.store_name = extracted.store_name;
  if (extracted.store_type && !store.store_type) updates.store_type = extracted.store_type;
  if (extracted.area && !store.area) updates.area = extracted.area;
  if (extracted.seat_count != null && store.seat_count == null) updates.seat_count = extracted.seat_count;
  if (extracted.price_range && !store.price_range) updates.price_range = extracted.price_range;
  if (extracted.years_in_business != null && store.years_in_business == null) {
    updates.years_in_business = extracted.years_in_business;
  }
  if (extracted.specialty && !store.specialty) updates.specialty = extracted.specialty;
  if (extracted.customer_profile && !store.customer_profile) {
    updates.customer_profile = extracted.customer_profile;
  }
  if (extracted.owner_name && !store.owner_name) updates.owner_name = extracted.owner_name;

  if (Object.keys(updates).length > 0) {
    await updateStore(store.id, updates);
  }

  // マージ後のプロファイルで必須項目チェック
  const merged: Store = { ...store, ...updates } as Store;
  const missing: string[] = [];
  if (!merged.store_name) missing.push("店名");
  if (!merged.store_type) missing.push("業態（居酒屋・イタリアン等）");

  if (missing.length === 0) {
    return await completeOnboarding(merged);
  }

  // 不足項目がある場合: 把握できた情報のサマリ + 不足項目の質問
  const lines: string[] = ["ありがとうございます！"];

  const summarized: string[] = [];
  if (updates.store_name) summarized.push(`・店名：${updates.store_name}`);
  if (updates.store_type) summarized.push(`・業態：${updates.store_type}`);
  if (updates.area) summarized.push(`・エリア：${updates.area}`);
  if (updates.seat_count) summarized.push(`・席数：${updates.seat_count}席`);
  if (updates.years_in_business) summarized.push(`・営業年数：${updates.years_in_business}年`);
  if (updates.specialty) summarized.push(`・こだわり：${updates.specialty}`);

  if (summarized.length > 0) {
    lines.push("");
    lines.push("把握した情報：");
    lines.push(...summarized);
  }

  lines.push("");
  lines.push(`もう少しだけ、${missing.join("と")}を教えてもらえますか？`);

  return [{ type: "text", text: lines.join("\n") }];
}

// オンボーディング完了処理: フラグ更新 + 完了メッセージ
async function completeOnboarding(store: Store): Promise<LineMessage[]> {
  await updateStore(store.id, { onboarding_completed: true });

  const greeting = store.store_name
    ? `登録ありがとうございます！\n「${store.store_name}」専属のAI秘書として、よろしくお願いします。`
    : "登録ありがとうございます！\nあなたのお店専属のAI秘書として、よろしくお願いします。";

  return [
    { type: "text", text: greeting },
    {
      type: "flex",
      altText: "Linoaでできること",
      contents: buildOnboardingGuideFlex(),
    },
  ];
}
