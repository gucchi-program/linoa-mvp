"use client";

// ============================================
// 新規店舗登録ページ
// 登録完了時に店舗コード（LINOA-XXXXX）を発行・表示
// ============================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminShell from "../../components/AdminShell";

type FormData = {
  name: string;
  owner_name: string;
  store_type: string;
  area: string;
  price_range: string;
  concept: string;
  notes: string;
};

function generateStoreCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 紛らわしい文字（I,O,1,0）を除外
  let code = "LINOA-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function NewStorePage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "", owner_name: "", store_type: "", area: "", price_range: "", concept: "", notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const storeCode = generateStoreCode();
      const res = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, store_code: storeCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登録に失敗しました");
        return;
      }
      setGeneratedCode(storeCode);
    } finally {
      setLoading(false);
    }
  }

  // 完了画面：店舗コード表示
  if (generatedCode) {
    return (
      <AdminShell>
        <div className="max-w-lg">
          <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-500/20">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path d="M6 14l5 5 11-11" stroke="#00B900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">店舗を登録しました</h2>
            <p className="text-slate-400 text-sm mb-6">オーナーにこの店舗コードをお伝えください</p>

            <div className="bg-slate-800 rounded-xl px-6 py-4 mb-6">
              <p className="text-xs text-slate-500 mb-2">店舗コード</p>
              <p className="text-3xl font-black text-white tracking-widest font-mono">{generatedCode}</p>
            </div>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              オーナーがLINEでこのコードを送信すると、<br />
              店舗と自動的に紐付けられます。
            </p>

            <div className="flex gap-3">
              <Link href="/admin/stores" className="flex-1 py-3 rounded-xl text-slate-300 text-sm font-semibold border border-white/10 hover:bg-white/5 transition-colors cursor-pointer text-center">
                店舗一覧へ
              </Link>
              <button
                onClick={() => { setGeneratedCode(null); setForm({ name: "", owner_name: "", store_type: "", area: "", price_range: "", concept: "", notes: "" }); }}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                style={{ backgroundColor: "#00B900" }}
              >
                続けて登録
              </button>
            </div>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin/stores" className="text-slate-500 hover:text-white transition-colors cursor-pointer text-sm">
            ← 店舗一覧
          </Link>
          <span className="text-slate-700">/</span>
          <h1 className="text-2xl font-bold text-white">新規店舗登録</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-6 border border-white/10">
          <div className="flex flex-col gap-5">

            {/* 店舗名 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                店舗名 <span className="text-red-400">*</span>
              </label>
              <input name="name" type="text" required value={form.name} onChange={handleChange}
                placeholder="例：炭火焼き 山田屋"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors" />
            </div>

            {/* オーナー名 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                オーナー名 <span className="text-red-400">*</span>
              </label>
              <input name="owner_name" type="text" required value={form.owner_name} onChange={handleChange}
                placeholder="例：山田 太郎"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors" />
            </div>

            {/* 業態・エリア */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">業態</label>
                <select name="store_type" value={form.store_type} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors">
                  <option value="">選択してください</option>
                  {["和食", "洋食", "イタリアン", "フレンチ", "中華", "焼肉", "寿司", "居酒屋", "ラーメン", "カフェ", "バー", "その他"].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">エリア</label>
                <input name="area" type="text" value={form.area} onChange={handleChange}
                  placeholder="例：大阪市北区"
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors" />
              </div>
            </div>

            {/* 価格帯 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">価格帯</label>
              <select name="price_range" value={form.price_range} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors">
                <option value="">選択してください</option>
                {["〜1,000円", "1,000〜2,000円", "2,000〜3,000円", "3,000〜5,000円", "5,000〜8,000円", "8,000円〜"].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* コンセプト */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                店舗コンセプト・こだわり
                <span className="ml-2 text-xs text-slate-500 font-normal">AIが文章生成に使います</span>
              </label>
              <textarea name="concept" rows={3} value={form.concept} onChange={handleChange}
                placeholder="例：地元産食材にこだわった炭火焼き専門店。アットホームな雰囲気で常連客が多い。"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors resize-none leading-relaxed" />
            </div>

            {/* 管理メモ */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                管理メモ
                <span className="ml-2 text-xs text-slate-500 font-normal">内部用（オーナーには見えません）</span>
              </label>
              <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                placeholder="例：2026/4/10 資料請求経由。担当：原口"
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors resize-none leading-relaxed" />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl" role="alert">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 min-h-[44px]"
              style={{ backgroundColor: "#00B900" }}>
              {loading ? "登録中..." : "登録して店舗コードを発行"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
