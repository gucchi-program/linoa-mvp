// ============================================
// Linoa MVP 型定義
// ============================================

// 店舗マスタ
export interface Store {
  id: string;
  line_user_id: string;
  store_name: string | null;
  owner_name: string | null;
  genre: string | null;
  seat_count: number | null;
  opening_hours: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

// 日報データ
export interface DailyReport {
  id: string;
  store_id: string;
  report_date: string; // YYYY-MM-DD
  revenue: number | null;
  customer_count: number | null;
  weather: string | null;
  memo: string | null;
  created_at: string;
}

// 非構造データ抽出
export interface ExtractedContext {
  id: string;
  store_id: string;
  context_type: string; // 'customer_info' | 'menu_change' | 'event' 等
  content: string;
  source_message: string | null;
  created_at: string;
}

// 会話履歴
export interface Conversation {
  id: string;
  store_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Claude APIレスポンスの構造化出力（Sprint 2で拡張）
export interface ClaudeResponse {
  reply: string; // LINEに返すメッセージ
  daily_report: Partial<DailyReport> | null; // 日報データが含まれていれば抽出
  extracted_contexts: Pick<ExtractedContext, "context_type" | "content">[];
}

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
