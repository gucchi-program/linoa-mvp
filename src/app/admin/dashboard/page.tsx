// ============================================
// 管理ダッシュボード
// ============================================

import { supabase } from "@/lib/supabase";
import AdminShell from "../components/AdminShell";

// admin画面はmiddlewareで role + MFA を強制済みなので Service Role で RLS をバイパスする
async function getStats() {
  const [storesResult, inquiriesResult, messagesResult] = await Promise.all([
    supabase.from("stores").select("id, is_active, created_at", { count: "exact" }),
    supabase.from("contact_requests").select("id, created_at", { count: "exact" }),
    supabase.from("messages").select("id", { count: "exact" }),
  ]);
  return {
    totalStores: storesResult.count ?? 0,
    activeStores: storesResult.data?.filter((s) => s.is_active).length ?? 0,
    totalInquiries: inquiriesResult.count ?? 0,
    totalMessages: messagesResult.count ?? 0,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "登録店舗数", value: stats.totalStores, sub: `アクティブ: ${stats.activeStores}` },
    { label: "資料請求数", value: stats.totalInquiries, sub: "累計" },
    { label: "総メッセージ数", value: stats.totalMessages, sub: "LINE経由" },
  ];

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-white mb-1">ダッシュボード</h1>
        <p className="text-slate-500 text-sm mb-8">Linoaの全体サマリ</p>

        {/* 統計カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {cards.map((card, i) => (
            <div key={i} className="bg-slate-900 rounded-2xl p-6 border border-white/10">
              <p className="text-slate-500 text-xs mb-2">{card.label}</p>
              <p className="text-4xl font-black text-white tracking-tight">{card.value}</p>
              <p className="text-slate-600 text-xs mt-1">{card.sub}</p>
            </div>
          ))}
        </div>

        {/* クイックリンク */}
        <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-4">クイックアクション</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/admin/stores/new", label: "新規店舗を登録する", desc: "店舗情報を入力して店舗コードを発行" },
            { href: "/admin/inquiries", label: "資料請求を確認する", desc: "未対応の資料請求一覧を表示" },
          ].map((item, i) => (
            <a
              key={i}
              href={item.href}
              className="bg-slate-900 hover:bg-slate-800 rounded-xl p-5 border border-white/10 transition-colors cursor-pointer group"
            >
              <p className="font-semibold text-white text-sm group-hover:text-green-400 transition-colors">{item.label} →</p>
              <p className="text-slate-500 text-xs mt-1">{item.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
