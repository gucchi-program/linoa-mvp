// ============================================
// POST /api/stripe/checkout
// Stripe Checkout Session を作成して URL を返す
//
// 想定呼び出し元:
//   1. /store/billing（オーナーセルフサーブ）
//   2. /admin/stores/[id]/billing-url（営業代理発行）
//
// Body: { storeId?: string }
//   - storeId 省略時: ログイン中ユーザーの store を使う（セルフサーブ）
//   - storeId 指定時: admin権限チェックの上で指定storeを使う（代理発行）
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const requestedStoreId: string | undefined = body?.storeId;

    // サブドメインによらず絶対URLを作る（middlewareで書き換わる前の origin を使う）
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

    // 認証: ログイン必須
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // 対象ストアの決定
    let storeId: string;

    if (requestedStoreId) {
      // admin からの代理発行: app_metadata.role === "admin" 必須
      const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
      if (role !== "admin") {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
      storeId = requestedStoreId;
    } else {
      // セルフサーブ: ログイン中ユーザーの store を引く
      const { data: store } = await supabaseAdmin
        .from("stores")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!store) {
        return NextResponse.json(
          { error: "store_not_found" },
          { status: 404 }
        );
      }
      storeId = store.id;
    }

    // 店舗情報と既存 stripe_customer_id を取得
    const { data: store, error: storeErr } = await supabaseAdmin
      .from("stores")
      .select("id, stripe_customer_id, auth_user_id")
      .eq("id", storeId)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: "store_not_found" }, { status: 404 });
    }

    // メールは auth.users から（store にメール列がないため）
    let customerEmail: string | undefined;
    if (store.auth_user_id) {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(
        store.auth_user_id
      );
      customerEmail = authData?.user?.email ?? undefined;
    }

    const session = await createCheckoutSession({
      storeId,
      customerEmail,
      existingCustomerId: store.stripe_customer_id,
      origin,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "checkout_url_missing" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/stripe/checkout] error:", err);
    const message = err instanceof Error ? err.message : "internal_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
