"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

// APIから返る本部ダッシュボードの型
interface StoreOverview {
  id: string;
  store_name: string | null;
  genre: string | null;
  totalRevenue: number;
  totalCustomers: number;
  avgRevenuePerDay: number;
  recentRevenue: number;
  recentCustomers: number;
  avgUnitPrice: number;
  recentReports: {
    report_date: string;
    revenue: number | null;
    customer_count: number | null;
  }[];
}

// 金額をカンマ区切りで表示
function formatYen(amount: number): string {
  return amount.toLocaleString() + "円";
}

export default function OverviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <OverviewContent />
    </Suspense>
  );
}

function OverviewContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [stores, setStores] = useState<StoreOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("認証トークンがありません");
      setLoading(false);
      return;
    }

    fetch(`/api/dashboard/overview?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("認証エラー");
        return res.json();
      })
      .then((data) => setStores(data.stores))
      .catch(() => setError("データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [token]);

  // 全店舗の売上を日付ごとに合算（棒グラフ用）
  const chartData = buildChartData(stores);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">本部ダッシュボード</h1>
              <p className="text-sm text-gray-500">全店舗比較（直近30日）</p>
            </div>
            <a
              href={`/dashboard?token=${token}`}
              className="text-sm text-blue-600 hover:underline"
            >
              ← 店舗選択に戻る
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* 全店舗比較テーブル */}
        <section className="bg-white rounded-lg shadow p-4">
          <h2 className="text-base font-semibold text-gray-700 mb-3">店舗別サマリー（直近7日）</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-gray-500 text-left">
                  <th className="pb-2 pr-4">店舗名</th>
                  <th className="pb-2 pr-4 text-right">7日売上</th>
                  <th className="pb-2 pr-4 text-right">7日客数</th>
                  <th className="pb-2 pr-4 text-right">客単価</th>
                  <th className="pb-2 text-right">日平均売上</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <a
                        href={`/dashboard/${store.id}?token=${token}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {store.store_name ?? "未設定"}
                      </a>
                      {store.genre && (
                        <span className="text-xs text-gray-400 ml-1">({store.genre})</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-right font-medium">{formatYen(store.recentRevenue)}</td>
                    <td className="py-2 pr-4 text-right">{store.recentCustomers}人</td>
                    <td className="py-2 pr-4 text-right">{formatYen(store.avgUnitPrice)}</td>
                    <td className="py-2 text-right text-gray-600">{formatYen(store.avgRevenuePerDay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50">
                  <td className="py-2 pr-4 font-semibold text-gray-700">合計</td>
                  <td className="py-2 pr-4 text-right font-semibold">
                    {formatYen(stores.reduce((s, st) => s + st.recentRevenue, 0))}
                  </td>
                  <td className="py-2 pr-4 text-right font-semibold">
                    {stores.reduce((s, st) => s + st.recentCustomers, 0)}人
                  </td>
                  <td className="py-2 pr-4 text-right">-</td>
                  <td className="py-2 text-right font-semibold">
                    {formatYen(stores.reduce((s, st) => s + st.avgRevenuePerDay, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 全店舗合計の売上推移グラフ */}
        {chartData.length > 0 && (
          <section className="bg-white rounded-lg shadow p-4">
            <h2 className="text-base font-semibold text-gray-700 mb-3">全店舗合計 売上推移（直近30日）</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)} // MM-DD表示
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
                />
                <Tooltip
                  formatter={(v: number | undefined) => [v != null ? v.toLocaleString() + "円" : "-", "売上"]}
                  labelFormatter={(l) => l}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[2, 2, 0, 0]} name="売上" />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* 店舗別カード */}
        <section>
          <h2 className="text-base font-semibold text-gray-700 mb-3">店舗別詳細</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {stores.map((store) => (
              <a
                key={store.id}
                href={`/dashboard/${store.id}?token=${token}`}
                className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-1">
                  {store.store_name ?? "未設定"}
                  {store.genre && <span className="text-xs text-gray-400 ml-2 font-normal">{store.genre}</span>}
                </h3>
                <div className="text-sm text-gray-600 space-y-0.5">
                  <p>30日売上: <span className="font-medium text-gray-800">{formatYen(store.totalRevenue)}</span></p>
                  <p>30日客数: <span className="font-medium text-gray-800">{store.totalCustomers}人</span></p>
                  <p>日平均: <span className="font-medium text-gray-800">{formatYen(store.avgRevenuePerDay)}</span></p>
                </div>
                <p className="text-xs text-blue-500 mt-2">詳細を見る →</p>
              </a>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

// 全店舗の日報を日付ごとに合算する
function buildChartData(stores: StoreOverview[]): { date: string; revenue: number }[] {
  const map = new Map<string, number>();

  for (const store of stores) {
    for (const r of store.recentReports) {
      const prev = map.get(r.report_date) ?? 0;
      map.set(r.report_date, prev + (r.revenue ?? 0));
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({ date, revenue }));
}
