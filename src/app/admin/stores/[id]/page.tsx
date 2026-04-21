// ============================================
// 店舗詳細・編集ページ
// ============================================

import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminShell from "../../components/AdminShell";
import StoreEditForm from "./StoreEditForm";
import BillingUrlGenerator from "./BillingUrlGenerator";

// admin画面はmiddlewareで role + MFA を強制済みなので Service Role で RLS をバイパスする
async function getStore(id: string) {
  const { data } = await supabase.from("stores").select("*").eq("id", id).single();
  return data;
}

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getStore(id);
  if (!store) notFound();

  return (
    <AdminShell>
      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/stores" className="text-slate-500 hover:text-white transition-colors cursor-pointer text-sm">
            ← 店舗一覧
          </Link>
          <span className="text-slate-700">/</span>
          <span className="text-slate-300 text-sm">{store.store_name}</span>
        </div>

        {/* 店舗コード表示 */}
        <div className="bg-slate-900 rounded-2xl p-5 border border-white/10 mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-1">店舗コード</p>
            <p className="font-mono text-2xl font-black text-white tracking-widest">
              {store.store_code ?? "未発行"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">LINE連携</p>
            <span className={`text-sm font-semibold ${store.line_user_id ? "text-green-400" : "text-slate-500"}`}>
              {store.line_user_id ? "連携済み" : "未連携"}
            </span>
          </div>
        </div>

        {/* 契約・決済URL生成 */}
        <div className="mb-6">
          <BillingUrlGenerator
            storeId={store.id}
            subscriptionStatus={store.subscription_status ?? null}
            currentPeriodEnd={store.current_period_end ?? null}
          />
        </div>

        <StoreEditForm store={store} />
      </div>
    </AdminShell>
  );
}
