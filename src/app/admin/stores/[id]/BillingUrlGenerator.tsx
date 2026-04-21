"use client";

// ============================================
// admin: 店舗向け Checkout URL を生成してコピーする
// 営業委託が「LINEでURL送って契約してもらう」フロー用
// ============================================

import { useState } from "react";

type Props = {
  storeId: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
};

export default function BillingUrlGenerator({
  storeId,
  subscriptionStatus,
  currentPeriodEnd,
}: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleGenerate() {
    setGenerating(true);
    setErrorMsg("");
    setCopied(false);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "failed");
      }
      setUrl(data.url);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "URLの生成に失敗しました"
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMsg("クリップボードへのコピーに失敗しました");
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-5 border border-white/10">
      <h3 className="text-sm font-bold text-white mb-3">契約・決済</h3>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs text-slate-500">ステータス:</span>
        <StatusPill status={subscriptionStatus} />
        {currentPeriodEnd && (
          <span className="text-xs text-slate-500 ml-auto">
            次回更新: {new Date(currentPeriodEnd).toLocaleDateString("ja-JP")}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mb-4">
        未契約店舗に送る Checkout URL を生成します。このURLを
        LINE/メールでオーナーに送ると、そこから決済が完了します。
      </p>

      <button
        onClick={handleGenerate}
        disabled={generating}
        className="w-full py-2.5 rounded-lg font-semibold text-white text-sm bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {generating ? "生成中..." : "Checkout URL を生成"}
      </button>

      {errorMsg && (
        <p className="text-xs text-red-400 bg-red-950/50 mt-3 px-3 py-2 rounded-lg">
          {errorMsg}
        </p>
      )}

      {url && (
        <div className="mt-4">
          <div className="bg-slate-950 rounded-lg p-3 border border-white/5 mb-2">
            <p className="text-xs text-slate-400 break-all font-mono">{url}</p>
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-2 rounded-lg font-medium text-xs transition-colors bg-slate-800 hover:bg-slate-700 text-white"
          >
            {copied ? "コピーしました" : "URL をコピー"}
          </button>
          <p className="text-xs text-slate-500 mt-2">
            ※ 24時間で期限切れになります。期限切れ後は再生成してください。
          </p>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string | null }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "ご契約中", color: "bg-emerald-500/20 text-emerald-400" },
    trialing: {
      label: "トライアル",
      color: "bg-emerald-500/20 text-emerald-400",
    },
    past_due: {
      label: "支払い遅延",
      color: "bg-amber-500/20 text-amber-400",
    },
    unpaid: { label: "未払い", color: "bg-amber-500/20 text-amber-400" },
    canceled: { label: "解約済み", color: "bg-slate-500/20 text-slate-400" },
    incomplete: {
      label: "決済未完了",
      color: "bg-slate-500/20 text-slate-400",
    },
    incomplete_expired: {
      label: "期限切れ",
      color: "bg-slate-500/20 text-slate-400",
    },
  };
  const s = status && map[status] ? map[status] : {
    label: "未契約",
    color: "bg-slate-500/20 text-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${s.color}`}
    >
      {s.label}
    </span>
  );
}
