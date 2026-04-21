"use client";

export const dynamic = "force-dynamic";

// ============================================
// 決済完了ページ
// Stripe Checkout 成功後のランディング
// Webhook でステータス更新が先に走るが、
// ネットワーク遅延で未反映のこともあるので少し待ってリロード
// ============================================

import { useEffect, useState } from "react";
import Link from "next/link";

export default function BillingSuccessPage() {
  const [seconds, setSeconds] = useState(3);

  useEffect(() => {
    if (seconds === 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
        {/* 成功アイコン */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-2">
          ご契約ありがとうございます
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          お支払いが正常に完了しました。Linoa のすべての機能をご利用いただけます。
        </p>

        <div className="bg-emerald-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-emerald-800 mb-2">
            次のステップ
          </p>
          <ul className="text-xs text-emerald-700 space-y-1.5">
            <li>・ LINEから「店舗情報を登録」と送ってください</li>
            <li>・ Instagram連携で自動投稿を有効にできます</li>
            <li>・ 写真を送るだけで30分後に自動投稿されます</li>
          </ul>
        </div>

        <Link
          href="/store/settings"
          className="block w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 transition-opacity"
        >
          設定画面へ進む
        </Link>

        <p className="text-xs text-slate-400 mt-4">
          {seconds > 0
            ? `${seconds}秒後に自動で設定画面に移動します`
            : "移動します..."}
        </p>
      </div>
      {seconds === 0 && (
        <meta httpEquiv="refresh" content="0;url=/store/settings" />
      )}
    </div>
  );
}
