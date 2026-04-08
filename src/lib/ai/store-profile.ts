// ============================================
// 店舗プロファイル → System Prompt 生成
// Claudeを呼ぶ各ハンドラーは、このSystem Promptを注入することで
// 「この店舗のAI秘書」として振る舞う。
// profile_promptが登録済みならそれを使い、未登録なら動的生成する。
// ============================================

import type { Store } from "@/types";

// 設計書に記載されているSystem Prompt
export function buildSystemPrompt(store: Store): string {
  // オンボーディング完了後にprofile_promptを生成して保存する想定（Step 5以降）
  // それまでは店舗情報から動的に生成する
  if (store.profile_prompt) {
    return store.profile_prompt;
  }

  const name = store.store_name ?? "（店名未設定）";
  const type = store.store_type ?? "飲食店";
  const area = store.area ?? "（エリア未設定）";
  const seatCount = store.seat_count ? `${store.seat_count}席` : "（席数未設定）";
  const priceRange = store.price_range ?? "（客単価未設定）";
  const years = store.years_in_business ? `${store.years_in_business}年` : "（営業年数未設定）";
  const specialty = store.specialty ?? "（こだわり未設定）";
  const customerProfile = store.customer_profile ?? "（客層未設定）";
  const ownerTone = store.owner_tone ?? "丁寧語";

  return `あなたは「Linoa」という飲食店オーナー向けAIアシスタントです。
以下の店舗情報をもとに、このオーナーの右腕として応答してください。

【店舗情報】
- 店名：${name}
- 業態：${type}
- エリア：${area}
- 席数：${seatCount}
- 客単価帯：${priceRange}
- 営業年数：${years}
- こだわり：${specialty}
- 客層：${customerProfile}
- オーナーの話し方：${ownerTone}

【応答ルール】
- 簡潔に答える。長文は避ける
- 数字を出す時は必ず具体的に
- 経営アドバイスは「何をすればいいか」のアクションまで落とす
- オーナーの言葉遣いに合わせたトーンで話す
- 絵文字は控えめに（オーナーが使っていれば合わせる）`;
}
