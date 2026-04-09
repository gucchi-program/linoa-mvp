// ============================================
// Admin API: 店舗更新 PATCH /api/admin/stores/[id]
// ============================================

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { id } = await params;
    const body = await req.json();
    const { name, owner_name, store_type, area, price_range, concept, notes, is_active } = body;

    if (!name) {
      return NextResponse.json({ error: "店舗名は必須です" }, { status: 400 });
    }

    const { error } = await supabase.from("stores").update({
      name,
      owner_name: owner_name || null,
      store_type: store_type || null,
      area: area || null,
      price_range: price_range || null,
      concept: concept || null,
      notes: notes || null,
      is_active: Boolean(is_active),
    }).eq("id", id);

    if (error) {
      console.error("store update error:", error);
      return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin stores PATCH error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
