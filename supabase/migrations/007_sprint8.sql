-- ============================================
-- Sprint 8: マニュアルbot用テーブル
-- ============================================

-- マニュアルページ
-- 店舗ごとに複数のマニュアルを登録できる
CREATE TABLE manual_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,     -- マニュアルタイトル（例:「ホールの接客手順」）
  content TEXT NOT NULL,   -- マニュアル本文
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_manual_pages_store_id ON manual_pages(store_id);

-- マニュアル登録セッション
-- Webhookはステートレスなため、入力途中のデータをDBで保持する
-- report_sessionsと同パターン
CREATE TABLE manual_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  step TEXT NOT NULL DEFAULT 'title', -- title | content
  title TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active | completed | cancelled
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1店舗につき同時にアクティブなセッションは1つだけ
CREATE UNIQUE INDEX idx_manual_sessions_active ON manual_sessions(store_id) WHERE status = 'active';
