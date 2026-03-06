-- Sprint 4: オーナーテーブル分離 + ダッシュボード認証基盤
-- owners テーブルを新設し、storesからオーナー情報を分離
-- 1人のオーナーが複数店舗を持てる構造に変更

-- ============================================
-- owners: オーナーマスタ
-- LINE user IDでオーナーを一意に識別
-- ============================================
create table owners (
  id uuid primary key default uuid_generate_v4(),
  line_user_id text unique not null,
  owner_name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_owners_line_user_id on owners (line_user_id);

-- updated_at自動更新
create trigger owners_updated_at
  before update on owners
  for each row execute function update_updated_at();

-- RLS有効化
alter table owners enable row level security;

-- ============================================
-- storesにowner_id(FK)を追加
-- 既存データを移行してからline_user_idの扱いを変更
-- ============================================
alter table stores add column owner_id uuid references owners(id) on delete cascade;

-- 既存storesデータからownersレコードを作成
insert into owners (line_user_id, owner_name)
select distinct line_user_id, owner_name from stores
where line_user_id is not null
on conflict (line_user_id) do nothing;

-- storesのowner_idを既存データから埋める
update stores set owner_id = owners.id
from owners
where stores.line_user_id = owners.line_user_id;

-- owner_idをNOT NULLに変更
alter table stores alter column owner_id set not null;

-- line_user_idのunique制約を削除（複数店舗を許可するため）
alter table stores drop constraint stores_line_user_id_key;

-- ============================================
-- dashboard_tokens: ダッシュボード認証用ワンタイムトークン
-- LINEで「レポート」送信時に生成し、URLに埋め込む
-- ============================================
create table dashboard_tokens (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references owners(id) on delete cascade,
  token text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

create index idx_dashboard_tokens_token on dashboard_tokens (token);

-- RLS有効化
alter table dashboard_tokens enable row level security;

-- 期限切れトークンを定期的に削除するためのインデックス
create index idx_dashboard_tokens_expires on dashboard_tokens (expires_at);
