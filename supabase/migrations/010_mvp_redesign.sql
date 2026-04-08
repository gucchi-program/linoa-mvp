-- ============================================
-- MVP再設計 (2026-04-08)
-- 設計書: docs/mvp-design.md
--
-- 変更内容:
-- 1. storesテーブルを新設計の列構成に拡張
-- 2. owner_idをNULL許容に変更（stores中心の設計に戻す）
-- 3. 5つの新テーブルを追加
-- ============================================

-- storesのowner_idをNULL許容に変更
-- 理由: 新設計ではownersテーブルを使わず、storesが主体となる
ALTER TABLE stores ALTER COLUMN owner_id DROP NOT NULL;

-- storesに新設計の列を追加
ALTER TABLE stores ADD COLUMN IF NOT EXISTS store_type TEXT;       -- 'izakaya', 'italian', 'ramen', etc.
ALTER TABLE stores ADD COLUMN IF NOT EXISTS area TEXT;             -- 営業エリア
ALTER TABLE stores ADD COLUMN IF NOT EXISTS price_range TEXT;      -- '3000-5000', '5000-8000', etc.
ALTER TABLE stores ADD COLUMN IF NOT EXISTS years_in_business INTEGER; -- 営業年数
ALTER TABLE stores ADD COLUMN IF NOT EXISTS specialty TEXT;        -- こだわりポイント（自由テキスト）
ALTER TABLE stores ADD COLUMN IF NOT EXISTS customer_profile TEXT; -- 客層の説明
ALTER TABLE stores ADD COLUMN IF NOT EXISTS owner_tone TEXT;       -- オーナーの話し方の特徴
ALTER TABLE stores ADD COLUMN IF NOT EXISTS profile_prompt TEXT;   -- Claude用の店舗プロファイル全文

-- ============================================
-- messages: LINEメッセージの全件ログ
-- 送受信すべてのメッセージを記録する
-- 意図分類の結果もここに保存し、後から分析可能にする
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  line_user_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',  -- 'text', 'image', 'flex'
  intent TEXT,                        -- 意図分類結果（Step 2で埋まる）
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_store_id ON messages (store_id);
CREATE INDEX IF NOT EXISTS idx_messages_store_created ON messages (store_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- daily_sales: 売上記録
-- 「今日18万、52人」のような自然言語入力をパースして保存する
-- sourceカラムでPOS連携（Phase 2）との共存を設計時から考慮する
-- ============================================
CREATE TABLE IF NOT EXISTS daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  date DATE NOT NULL,
  revenue INTEGER,                -- 売上（円）
  customer_count INTEGER,         -- 客数
  average_spend INTEGER,          -- 客単価（revenue / customer_countを自動計算して保存）
  memo TEXT,
  source TEXT DEFAULT 'manual_line' CHECK (source IN ('manual_line', 'pos_smaregi', 'pos_airregi')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, date)          -- 1店舗1日1レコード（2回目はUPSERT）
);

CREATE INDEX IF NOT EXISTS idx_daily_sales_store_date ON daily_sales (store_id, date DESC);

ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;

-- ============================================
-- customer_notes: 顧客メモ
-- 「田中さんは赤ワインが好き」のような自然言語をJSONBで蓄積する
-- notesのJSONBにマージしていくので、後から情報を追加できる
-- ============================================
CREATE TABLE IF NOT EXISTS customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  customer_name TEXT NOT NULL,
  notes JSONB DEFAULT '{}',       -- { "preferences": "赤ワイン好き", "allergies": "甲殻類" }
  last_visit DATE,
  visit_count INTEGER DEFAULT 0,
  birthday TEXT,                  -- 'MM-DD' 形式
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, customer_name) -- UPSERTの対象
);

CREATE INDEX IF NOT EXISTS idx_customer_notes_store ON customer_notes (store_id);
CREATE INDEX IF NOT EXISTS idx_customer_notes_name ON customer_notes (store_id, customer_name);

ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

-- customer_notesのupdated_at自動更新
CREATE TRIGGER customer_notes_updated_at
  BEFORE UPDATE ON customer_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- inventory_logs: 在庫・仕入れメモ
-- 「鶏肉20kg入荷」「残り5kg」のような入力を記録する
-- 追記型（UPDATE不要）のログテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  item_name TEXT NOT NULL,
  quantity DECIMAL,
  unit TEXT,                      -- 'kg', '個', 'L', etc.
  action TEXT CHECK (action IN ('received', 'used', 'note', 'waste')),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_store ON inventory_logs (store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item ON inventory_logs (store_id, item_name);

ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- generated_contents: AIが生成したコンテンツ
-- SNS投稿案・口コミ返信案・レポート等を保存する
-- statusで承認フロー（draft→approved→posted）を管理する
-- Phase 2の自動投稿時にstatusを参照する
-- ============================================
CREATE TABLE IF NOT EXISTS generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('sns_post', 'review_reply', 'job_post', 'report')),
  input_text TEXT,                -- 生成元になったオーナーのメッセージ
  generated_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'posted', 'rejected')),
  platform TEXT,                  -- 'instagram', 'google_business', 'tabelog'
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_generated_contents_store ON generated_contents (store_id);
CREATE INDEX IF NOT EXISTS idx_generated_contents_store_type ON generated_contents (store_id, content_type);

ALTER TABLE generated_contents ENABLE ROW LEVEL SECURITY;
