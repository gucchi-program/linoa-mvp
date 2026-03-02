-- Linoa MVP 初期スキーマ
-- stores, daily_reports, extracted_contexts, conversations の4テーブル

-- uuid生成用の拡張（Supabaseではデフォルト有効だが念のため）
create extension if not exists "uuid-ossp";

-- ============================================
-- stores: 店舗マスタ
-- LINE友だち追加時に自動作成される
-- ============================================
create table stores (
  id uuid primary key default uuid_generate_v4(),
  line_user_id text unique not null,
  store_name text,
  owner_name text,
  genre text,
  seat_count integer,
  opening_hours text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- line_user_idでの検索を高速化
create index idx_stores_line_user_id on stores (line_user_id);

-- ============================================
-- daily_reports: 日報データ
-- Claude APIが会話から構造化抽出した売上・客数等
-- ============================================
create table daily_reports (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  report_date date not null,
  revenue integer,
  customer_count integer,
  weather text,
  memo text,
  created_at timestamptz default now()
);

-- 同じ店舗の同じ日付の日報は1件のみ
create unique index idx_daily_reports_store_date on daily_reports (store_id, report_date);

-- ============================================
-- extracted_contexts: 非構造データ抽出
-- 「常連の田中さんが〜」等、構造化しきれない情報
-- ============================================
create table extracted_contexts (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  context_type text not null, -- 'customer_info', 'menu_change', 'event', etc.
  content text not null,
  source_message text,
  created_at timestamptz default now()
);

create index idx_extracted_contexts_store on extracted_contexts (store_id);

-- ============================================
-- conversations: 会話履歴
-- LLMのコンテキスト構築に使用
-- ============================================
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz default now()
);

create index idx_conversations_store_created on conversations (store_id, created_at);

-- ============================================
-- RLS（Row Level Security）有効化
-- Webhook APIはservice_roleキーでアクセスするため、
-- service_roleには全操作を許可するポリシーを設定
-- ============================================
alter table stores enable row level security;
alter table daily_reports enable row level security;
alter table extracted_contexts enable row level security;
alter table conversations enable row level security;

-- service_roleキーはRLSをバイパスするため、
-- 追加のポリシーは不要（service_roleはデフォルトでRLSスキップ）
-- ダッシュボード（Sprint 4）で認証ユーザー向けポリシーを追加予定

-- updated_atを自動更新するトリガー関数
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger stores_updated_at
  before update on stores
  for each row execute function update_updated_at();
