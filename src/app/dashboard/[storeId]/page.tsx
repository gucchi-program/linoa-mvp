"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from "recharts";

// APIから返る店舗データの型
interface StoreData {
  id: string;
  store_name: string | null;
  genre: string | null;
  seat_count: number | null;
  reports: {
    report_date: string;
    revenue: number | null;
    customer_count: number | null;
    reservation_count: number | null;
    weather: string | null;
    memo: string | null;
  }[];
}

// Suspense境界で囲むラッパー
export default function DashboardStorePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;
  const token = searchParams.get("token");

  const [store, setStore] = useState<StoreData | null>(null);
  const [allStores, setAllStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("認証トークンがありません");
      setLoading(false);
      return;
    }

    fetch(`/api/dashboard?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("認証エラー");
        return res.json();
      })
      .then((data) => {
        setAllStores(data.stores);
        // URLのstoreIdに一致する店舗を表示
        const target = data.stores.find((s: StoreData) => s.id === storeId);
        if (target) {
          setStore(target);
        } else if (data.stores.length > 0) {
          setStore(data.stores[0]);
        } else {
          setError("店舗データがありません");
        }
      })
      .catch(() => setError("データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [token, storeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!store) return null;

  // グラフ用データ（日付を短縮表示）
  const chartData = store.reports.map((r) => ({
    date: r.report_date.slice(5), // "MM-DD"
    売上: r.revenue ?? 0,
    客数: r.customer_count ?? 0,
    予約: r.reservation_count ?? 0,
    客単価: r.customer_count && r.customer_count > 0
      ? Math.round((r.revenue ?? 0) / r.customer_count)
      : 0,
  }));

  // 集計値
  const totalRevenue = store.reports.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
  const totalCustomers = store.reports.reduce((sum, r) => sum + (r.customer_count ?? 0), 0);
  const avgUnitPrice = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  const reportCount = store.reports.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {store.store_name ?? "未設定"}
            </h1>
            <p className="text-sm text-gray-500">
              {store.genre ?? ""} {store.seat_count ? `${store.seat_count}席` : ""}
            </p>
          </div>
          {/* 複数店舗の場合、切り替えリンク */}
          {allStores.length > 1 && (
            <select
              className="text-sm border rounded px-2 py-1"
              value={store.id}
              onChange={(e) => {
                const selected = allStores.find((s) => s.id === e.target.value);
                if (selected) setStore(selected);
              }}
            >
              {allStores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.store_name ?? "未設定"}
                </option>
              ))}
            </select>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard label="累計売上" value={`¥${totalRevenue.toLocaleString()}`} />
          <SummaryCard label="累計客数" value={`${totalCustomers}人`} />
          <SummaryCard label="平均客単価" value={`¥${avgUnitPrice.toLocaleString()}`} />
          <SummaryCard label="日報件数" value={`${reportCount}件`} />
        </div>

        {/* 日報がない場合 */}
        {reportCount === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            まだ日報データがありません。LINEで「日報」と送って入力を始めましょう。
          </div>
        ) : (
          <>
            {/* 売上推移グラフ */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">売上推移</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(value) => `¥${Number(value).toLocaleString()}`} />
                  <Bar dataKey="売上" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 客数・客単価推移グラフ */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">客数・客単価推移</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis yAxisId="left" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="客数" stroke="#10b981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="客単価" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 直近の日報一覧 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">直近の日報</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2 px-2">日付</th>
                      <th className="py-2 px-2">天気</th>
                      <th className="py-2 px-2">売上</th>
                      <th className="py-2 px-2">客数</th>
                      <th className="py-2 px-2">予約</th>
                      <th className="py-2 px-2">所感</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...store.reports].reverse().slice(0, 14).map((r) => (
                      <tr key={r.report_date} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 whitespace-nowrap">{r.report_date}</td>
                        <td className="py-2 px-2 whitespace-nowrap text-xs">{r.weather ?? "-"}</td>
                        <td className="py-2 px-2">¥{(r.revenue ?? 0).toLocaleString()}</td>
                        <td className="py-2 px-2">{r.customer_count ?? 0}人</td>
                        <td className="py-2 px-2">{r.reservation_count ?? 0}件</td>
                        <td className="py-2 px-2 max-w-[200px] truncate">
                          {r.memo ?? "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* フッター */}
        <footer className="text-center text-sm text-gray-400 py-4">
          Powered by Linoa
        </footer>
      </main>
    </div>
  );
}

// サマリーカードコンポーネント
function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
