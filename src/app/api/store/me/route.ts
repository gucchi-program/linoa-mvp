// ============================================
// 店舗オーナー: 自店舗情報取得API
// ログイン中のauth_user_idに紐付く店舗を返す
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreByAuthUserId } from "@/lib/db";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getStoreByAuthUserId(user.id);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // アクセストークンはフロントに返さない
  const { instagram_access_token: _, ...safeStore } = store;
  return NextResponse.json({ store: safeStore });
}
