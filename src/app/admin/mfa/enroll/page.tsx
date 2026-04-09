"use client";

export const dynamic = "force-dynamic";

// ============================================
// MFA登録ページ（初回ログイン時）
// Google Authenticator等でQRコードをスキャン → TOTPコード確認
// ============================================

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function MfaEnrollPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"qr" | "verify">("qr");

  useEffect(() => {
    async function enrollMfa() {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Linoa Admin",
      });
      if (error || !data) {
        setError("MFAの初期化に失敗しました");
        return;
      }
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    }
    enrollMfa();
  }, [supabase]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError || !challenge) {
        setError("チャレンジの生成に失敗しました");
        return;
      }
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: code.replace(/\s/g, ""),
      });
      if (verifyError) {
        setError("コードが正しくありません。認証アプリの6桁コードを入力してください。");
        return;
      }
      router.push("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image src="/linoa-logo.png" alt="Linoa" width={40} height={40} className="object-contain mb-3" />
          <h1 className="text-xl font-bold text-white">2段階認証の設定</h1>
          <p className="text-slate-500 text-sm mt-1">初回ログイン時に1度だけ設定が必要です</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          {step === "qr" && (
            <div className="flex flex-col items-center gap-5">
              <div className="text-sm text-slate-300 text-center leading-relaxed">
                <span className="font-semibold text-white">Google Authenticator</span> や <span className="font-semibold text-white">Authy</span> などの<br />
                認証アプリでQRコードをスキャンしてください
              </div>

              {qrCode ? (
                <div className="bg-white p-3 rounded-xl">
                  {/* Supabase が SVG を返す */}
                  <div
                    className="w-48 h-48"
                    dangerouslySetInnerHTML={{ __html: qrCode }}
                  />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-800 rounded-xl animate-pulse" />
              )}

              {secret && (
                <div className="w-full">
                  <p className="text-xs text-slate-500 text-center mb-2">QRコードが読めない場合は手動入力</p>
                  <div className="bg-slate-800 rounded-lg px-4 py-2 text-center">
                    <code className="text-xs text-slate-300 tracking-widest break-all">{secret}</code>
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep("verify")}
                disabled={!qrCode}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-40 min-h-[44px]"
                style={{ backgroundColor: "#00B900" }}
              >
                スキャンしました →
              </button>
            </div>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <p className="text-sm text-slate-300 text-center leading-relaxed">
                認証アプリに表示された<br />
                <span className="font-semibold text-white">6桁のコード</span>を入力してください
              </p>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9\s]*"
                maxLength={7}
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
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
                {loading ? "確認中..." : "設定を完了する"}
              </button>

              <button
                type="button"
                onClick={() => setStep("qr")}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                ← QRコードに戻る
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
