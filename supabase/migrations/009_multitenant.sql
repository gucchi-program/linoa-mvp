-- Sprint 9: マルチテナントSaaS化
-- ownersテーブルをテナント管理の単位に拡張する
-- 各テナントが独自のLINEチャネルとサブドメインを持てるようにする

alter table owners
  add column if not exists subdomain text unique,
  add column if not exists line_channel_secret text,
  add column if not exists line_channel_access_token text,
  add column if not exists is_active boolean default false;

-- サブドメイン検索用インデックス
-- middleware.tsでの高速ルックアップに使用
create index if not exists idx_owners_subdomain on owners (subdomain);
