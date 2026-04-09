-- 資料請求フォームの送信データを保存するテーブル（010_mvp_redesignで削除されたため再作成）
create table if not exists contact_requests (
  id            uuid primary key default gen_random_uuid(),
  store_name    text not null,
  owner_name    text not null,
  email         text not null,
  phone         text,
  message       text,
  created_at    timestamptz not null default now()
);
