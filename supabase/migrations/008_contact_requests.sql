-- お問い合わせ・資料請求フォームの送信データを保存するテーブル
create table if not exists contact_requests (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  store_name  text,
  email       text not null,
  phone       text,
  inquiry_type text not null default '資料請求',
  message     text,
  created_at  timestamptz not null default now()
);
