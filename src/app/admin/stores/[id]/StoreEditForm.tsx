"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreEditForm({ store }: { store: Record<string, unknown> }) {
  const router = useRouter();
  // DBカラムは store_name / specialty。フォーム内部は name / concept で扱う
  const [form, setForm] = useState({
    name: (store.store_name as string) ?? "",
    owner_name: (store.owner_name as string) ?? "",
    store_type: (store.store_type as string) ?? "",
    area: (store.area as string) ?? "",
    price_range: (store.price_range as string) ?? "",
    concept: (store.specialty as string) ?? "",
    notes: (store.notes as string) ?? "",
    is_active: (store.is_active as boolean) ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, type } = e.target;
    const value = type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSaved(false); setLoading(true);
    try {
      const res = await fetch(`/api/admin/stores/${store.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "更新に失敗しました"); return; }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-6 border border-white/10">
      <h2 className="text-lg font-bold text-white mb-5">店舗情報を編集</h2>
      <div className="flex flex-col gap-5">

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">店舗名 <span className="text-red-400">*</span></label>
          <input name="name" type="text" required value={form.name} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">オーナー名</label>
          <input name="owner_name" type="text" value={form.owner_name} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">業態</label>
            <select name="store_type" value={form.store_type} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors">
              <option value="">選択</option>
              {["和食", "洋食", "イタリアン", "フレンチ", "中華", "焼肉", "寿司", "居酒屋", "ラーメン", "カフェ", "バー", "その他"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">エリア</label>
            <input name="area" type="text" value={form.area} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">コンセプト・こだわり</label>
          <textarea name="concept" rows={3} value={form.concept} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors resize-none leading-relaxed" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">管理メモ（内部用）</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors resize-none leading-relaxed" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="is_active" name="is_active" checked={form.is_active}
            onChange={handleChange} className="w-4 h-4 rounded cursor-pointer" />
          <label htmlFor="is_active" className="text-sm text-slate-300 cursor-pointer">アクティブ（LINEからアクセス可能）</label>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 px-4 py-3 rounded-xl">{error}</p>}
        {saved && <p className="text-green-400 text-sm bg-green-500/10 px-4 py-3 rounded-xl">保存しました</p>}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 min-h-[44px]"
          style={{ backgroundColor: "#00B900" }}>
          {loading ? "保存中..." : "変更を保存"}
        </button>
      </div>
    </form>
  );
}
