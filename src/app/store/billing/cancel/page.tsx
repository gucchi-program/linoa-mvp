"use client";

export const dynamic = "force-dynamic";

// ============================================
// 決済キャンセルページ
// Stripe Checkout からユーザーが戻るボタンで戻ってきた時のランディング
// ============================================

import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          決済が完了していません
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          決済をキャンセルしました。いつでもお手続きできますので、
          ご不明な点があればお気軽にお問い合わせください。
        </p>

        <Link
          href="/store/billing"
          className="block w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-opacity mb-3"
        >
          もう一度契約画面へ
        </Link>

        <Link
          href="/store/settings"
          className="block text-sm text-slate-500 hover:text-slate-700 py-2"
        >
          設定画面に戻る
        </Link>
      </div>
    </div>
  );
}
