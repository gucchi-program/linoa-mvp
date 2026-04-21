// ============================================
// POST /api/stripe/portal
// Customer Portal のセッションを作成し URL を返す
// プラン変更・カード情報更新・解約はすべて Stripe 側UIで完結する
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { createBillingPortalSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: store } = await supabaseAdmin
      .from("stores")
      .select("stripe_customer_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!store?.stripe_customer_id) {
      return NextResponse.json(
        { error: "customer_not_found" },
        { status: 404 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

    const session = await createBillingPortalSession({
      customerId: store.stripe_customer_id,
      returnUrl: `${origin}/store/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/stripe/portal] error:", err);
    const message = err instanceof Error ? err.message : "internal_error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
