// ============================================
// Stripe サーバー用クライアント
// Route Handlers / Server Components でのみ使用（ブラウザに漏らさない）
// ============================================

import Stripe from "stripe";

// Stripe クライアントは遅延初期化する
// ビルド時に env がなくても壊れず、実行時に呼ばれた瞬間に検証する
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY が未設定です");
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
  return _stripe;
}

// 環境変数のショートカット（Price ID系はnull許容で使う側でチェック）
export function getStripePriceIds() {
  return {
    initial: process.env.STRIPE_INITIAL_PRICE_ID ?? "",
    monthly: process.env.STRIPE_MONTHLY_PRICE_ID ?? "",
  };
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET が未設定です");
  }
  return secret;
}

// Checkout Session を作成する
// - 初期費用(one-time) + 月額サブスク を同一セッションで決済
// - 成功時は /store/billing/success、キャンセル時は /store/billing/cancel に戻す
export async function createCheckoutSession(params: {
  storeId: string;
  customerEmail?: string;
  existingCustomerId?: string | null;
  origin: string; // リダイレクト先の絶対URLベース（例: https://app.li-noa.jp）
}): Promise<Stripe.Checkout.Session> {
  const { storeId, customerEmail, existingCustomerId, origin } = params;
  const stripe = getStripe();
  const { initial, monthly } = getStripePriceIds();

  if (!initial || !monthly) {
    throw new Error("Stripe Price ID (初期費用/月額) が未設定です");
  }

  // 初回のみ customer を新規作成。再契約時は既存 customer を使い回す
  const customerFields: Pick<
    Stripe.Checkout.SessionCreateParams,
    "customer" | "customer_email" | "customer_creation"
  > = existingCustomerId
    ? { customer: existingCustomerId }
    : customerEmail
      ? { customer_email: customerEmail, customer_creation: "always" }
      : { customer_creation: "always" };

  return stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      // 月額サブスク
      { price: monthly, quantity: 1 },
      // 初期費用（one-time）をサブスク初回請求書に同梱
      { price: initial, quantity: 1 },
    ],
    // subscription_data は recurring 分にのみ適用される
    subscription_data: {
      metadata: { store_id: storeId },
    },
    // session 自体の metadata（webhook で使う）
    metadata: { store_id: storeId },
    ...customerFields,
    success_url: `${origin}/store/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/store/billing/cancel`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    locale: "ja",
  });
}

// Stripe Customer Portal セッションを作成（プラン変更・カード更新・解約）
export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}
