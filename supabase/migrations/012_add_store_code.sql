-- 店舗コードを追加（管理画面で発行し、LINEオンボーディングで使用）
alter table stores
  add column if not exists store_code text unique,
  add column if not exists is_active boolean not null default true,
  add column if not exists notes text; -- 管理メモ（内部用）

-- コード生成用インデックス
create index if not exists idx_stores_store_code on stores(store_code);
