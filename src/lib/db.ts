import { supabase } from "./supabase";
import type { Store, ReportSession, OnboardingStep } from "@/types";

// ============================================
// store取得（LINE user IDから）
// ============================================
export async function getStoreByLineUserId(
  lineUserId: string
): Promise<Store | null> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("line_user_id", lineUserId)
    .single();

  if (error) {
    // PGRST116: 0行の場合（未登録ユーザー）
    if (error.code === "PGRST116") return null;
    console.error("getStoreByLineUserId error:", error);
    throw error;
  }
  return data;
}

// ============================================
// store更新（オンボーディング等で使用）
// Partial<Store>のうち更新可能なカラムを指定して更新する
// ============================================
export async function updateStore(
  storeId: string,
  updates: Partial<Pick<Store, "store_name" | "owner_name" | "genre" | "seat_count" | "opening_hours" | "onboarding_step" | "onboarding_completed">>
): Promise<Store> {
  const { data, error } = await supabase
    .from("stores")
    .update(updates)
    .eq("id", storeId)
    .select()
    .single();

  if (error) {
    console.error("updateStore error:", error);
    throw error;
  }
  return data;
}

// ============================================
// 日報セッション取得（アクティブなもの）
// partial unique indexで1店舗1セッションを保証
// ============================================
export async function getActiveSession(
  storeId: string
): Promise<ReportSession | null> {
  const { data, error } = await supabase
    .from("report_sessions")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "active")
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("getActiveSession error:", error);
    throw error;
  }
  return data;
}

// ============================================
// 日報セッション作成
// ============================================
export async function createSession(
  storeId: string
): Promise<ReportSession> {
  const { data, error } = await supabase
    .from("report_sessions")
    .insert({ store_id: storeId })
    .select()
    .single();

  if (error) {
    console.error("createSession error:", error);
    throw error;
  }
  return data;
}

// ============================================
// 日報セッション更新
// ============================================
export async function updateSession(
  sessionId: string,
  updates: Partial<Pick<ReportSession, "current_step" | "status" | "customer_count" | "revenue" | "reservation_count" | "memo">>
): Promise<ReportSession> {
  const { data, error } = await supabase
    .from("report_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) {
    console.error("updateSession error:", error);
    throw error;
  }
  return data;
}

// ============================================
// 古いアクティブセッションをキャンセル
// 24時間超過したセッションを自動キャンセルする
// ============================================
export async function cancelStaleSession(storeId: string): Promise<void> {
  const staleThreshold = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  await supabase
    .from("report_sessions")
    .update({ status: "cancelled" })
    .eq("store_id", storeId)
    .eq("status", "active")
    .lt("updated_at", staleThreshold);
}

// ============================================
// 日報upsert（同日2回目は上書き）
// store_id + report_dateのunique indexを利用
// ============================================
export async function upsertDailyReport(params: {
  storeId: string;
  reportDate: string;
  customerCount: number;
  revenue: number;
  reservationCount: number;
  memo: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("daily_reports")
    .upsert(
      {
        store_id: params.storeId,
        report_date: params.reportDate,
        customer_count: params.customerCount,
        revenue: params.revenue,
        reservation_count: params.reservationCount,
        memo: params.memo,
      },
      { onConflict: "store_id,report_date" }
    )
    .select("id")
    .single();

  if (error) {
    console.error("upsertDailyReport error:", error);
    throw error;
  }
  return data.id;
}

// ============================================
// extracted_contexts一括保存
// ============================================
export async function saveExtractedContexts(
  storeId: string,
  contexts: { context_type: string; content: string }[],
  sourceMessage: string
): Promise<void> {
  if (contexts.length === 0) return;

  const rows = contexts.map((ctx) => ({
    store_id: storeId,
    context_type: ctx.context_type,
    content: ctx.content,
    source_message: sourceMessage,
  }));

  const { error } = await supabase
    .from("extracted_contexts")
    .insert(rows);

  if (error) {
    console.error("saveExtractedContexts error:", error);
    throw error;
  }
}

// ============================================
// 会話履歴保存
// ============================================
export async function saveConversation(
  storeId: string,
  role: "user" | "assistant",
  content: string
): Promise<void> {
  const { error } = await supabase.from("conversations").insert({
    store_id: storeId,
    role,
    content,
  });

  if (error) {
    console.error("saveConversation error:", error);
    throw error;
  }
}
