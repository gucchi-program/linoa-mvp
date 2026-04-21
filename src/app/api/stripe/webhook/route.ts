// ============================================
// POST /api/stripe/webhook
// Stripe から送られてくるイベントを受信し、stores の状態を更新する
//
// 扱うイベント:
//   - checkout.session.completed      → customer_id を保存、initial_payment_at 記録
//   - customer.subscription.created   → subscription_id / status / period_end 保存
//   - customer.subscription.updated   → status / period_end 更新
//   - customer.subscription.deleted   → status を 'canceled' に
//   - invoice.payment_failed          → status を 'past_due' に
//
// 冪等性: stripe_events テーブルで event.id による重複処理を防止
// ============================================

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, getStripeWebhookSecret } from "@/lib/stripe";
import { supabase as supabaseAdmin } from "@/lib/supabase";

// Next.js App Router でも Stripe webhook は生ボディが必要
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await request.text();
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret()
    );
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  // 冪等性: 既処理のイベントはスキップ
  const { error: insertErr } = await supabaseAdmin
    .from("stripe_events")
    .insert({
      id: event.id,
      type: event.type,
      payload: event as unknown as Record<string, unknown>,
    });

  if (insertErr) {
    // PK 重複 = 既処理。それ以外はエラーとして扱う
    const isDuplicate =
      (insertErr as { code?: string }).code === "23505" ||
      insertErr.message?.includes("duplicate");
    if (isDuplicate) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe/webhook] insert stripe_events failed:", insertErr);
    // 記録失敗でも処理は継続（アラート目的のロギングのみ）
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.error("[stripe/webhook] handler error:", event.type, err);
    // 500 を返すと Stripe が再送してくれる
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const storeId = session.metadata?.store_id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      if (!storeId || !customerId) {
        console.warn("[stripe/webhook] missing store_id or customer:", session.id);
        return;
      }

      await supabaseAdmin
        .from("stores")
        .update({
          stripe_customer_id: customerId,
          initial_payment_at: new Date().toISOString(),
        })
        .eq("id", storeId);
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const storeId = sub.metadata?.store_id;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      // storeId が metadata にない場合は customer_id から引く
      let targetStoreId = storeId;
      if (!targetStoreId) {
        const { data } = await supabaseAdmin
          .from("stores")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        targetStoreId = data?.id;
      }

      if (!targetStoreId) {
        console.warn("[stripe/webhook] store not found for sub:", sub.id);
        return;
      }

      // current_period_end は subscription.items.data[0].current_period_end に移行（2025-08 API〜）
      const periodEndUnix =
        sub.items?.data?.[0]?.current_period_end ?? null;
      const periodEnd = periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null;

      await supabaseAdmin
        .from("stores")
        .update({
          stripe_subscription_id: sub.id,
          subscription_status: sub.status,
          current_period_end: periodEnd,
        })
        .eq("id", targetStoreId);
      return;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;

      await supabaseAdmin
        .from("stores")
        .update({ subscription_status: "canceled" })
        .eq("stripe_customer_id", customerId);
      return;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId =
        typeof invoice.customer === "string"
          ? invoice.customer
          : invoice.customer?.id;

      if (!customerId) return;

      await supabaseAdmin
        .from("stores")
        .update({ subscription_status: "past_due" })
        .eq("stripe_customer_id", customerId);
      return;
    }

    default:
      // 購読してないイベントは無視
      return;
  }
}
