import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// お問い合わせフォーム送信API
// フロントのContactFormからPOSTされ、Supabaseのcontact_requestsテーブルに保存する
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, storeName, email, phone, inquiryType, message } = body;

  // 必須項目チェック
  if (!name || !email) {
    return NextResponse.json(
      { error: "お名前とメールアドレスは必須です" },
      { status: 400 }
    );
  }

  // 簡易メール形式チェック
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { error: "メールアドレスの形式が正しくありません" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("contact_requests").insert({
    name: name.trim(),
    store_name: storeName?.trim() || null,
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    inquiry_type: inquiryType || "資料請求",
    message: message?.trim() || null,
  });

  if (error) {
    console.error("contact_requests insert error:", error);
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
