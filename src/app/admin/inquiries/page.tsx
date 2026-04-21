// ============================================
// 資料請求一覧ページ
// ============================================

import { supabase } from "@/lib/supabase";
import AdminShell from "../components/AdminShell";

// admin画面はmiddlewareで role + MFA を強制済みなので Service Role で RLS をバイパスする
async function getInquiries() {
  const { data } = await supabase
    .from("contact_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <AdminShell>
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">資料請求</h1>
          <p className="text-slate-500 text-sm">全 {inquiries.length} 件</p>
        </div>

        {inquiries.length === 0 ? (
          <div className="bg-slate-900 rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-slate-500 text-sm">まだ資料請求はありません</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {inquiries.map((item) => (
              <div key={item.id} className="bg-slate-900 rounded-2xl p-5 border border-white/10">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-white">{item.owner_name}</p>
                    <p className="text-slate-400 text-sm">{item.store_name}</p>
                  </div>
                  <span className="text-xs text-slate-500 shrink-0">
                    {new Date(item.created_at).toLocaleDateString("ja-JP", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  <a href={`mailto:${item.email}`} className="hover:text-white transition-colors cursor-pointer">
                    {item.email}
                  </a>
                  {item.phone && <span>{item.phone}</span>}
                </div>
                {item.message && (
                  <div className="mt-3 px-4 py-3 bg-slate-800 rounded-xl text-sm text-slate-300 leading-relaxed">
                    {item.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
