// ============================================
// Linoa MVP 型定義（新設計版 2026-04-08〜）
// ============================================

// 店舗マスタ
export interface Store {
  id: string;
  line_user_id: string;
  store_name: string | null;
  owner_name: string | null;
  store_type: string | null;    // 'izakaya', 'italian', 'ramen', etc.
  area: string | null;
  seat_count: number | null;
  price_range: string | null;   // '3000-5000', '5000-8000', etc.
  years_in_business: number | null;
  specialty: string | null;
  customer_profile: string | null;
  owner_tone: string | null;
  profile_prompt: string | null; // Claude用の店舗プロファイル全文
  onboarding_completed: boolean;
  // Instagram連携（migration 013で追加）
  instagram_access_token: string | null;
  instagram_user_id: string | null;
  instagram_business_account_id: string | null;
  // Webログイン連携（migration 013で追加）
  auth_user_id: string | null;
  // Stripe決済（migration 014で追加）
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: SubscriptionStatus | null;
  current_period_end: string | null;
  initial_payment_at: string | null;
  created_at: string;
  updated_at: string;
}

// Stripe Subscription Status に準拠
export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

// LINEメッセージ全件ログ
export interface Message {
  id: string;
  store_id: string;
  line_user_id: string;
  direction: 'incoming' | 'outgoing';
  content: string;
  message_type: string;
  intent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// 売上記録
export interface DailySale {
  id: string;
  store_id: string;
  date: string; // YYYY-MM-DD
  revenue: number | null;
  customer_count: number | null;
  average_spend: number | null;
  memo: string | null;
  source: 'manual_line' | 'pos_smaregi' | 'pos_airregi';
  created_at: string;
}

// 顧客メモ
export interface CustomerNote {
  id: string;
  store_id: string;
  customer_name: string;
  notes: Record<string, string>;
  last_visit: string | null; // YYYY-MM-DD
  visit_count: number;
  birthday: string | null;   // 'MM-DD' 形式
  created_at: string;
  updated_at: string;
}

// 在庫・仕入れメモ
export interface InventoryLog {
  id: string;
  store_id: string;
  item_name: string;
  quantity: number | null;
  unit: string | null;
  action: 'received' | 'used' | 'note' | 'waste' | null;
  memo: string | null;
  created_at: string;
}

// AI生成コンテンツ（SNS投稿案・口コミ返信案等）
export interface GeneratedContent {
  id: string;
  store_id: string;
  content_type: 'sns_post' | 'review_reply' | 'job_post' | 'report';
  input_text: string | null;
  generated_text: string;
  // pending: 30分タイマー待機中 / cancelled: オーナーがキャンセル
  status: 'draft' | 'pending' | 'approved' | 'posted' | 'rejected' | 'cancelled';
  platform: string | null;
  posted_at: string | null;
  // Instagram自動投稿用（migration 013で追加）
  scheduled_at: string | null;
  image_url: string | null;
  pending_line_user_id: string | null;
  created_at: string;
}

// 意図分類の9カテゴリ（Step 2で使用）
export type MessageIntent =
  | 'sns_post_request'
  | 'sales_input'
  | 'customer_note'
  | 'customer_query'
  | 'inventory'
  | 'review_reply_request'
  | 'report_request'
  | 'question'
  | 'casual';

// LINE メッセージ型（line.tsと同じ定義をtypesからも使えるようにre-export）
export type LineMessage =
  | { type: "text"; text: string }
  | { type: "image"; originalContentUrl: string; previewImageUrl: string }
  | { type: "flex"; altText: string; contents: object };

// LINE Webhook イベント型（必要最小限）
export interface LineWebhookEvent {
  type: string;
  replyToken: string;
  source: {
    type: string;
    userId: string;
  };
  message?: {
    type: string;
    id: string;
    text?: string;
  };
  timestamp: number;
}

export interface LineWebhookBody {
  destination: string;
  events: LineWebhookEvent[];
}
