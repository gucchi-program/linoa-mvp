// ============================================
// 資料請求フォーム送信APIエンドポイント
// フォームデータをSupabaseのcontact_requestsテーブルに保存する
// ============================================

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // リクエスト時に初期化（ビルド時のenv未設定エラーを回避）
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  try {
    const body = await req.json();
    const { storeName, ownerName, email, phone, message } = body;

    // 必須フィールドのバリデーション
    if (!storeName || !ownerName || !email) {
      return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
    }

    // メールアドレスの簡易バリデーション
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "メールアドレスの形式が正しくありません" }, { status: 400 });
    }

    const { error } = await supabase.from("contact_requests").insert({
      store_name: storeName,
      owner_name: ownerName,
      email,
      phone: phone || null,
      message: message || null,
    });

    if (error) {
      console.error("contact insert error:", error);
      return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("contact route error:", e);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
