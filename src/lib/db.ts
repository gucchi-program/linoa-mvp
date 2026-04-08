// ============================================
// DB操作モジュール（新設計版 2026-04-08〜）
// 各テーブルの操作関数をここに集約する
// Step 2以降でハンドラー専用のDB関数も追加していく
// ============================================

import { supabase } from "./supabase";
import type { Store } from "@/types";

// ============================================
// stores テーブル
// ============================================

// line_user_idで店舗を1件取得する
export async function getStoreByLineUserId(
  lineUserId: string
): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("line_user_id", lineUserId)
    .maybeSingle();

  if (error) {
    console.error("getStoreByLineUserId error:", error);
    return null;
  }
  return data;
}

// LINE友だち追加時に店舗レコードを作成する
export async function createStore(lineUserId: string): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .insert({ line_user_id: lineUserId })
    .select()
    .single();

  if (error) {
    console.error("createStore error:", error);
    return null;
  }
  return data;
}

// 店舗情報を更新する（オンボーディング等で使用）
export async function updateStore(
  storeId: string,
  updates: Partial<Pick<Store,
    | "store_name"
    | "owner_name"
    | "store_type"
    | "area"
    | "seat_count"
    | "price_range"
    | "years_in_business"
    | "specialty"
    | "customer_profile"
    | "owner_tone"
    | "profile_prompt"
    | "onboarding_completed"
  >>
): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .select()
    .single();

  if (error) {
    console.error("updateStore error:", error);
    return null;
  }
  return data;
}

// ============================================
// messages テーブル
// ============================================

// メッセージを保存する（送受信両方に使う）
export async function saveMessage(params: {
  storeId: string;
  lineUserId: string;
  direction: "incoming" | "outgoing";
  content: string;
  messageType?: string;
  intent?: string;
}): Promise<void> {
  const { error } = await supabase.from("messages").insert({
    store_id: params.storeId,
    line_user_id: params.lineUserId,
    direction: params.direction,
    content: params.content,
    message_type: params.messageType ?? "text",
    intent: params.intent ?? null,
  });

  if (error) {
    // 保存失敗はログに残すが、メッセージ処理自体は止めない
    console.error("saveMessage error:", error);
  }
}
