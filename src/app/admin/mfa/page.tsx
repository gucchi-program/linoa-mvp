"use client";

export const dynamic = "force-dynamic";

// ============================================
// MFA検証ページ（毎回のログイン時）
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MfaPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 登録済みのTOTPファクターを取得
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.find((f) => f.status === "verified");
      if (!totp) {
        router.push("/admin/mfa/enroll");
        return;
      }

      const { data: challenge, error: cError } = await supabase.auth.mfa.challenge({
        factorId: totp.id,
      });
      if (cError || !challenge) {
        setError("チャレンジの生成に失敗しました");
        return;
      }

      const { error: vError } = await supabase.auth.mfa.verify({
        factorId: totp.id,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ""),
      });
      if (vError) {
        setError("コードが正しくありません");
        return;
      }

      router.push("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/linoa-logo.png" alt="Linoa" width={40} height={40} className="object-contain mb-3" />
          <h1 className="text-xl font-bold text-white">2段階認証</h1>
          <p className="text-slate-500 text-sm mt-1">認証アプリの6桁コードを入力</p>
        </div>

        <form onSubmit={handleVerify} className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9\s]*"
              maxLength={7}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              autoFocus
              className="w-full px-4 py-4 rounded-xl bg-slate-800 border border-white/10 text-white text-2xl text-center tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors font-mono"
            />

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || code.replace(/\s/g, "").length < 6}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 min-h-[44px]"
              style={{ backgroundColor: "#00B900" }}
            >
              {loading ? "確認中..." : "確認する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
