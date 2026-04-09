// ============================================
// ブラウザサイド Supabase クライアント（@supabase/ssr）
// Client Components で使用
// ============================================

import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  // NEXT_PUBLIC_* は ブラウザに公開されるため必須。
  // Supabase Dashboard > Settings > API > anon public key を使う（Service Role keyではない）
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return createBrowserClient(url, key);
}
