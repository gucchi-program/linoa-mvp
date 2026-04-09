// ============================================
// Admin API: 店舗登録 POST /api/admin/stores
// ============================================

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const body = await req.json();
    const { name, owner_name, store_type, area, price_range, concept, notes, store_code } = body;

    if (!name || !owner_name) {
      return NextResponse.json({ error: "店舗名とオーナー名は必須です" }, { status: 400 });
    }

    const { error } = await supabase.from("stores").insert({
      name,
      owner_name,
      store_type: store_type || null,
      area: area || null,
      price_range: price_range || null,
      concept: concept || null,
      notes: notes || null,
      store_code,
      is_active: true,
    });

    if (error) {
      console.error("store insert error:", error);
      return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("admin stores POST error:", e);
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}
