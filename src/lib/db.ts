import { supabase } from "./supabase";
import type { Store, ReportSession, Owner, DashboardToken, ExpiryItem } from "@/types";
import crypto from "crypto";

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
  weather?: string | null;
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
        ...(params.weather ? { weather: params.weather } : {}),
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

// ============================================
// オーナー取得（LINE user IDから）
// ============================================
export async function getOwnerByLineUserId(
  lineUserId: string
): Promise<Owner | null> {
  const { data, error } = await supabase
    .from("owners")
    .select("*")
    .eq("line_user_id", lineUserId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("getOwnerByLineUserId error:", error);
    throw error;
  }
  return data;
}

// ============================================
// オーナーの全店舗取得
// ============================================
export async function getStoresByOwnerId(
  ownerId: string
): Promise<Store[]> {
  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getStoresByOwnerId error:", error);
    throw error;
  }
  return data ?? [];
}

// ============================================
// 店舗の日報一覧取得（ダッシュボード用）
// ============================================
export async function getDailyReports(
  storeId: string,
  limit: number = 90
): Promise<{
  report_date: string;
  revenue: number | null;
  customer_count: number | null;
  reservation_count: number | null;
  weather: string | null;
  memo: string | null;
}[]> {
  const { data, error } = await supabase
    .from("daily_reports")
    .select("report_date, revenue, customer_count, reservation_count, weather, memo")
    .eq("store_id", storeId)
    .order("report_date", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("getDailyReports error:", error);
    throw error;
  }
  return data ?? [];
}

// ============================================
// 会話履歴取得（直近N件）
// 自然言語対話のコンテキスト構築に使用
// ============================================
export async function getRecentConversations(
  storeId: string,
  limit: number = 10
): Promise<{ role: "user" | "assistant"; content: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("role, content, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentConversations error:", error);
    return [];
  }
  return (data ?? []).reverse();
}

// ============================================
// 抽出コンテキスト取得（直近N件）
// AI秘書の文脈理解に使用
// ============================================
export async function getRecentContexts(
  storeId: string,
  limit: number = 20
): Promise<{ context_type: string; content: string; created_at: string }[]> {
  const { data, error } = await supabase
    .from("extracted_contexts")
    .select("context_type, content, created_at")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentContexts error:", error);
    return [];
  }
  return (data ?? []).reverse();
}

// ============================================
// ダッシュボード認証トークン生成
// 24時間有効のワンタイムトークン
// ============================================
export async function createDashboardToken(
  ownerId: string
): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("dashboard_tokens")
    .insert({ owner_id: ownerId, token, expires_at: expiresAt });

  if (error) {
    console.error("createDashboardToken error:", error);
    throw error;
  }
  return token;
}

// ============================================
// ダッシュボードトークン検証
// 有効なトークンならowner_idを返す
// ============================================
export async function verifyDashboardToken(
  token: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("dashboard_tokens")
    .select("owner_id, expires_at")
    .eq("token", token)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("verifyDashboardToken error:", error);
    return null;
  }

  // 有効期限チェック
  if (new Date(data.expires_at) < new Date()) {
    return null;
  }

  return data.owner_id;
}

// ============================================
// 賞味期限アイテム登録
// ============================================
export async function createExpiryItem(params: {
  storeId: string;
  itemName: string;
  expiryDate: string;
  quantity?: string;
}): Promise<ExpiryItem> {
  const { data, error } = await supabase
    .from("expiry_items")
    .insert({
      store_id: params.storeId,
      item_name: params.itemName,
      expiry_date: params.expiryDate,
      quantity: params.quantity ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("createExpiryItem error:", error);
    throw error;
  }
  return data;
}

// ============================================
// 賞味期限アラート対象の取得
// 期限がN日以内かつ未通知・未使用のアイテム
// store情報も含めて返す（プッシュ通知に必要）
// ============================================
export async function getExpiringItems(
  daysAhead: number = 2
): Promise<(ExpiryItem & { stores: { line_user_id: string; store_name: string | null } })[]> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  const dateStr = targetDate.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("expiry_items")
    .select("*, stores(line_user_id, store_name)")
    .eq("used", false)
    .eq("notified", false)
    .lte("expiry_date", dateStr)
    .order("expiry_date", { ascending: true });

  if (error) {
    console.error("getExpiringItems error:", error);
    return [];
  }
  return data ?? [];
}

// ============================================
// 賞味期限アイテムの通知済み更新
// ============================================
export async function markExpiryNotified(itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  const { error } = await supabase
    .from("expiry_items")
    .update({ notified: true })
    .in("id", itemIds);

  if (error) {
    console.error("markExpiryNotified error:", error);
  }
}

// ============================================
// 店舗の有効な賞味期限アイテム一覧
// ============================================
export async function getActiveExpiryItems(
  storeId: string
): Promise<ExpiryItem[]> {
  const { data, error } = await supabase
    .from("expiry_items")
    .select("*")
    .eq("store_id", storeId)
    .eq("used", false)
    .order("expiry_date", { ascending: true });

  if (error) {
    console.error("getActiveExpiryItems error:", error);
    return [];
  }
  return data ?? [];
}

// ============================================
// 賞味期限アイテムを使い切り済みにする
// ============================================
export async function markExpiryUsed(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("expiry_items")
    .update({ used: true })
    .eq("id", itemId);

  if (error) {
    console.error("markExpiryUsed error:", error);
  }
}
