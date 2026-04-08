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
  created_at: string;
  updated_at: string;
}

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
  status: 'draft' | 'approved' | 'posted' | 'rejected';
  platform: string | null;
  posted_at: string | null;
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
