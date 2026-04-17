// ============================================
// 参照POP画像アップロードAPI
// スタイル学習用の画像をSupabase Storageに保存する
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStoreByAuthUserId, uploadReferenceImage } from "@/lib/db";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getStoreByAuthUserId(user.id);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }

  // 5MB制限
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "5MB以下の画像を選択してください" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;

  const publicUrl = await uploadReferenceImage(buffer, store.id, filename);

  return NextResponse.json({ url: publicUrl });
}
