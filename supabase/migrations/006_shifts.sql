-- シフト管理テーブル（簡易版）
-- オーナーがLINEからスタッフのシフトを登録・管理する

-- スタッフマスタ
CREATE TABLE IF NOT EXISTS staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                          -- スタッフ名
  role TEXT DEFAULT 'part_time',               -- full_time / part_time
  active BOOLEAN DEFAULT TRUE,                 -- 在籍中フラグ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_store ON staff (store_id) WHERE active = TRUE;

-- シフトテーブル
CREATE TABLE IF NOT EXISTS shifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,                    -- シフト日
  start_time TEXT NOT NULL,                    -- 開始時刻（"17:00"）
  end_time TEXT NOT NULL,                      -- 終了時刻（"23:00"）
  note TEXT,                                   -- 備考
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 店舗ごとの日付範囲検索用インデックス
CREATE INDEX idx_shifts_store_date ON shifts (store_id, shift_date);

-- 同一スタッフ・同一日の重複防止
CREATE UNIQUE INDEX idx_shifts_unique ON shifts (staff_id, shift_date);

-- RLS有効化
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on staff"
  ON staff FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on shifts"
  ON shifts FOR ALL USING (true) WITH CHECK (true);
