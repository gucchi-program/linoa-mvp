-- ============================================
-- Instagram自動投稿機能 (2026-04-11)
--
-- 変更内容:
-- 1. generated_contents: scheduled_at / image_url / pending_line_user_id を追加
-- 2. generated_contents: status に pending / cancelled を追加
-- 3. stores: Instagram連携カラム / auth_user_id を追加
-- 4. store-images バケット作成
-- ============================================

-- generated_contents に30分タイマー・画像URL・キャンセル対応カラムを追加
ALTER TABLE generated_contents
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS pending_line_user_id TEXT;

-- status の CHECK 制約を更新（pending / cancelled を追加）
ALTER TABLE generated_contents
  DROP CONSTRAINT IF EXISTS generated_contents_status_check;
ALTER TABLE generated_contents
  ADD CONSTRAINT generated_contents_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'posted', 'rejected', 'cancelled'));

-- Cronジョブが pending → posted を効率よく取得できるようにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_generated_contents_pending
  ON generated_contents (scheduled_at)
  WHERE status = 'pending';

-- stores に Instagram連携・Webログイン用カラムを追加
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS instagram_access_token TEXT,
  ADD COLUMN IF NOT EXISTS instagram_user_id TEXT,
  ADD COLUMN IF NOT EXISTS instagram_business_account_id TEXT,
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_stores_auth_user_id
  ON stores (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- ============================================
-- Supabase Storage バケット作成
-- store-images: オーナーが送った写真（Instagram投稿用）
-- reference-images: POP参照画像（スタイル一致用）
-- ※ Supabase CLIではバケット作成はダッシュボードか
--   supabase/config.toml で行うため、ここではコメントのみ
-- → ダッシュボードから手動で作成すること:
--   1. store-images（Public）
--   2. reference-images（Public）
-- ============================================
