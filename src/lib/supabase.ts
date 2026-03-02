import { createClient } from "@supabase/supabase-js";

// サーバーサイド専用の Supabase クライアント
// service_role キーを使用するため、RLS をバイパスする
// ブラウザ側では絶対に使わないこと
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // サーバーサイドではセッション永続化不要
    persistSession: false,
    autoRefreshToken: false,
  },
});
