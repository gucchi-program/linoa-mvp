-- Sprint 2: 日報入力フロー用スキーマ変更

-- ============================================
-- daily_reports に予約件数カラム追加
-- ============================================
alter table daily_reports add column if not exists reservation_count integer;

-- ============================================
-- report_sessions: 日報入力セッション管理
-- Webhookはステートレスなため、入力途中の値を
-- 専用テーブルで保持する。conversationsとは責務を分離。
-- ============================================
create table report_sessions (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'completed', 'cancelled')),
  current_step text not null default 'customer_count'
    check (current_step in (
      'customer_count', 'revenue', 'reservation_count', 'memo', 'completed'
    )),
  -- 入力途中の値を各カラムで保持
  customer_count integer,
  revenue integer,
  reservation_count integer,
  memo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 同一店舗のアクティブセッションは1つのみ（partial unique index）
create unique index idx_report_sessions_active
  on report_sessions (store_id)
  where status = 'active';

-- store_idでの検索を高速化
create index idx_report_sessions_store on report_sessions (store_id);

-- updated_at自動更新トリガー
create trigger report_sessions_updated_at
  before update on report_sessions
  for each row execute function update_updated_at();

-- RLS有効化（service_roleキーでバイパス）
alter table report_sessions enable row level security;
