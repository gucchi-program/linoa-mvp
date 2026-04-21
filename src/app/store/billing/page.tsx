"use client";

export const dynamic = "force-dynamic";

// ============================================
// 契約・決済ページ
// - 未契約: Checkout を開始するボタン
// - active/trialing: プラン状況 + Customer Portal へのボタン
// - past_due: 督促表示 + Portal 誘導
// - canceled: 再契約ボタン
// ============================================

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Store } from "@/types";

export default function StoreBillingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/store/login");
        return;
      }
      const res = await fetch("/api/store/me");
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStore(data.store);
      setLoading(false);
    }
    load();
  }, [supabase, router]);

  // Checkout を開始
  async function handleCheckout() {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "決済ページの起動に失敗しました"
      );
      setSubmitting(false);
    }
  }

  // Customer Portal へ
  async function handleOpenPortal() {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "管理画面の起動に失敗しました"
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-slate-600 text-sm mb-2">店舗情報が見つかりません。</p>
          <p className="text-slate-400 text-xs">
            担当者に連絡してアカウントを紐付けてください。
          </p>
        </div>
      </div>
    );
  }

  const status = store.subscription_status;
  const isActive = status === "active" || status === "trialing";
  const isPastDue = status === "past_due" || status === "unpaid";
  const isCanceled = status === "canceled" || status === "incomplete_expired";
  const isUnregistered = status === null || status === "incomplete";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Image
            src="/linoa-logo.png"
            alt="Linoa"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {store.store_name ?? "店舗名未設定"}
            </p>
            <p className="text-xs text-slate-400">契約・決済</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-6">
        {/* 現在のステータス */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            ご契約状況
          </h2>
          <StatusBadge status={status} />

          {isActive && store.current_period_end && (
            <p className="text-xs text-slate-500 mt-4">
              次回更新日:{" "}
              {new Date(store.current_period_end).toLocaleDateString("ja-JP")}
            </p>
          )}
        </section>

        {/* 未契約 / 初回決済未完了 → 決済開始 */}
        {isUnregistered && (
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              Linoa のご契約
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              決済はStripeの安全な決済ページで行います。
            </p>

            <dl className="bg-slate-50 rounded-xl p-4 mb-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <dt className="text-xs text-slate-500">初期費用</dt>
                <dd className="text-sm font-semibold text-slate-900">
                  ¥30,000
                </dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-xs text-slate-500">月額プラン</dt>
                <dd className="text-sm font-semibold text-slate-900">
                  ¥8,800 / 月
                </dd>
              </div>
              <div className="border-t border-slate-200 my-1" />
              <div className="flex justify-between items-center">
                <dt className="text-xs text-slate-600 font-medium">
                  初回お支払い
                </dt>
                <dd className="text-base font-bold text-slate-900">¥38,800</dd>
              </div>
            </dl>

            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "決済ページを開いています..." : "契約してはじめる"}
            </button>

            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 mt-3 px-4 py-3 rounded-xl">
                {errorMsg}
              </p>
            )}

            <p className="text-xs text-slate-400 text-center mt-4">
              いつでも解約可能 / クレジットカード決済
            </p>
          </section>
        )}

        {/* アクティブ → Portal 誘導 */}
        {isActive && (
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">
              プラン管理
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              カード情報の更新・解約は Stripe 管理画面から行えます。
            </p>
            <button
              onClick={handleOpenPortal}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-slate-700 text-sm bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {submitting ? "開いています..." : "Stripe管理画面を開く"}
            </button>
            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 mt-3 px-4 py-3 rounded-xl">
                {errorMsg}
              </p>
            )}
          </section>
        )}

        {/* 支払い失敗 → 督促 */}
        {isPastDue && (
          <section className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
            <h2 className="text-base font-bold text-amber-900 mb-2">
              お支払い確認中です
            </h2>
            <p className="text-xs text-amber-700 mb-5">
              前回のお支払いができていません。カード情報をご確認ください。
              サービスは一時的に制限される場合があります。
            </p>
            <button
              onClick={handleOpenPortal}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-amber-600 hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {submitting ? "開いています..." : "カード情報を更新する"}
            </button>
            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 mt-3 px-4 py-3 rounded-xl">
                {errorMsg}
              </p>
            )}
          </section>
        )}

        {/* 解約済み → 再契約 */}
        {isCanceled && (
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-2">
              再度ご契約できます
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              以前の設定はそのまま残っています。
            </p>
            <button
              onClick={handleCheckout}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? "決済ページを開いています..." : "再契約する"}
            </button>
            {errorMsg && (
              <p className="text-xs text-red-600 bg-red-50 mt-3 px-4 py-3 rounded-xl">
                {errorMsg}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

// ステータスバッジ
function StatusBadge({ status }: { status: Store["subscription_status"] }) {
  const map: Record<string, { label: string; color: string; dot: string }> = {
    active: {
      label: "ご契約中",
      color: "bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
    },
    trialing: {
      label: "トライアル中",
      color: "bg-emerald-50 text-emerald-800",
      dot: "bg-emerald-500",
    },
    past_due: {
      label: "お支払い確認中",
      color: "bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    },
    unpaid: {
      label: "お支払い未完了",
      color: "bg-amber-50 text-amber-800",
      dot: "bg-amber-500",
    },
    canceled: {
      label: "解約済み",
      color: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    },
    incomplete: {
      label: "決済手続き中",
      color: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    },
    incomplete_expired: {
      label: "決済期限切れ",
      color: "bg-slate-100 text-slate-600",
      dot: "bg-slate-400",
    },
  };
  const s = status && map[status] ? map[status] : {
    label: "未契約",
    color: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${s.color}`}
    >
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      <span className="text-xs font-medium">{s.label}</span>
    </div>
  );
}
