-- ============================================
-- Stripe決済統合 (2026-04-18)
--
-- 変更内容:
-- 1. stores: Stripe顧客/サブスク関連カラムを追加
-- 2. stripe_events: Webhook冪等性担保用テーブルを新規作成
--
-- 実行方法: Supabaseダッシュボード SQL Editor に貼り付けて実行
-- ============================================

-- stores に Stripe関連カラムを追加
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS initial_payment_at TIMESTAMPTZ;

-- subscription_status の取り得る値を制約（Stripe Subscription Status に準拠）
-- null               = 未契約
-- incomplete         = 初回決済が未完了（3Dセキュア等）
-- incomplete_expired = 初回決済が期限切れで失敗
-- trialing           = トライアル中（今は未使用、将来用）
-- active             = 正常稼働
-- past_due           = 月次決済失敗、督促中
-- canceled           = 解約済み
-- unpaid             = 督促リトライ限界
ALTER TABLE stores
  DROP CONSTRAINT IF EXISTS stores_subscription_status_check;
ALTER TABLE stores
  ADD CONSTRAINT stores_subscription_status_check
  CHECK (subscription_status IS NULL OR subscription_status IN (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid'
  ));

-- Webhook で stripe_customer_id から stores を高速引き当て
CREATE INDEX IF NOT EXISTS idx_stores_stripe_customer_id
  ON stores (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- middleware で未払い店舗を判定するためのインデックス
CREATE INDEX IF NOT EXISTS idx_stores_subscription_status
  ON stores (subscription_status)
  WHERE subscription_status IS NOT NULL;

-- ============================================
-- Webhook冪等性テーブル
-- Stripe は同じイベントを2回以上送ることがあるため、
-- event.id を PK にして重複処理を防ぐ
-- ============================================
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,                                  -- Stripe event.id (evt_xxx)
  type TEXT NOT NULL,                                   -- イベントタイプ (例: customer.subscription.created)
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB                                         -- デバッグ用に生ペイロード保存
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_type
  ON stripe_events (type, processed_at DESC);
