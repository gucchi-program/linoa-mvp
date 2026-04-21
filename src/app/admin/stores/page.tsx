// ============================================
// 店舗一覧ページ
// ============================================

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminShell from "../components/AdminShell";

// admin画面はmiddlewareで role + MFA を強制済みなので Service Role で RLS をバイパスする
async function getStores() {
  const { data } = await supabase
    .from("stores")
    .select("id, store_name, store_type, area, store_code, is_active, line_user_id, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">店舗管理</h1>
            <p className="text-slate-500 text-sm">全 {stores.length} 店舗</p>
          </div>
          <Link
            href="/admin/stores/new"
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer min-h-[44px] flex items-center"
            style={{ backgroundColor: "#00B900" }}
          >
            + 新規店舗登録
          </Link>
        </div>

        {stores.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-slate-500 text-sm">まだ店舗が登録されていません</p>
            <Link href="/admin/stores/new" className="mt-3 inline-block text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "#00B900" }}>
              最初の店舗を登録する →
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-2xl border border-white/10 overflow-hidden">
            {/* テーブルヘッダー */}
            <div className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-5 py-3 border-b border-white/10 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>店舗名</span>
              <span>店舗コード</span>
              <span>LINE連携</span>
              <span>登録日</span>
              <span>状態</span>
            </div>
            {/* 行 */}
            {stores.map((store) => (
              <Link
                key={store.id}
                href={`/admin/stores/${store.id}`}
                className="grid grid-cols-[1fr_120px_120px_100px_80px] gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer items-center"
              >
                <div>
                  <p className="text-white text-sm font-medium">{store.store_name}</p>
                  <p className="text-slate-500 text-xs">{store.store_type ?? "—"} / {store.area ?? "—"}</p>
                </div>
                <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-1 rounded-md">
                  {store.store_code ?? "未発行"}
                </span>
                <span className={`text-xs ${store.line_user_id ? "text-green-400" : "text-slate-600"}`}>
                  {store.line_user_id ? "連携済み" : "未連携"}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(store.created_at).toLocaleDateString("ja-JP")}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full text-center ${
                  store.is_active
                    ? "bg-green-500/20 text-green-400"
                    : "bg-slate-700 text-slate-500"
                }`}>
                  {store.is_active ? "有効" : "無効"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
