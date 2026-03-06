-- オンボーディングの進行状況を追跡するカラム
-- 各ステップ: store_name → owner_name → genre → seat_count → opening_hours → completed
-- onboarding_completed = true のレコードではこのカラムは参照されない
alter table stores add column onboarding_step text default 'store_name';
