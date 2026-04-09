"use client";

export const dynamic = "force-dynamic";

// ============================================
// 管理画面ログインページ
// メール + パスワード → MFA確認 の2段階
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
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

      if (signInError) {
        setError("メールアドレスまたはパスワードが正しくありません");
        return;
      }

      if (!data.session) {
        setError("ログインに失敗しました");
        return;
      }

      // MFA登録済みか確認
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totpFactor = factors?.totp?.find((f) => f.status === "verified");

      if (totpFactor) {
        // MFA検証ページへ
        router.push("/admin/mfa");
      } else {
        // 未登録ならMFA登録ページへ（強制）
        router.push("/admin/mfa/enroll");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="flex flex-col items-center mb-8">
          <Image src="/linoa-logo.png" alt="Linoa" width={48} height={48} className="object-contain mb-3" />
          <h1 className="text-xl font-bold text-white">Linoa Admin</h1>
          <p className="text-slate-500 text-sm mt-1">管理コンソールにログイン</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleLogin} className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@li-noa.jp"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 cursor-pointer disabled:opacity-50 min-h-[44px] mt-1"
              style={{ backgroundColor: "#00B900" }}
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </div>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          ログイン後、2段階認証（TOTP）の確認があります
        </p>
      </div>
    </div>
  );
}
