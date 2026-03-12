-- 賞味期限管理テーブル
-- 食材の期限を登録し、期限前にLINEアラートを送る

CREATE TABLE IF NOT EXISTS expiry_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,                    -- 食材名
  expiry_date DATE NOT NULL,                  -- 賞味期限
  quantity TEXT,                               -- 数量（「3パック」「2kg」など自由入力）
  notified BOOLEAN DEFAULT FALSE,             -- アラート送信済みフラグ
  used BOOLEAN DEFAULT FALSE,                 -- 使い切り/廃棄済みフラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 店舗ごとの有効な賞味期限アイテム取得用インデックス
CREATE INDEX idx_expiry_items_store_active
  ON expiry_items (store_id, expiry_date)
  WHERE used = FALSE;

-- RLS有効化
ALTER TABLE expiry_items ENABLE ROW LEVEL SECURITY;

-- サービスロール用ポリシー
CREATE POLICY "Service role full access on expiry_items"
  ON expiry_items
  FOR ALL
  USING (true)
  WITH CHECK (true);
