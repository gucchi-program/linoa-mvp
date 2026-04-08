// ============================================
// DB操作モジュール（新設計版 2026-04-08〜）
// 各テーブルの操作関数をここに集約する
// Step 2以降でハンドラー専用のDB関数も追加していく
// ============================================

import { supabase } from "./supabase";
import type { Store } from "@/types";

// ============================================
// daily_sales テーブル
// ============================================

// 売上をUPSERT（同日2回目の入力は上書き）
export async function upsertDailySale(params: {
  storeId: string;
  date: string; // YYYY-MM-DD
  revenue: number | null;
  customerCount: number | null;
  memo?: string | null;
}): Promise<void> {
  const averageSpend =
    params.revenue && params.customerCount && params.customerCount > 0
      ? Math.round(params.revenue / params.customerCount)
      : null;

  const { error } = await supabase.from("daily_sales").upsert(
    {
      store_id: params.storeId,
      date: params.date,
      revenue: params.revenue,
      customer_count: params.customerCount,
      average_spend: averageSpend,
      memo: params.memo ?? null,
      source: "manual_line",
    },
    { onConflict: "store_id,date" }
  );

  if (error) {
    console.error("upsertDailySale error:", error);
    throw error;
  }
}

// 今月の売上サマリーを返す
export async function getMonthlySummary(
  storeId: string,
  year: number,
  month: number
): Promise<{
  totalRevenue: number;
  totalCustomers: number;
  businessDays: number;
  avgDailyRevenue: number;
}> {
  // 月の開始日・終了日を計算
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = `${year}-${String(month).padStart(2, "0")}-31`; // 31日以降は存在しないのでDBが自動で調整

  const { data, error } = await supabase
    .from("daily_sales")
    .select("revenue, customer_count")
    .eq("store_id", storeId)
    .gte("date", from)
    .lte("date", to);

  if (error) {
    console.error("getMonthlySummary error:", error);
    return { totalRevenue: 0, totalCustomers: 0, businessDays: 0, avgDailyRevenue: 0 };
  }

  const records = data ?? [];
  const totalRevenue = records.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
  const totalCustomers = records.reduce((sum, r) => sum + (r.customer_count ?? 0), 0);
  const businessDays = records.filter((r) => r.revenue != null).length;
  const avgDailyRevenue = businessDays > 0 ? Math.round(totalRevenue / businessDays) : 0;

  return { totalRevenue, totalCustomers, businessDays, avgDailyRevenue };
}

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
