"use client";

export const dynamic = "force-dynamic";

// ============================================
// 店舗オーナーログインページ
// メール + パスワード認証（Supabase Auth）
// ログイン後は /store/settings へ遷移
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function StoreLoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.session) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }

      router.push("/store/settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/linoa-logo.png"
            alt="Linoa"
            width={48}
            height={48}
            className="object-contain mb-3"
          />
          <h1 className="text-xl font-bold text-slate-900">Linoa</h1>
          <p className="text-slate-500 text-sm mt-1">店舗管理画面にログイン</p>
        </div>

        {/* フォーム */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1.5"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
            </div>

            {error && (
              <p
                className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl"
                role="alert"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50 mt-1"
              style={{ backgroundColor: "#00B900" }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-400 text-xs mt-6">
          アカウントをお持ちでない場合は担当者にお問い合わせください
        </p>
      </div>
    </div>
  );
}
