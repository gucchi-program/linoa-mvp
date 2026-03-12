"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, Cell,
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

type Period = "7" | "30" | "all";

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
  const [period, setPeriod] = useState<Period>("30");

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

  // 期間フィルター適用済みレポート
  const filteredReports = useMemo(() => {
    if (!store) return [];
    if (period === "all") return store.reports;
    const days = parseInt(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return store.reports.filter((r) => r.report_date >= cutoffStr);
  }, [store, period]);

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

  // グラフ用データ
  const chartData = filteredReports.map((r) => ({
    date: r.report_date.slice(5),
    売上: r.revenue ?? 0,
    客数: r.customer_count ?? 0,
    予約: r.reservation_count ?? 0,
    客単価: r.customer_count && r.customer_count > 0
      ? Math.round((r.revenue ?? 0) / r.customer_count)
      : 0,
  }));

  // 集計値
  const totalRevenue = filteredReports.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
  const totalCustomers = filteredReports.reduce((sum, r) => sum + (r.customer_count ?? 0), 0);
  const avgUnitPrice = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
  const reportCount = filteredReports.length;
  const avgDailyRevenue = reportCount > 0 ? Math.round(totalRevenue / reportCount) : 0;

  // 前週比計算
  const weekComparison = calcWeekComparison(store.reports);

  // 曜日別分析
  const dayOfWeekData = calcDayOfWeekStats(filteredReports);

  // 天候別分析
  const weatherData = calcWeatherStats(filteredReports);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {store.store_name ?? "未設定"}
            </h1>
            <p className="text-sm text-gray-500">
              {store.genre ?? ""} {store.seat_count ? `${store.seat_count}席` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 期間切り替え */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {([["7", "7日"], ["30", "30日"], ["all", "全期間"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setPeriod(val)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === val
                      ? "bg-white shadow text-gray-800 font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {/* 複数店舗切り替え */}
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
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <SummaryCard
            label="売上合計"
            value={`¥${totalRevenue.toLocaleString()}`}
            sub={weekComparison.revenue !== null ? `前週比 ${weekComparison.revenue > 0 ? "+" : ""}${weekComparison.revenue}%` : undefined}
            subColor={weekComparison.revenue !== null ? (weekComparison.revenue >= 0 ? "text-green-600" : "text-red-500") : undefined}
          />
          <SummaryCard
            label="客数合計"
            value={`${totalCustomers}人`}
            sub={weekComparison.customers !== null ? `前週比 ${weekComparison.customers > 0 ? "+" : ""}${weekComparison.customers}%` : undefined}
            subColor={weekComparison.customers !== null ? (weekComparison.customers >= 0 ? "text-green-600" : "text-red-500") : undefined}
          />
          <SummaryCard label="平均客単価" value={`¥${avgUnitPrice.toLocaleString()}`} />
          <SummaryCard label="日平均売上" value={`¥${avgDailyRevenue.toLocaleString()}`} sub={`${reportCount}日分`} />
        </div>

        {/* 日報がない場合 */}
        {reportCount === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            この期間の日報データがありません。
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

            {/* 曜日別・天候別分析 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 曜日別分析 */}
              {dayOfWeekData.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-lg font-semibold mb-4">曜日別 平均売上</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip
                        formatter={(value) => `¥${Number(value).toLocaleString()}`}
                        labelFormatter={(label) => `${label}曜日`}
                      />
                      <Bar dataKey="平均売上" radius={[4, 4, 0, 0]}>
                        {dayOfWeekData.map((entry, i) => (
                          <Cell key={i} fill={entry.isMax ? "#6366f1" : entry.isMin ? "#f87171" : "#a5b4fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-xs text-gray-500 flex gap-4 justify-center">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-sm inline-block"></span>最高</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm inline-block"></span>最低</span>
                  </div>
                </div>
              )}

              {/* 天候別分析 */}
              {weatherData.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-lg font-semibold mb-4">天候別 平均売上</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={weatherData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" fontSize={12} />
                      <YAxis type="category" dataKey="weather" fontSize={12} width={80} />
                      <Tooltip
                        formatter={(value) => `¥${Number(value).toLocaleString()}`}
                      />
                      <Bar dataKey="平均売上" fill="#6366f1" radius={[0, 4, 4, 0]}>
                        {weatherData.map((entry, i) => (
                          <Cell key={i} fill={WEATHER_COLORS[entry.weather] ?? "#a5b4fc"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {weatherData.map((w) => `${w.weather}: ${w.count}日`).join(" / ")}
                  </div>
                </div>
              )}
            </div>

            {/* 曜日別 詳細テーブル */}
            {dayOfWeekData.length > 0 && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-lg font-semibold mb-4">曜日別サマリー</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-500">
                        <th className="py-2 px-2">曜日</th>
                        <th className="py-2 px-2">日数</th>
                        <th className="py-2 px-2">平均売上</th>
                        <th className="py-2 px-2">平均客数</th>
                        <th className="py-2 px-2">平均客単価</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayOfWeekData.map((d) => (
                        <tr key={d.day} className={`border-b ${d.isMax ? "bg-indigo-50" : d.isMin ? "bg-red-50" : "hover:bg-gray-50"}`}>
                          <td className="py-2 px-2 font-medium">{d.day}</td>
                          <td className="py-2 px-2">{d.count}日</td>
                          <td className="py-2 px-2">¥{d.平均売上.toLocaleString()}</td>
                          <td className="py-2 px-2">{d.avgCustomers}人</td>
                          <td className="py-2 px-2">¥{d.avgUnitPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 直近の日報一覧 */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">直近の日報</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="py-2 px-2">日付</th>
                      <th className="py-2 px-2">曜日</th>
                      <th className="py-2 px-2">天気</th>
                      <th className="py-2 px-2">売上</th>
                      <th className="py-2 px-2">客数</th>
                      <th className="py-2 px-2">予約</th>
                      <th className="py-2 px-2">所感</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredReports].reverse().slice(0, 14).map((r) => {
                      const dow = getDayOfWeek(r.report_date);
                      return (
                        <tr key={r.report_date} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 whitespace-nowrap">{r.report_date}</td>
                          <td className="py-2 px-2 whitespace-nowrap text-xs">{dow}</td>
                          <td className="py-2 px-2 whitespace-nowrap text-xs">{r.weather ?? "-"}</td>
                          <td className="py-2 px-2">¥{(r.revenue ?? 0).toLocaleString()}</td>
                          <td className="py-2 px-2">{r.customer_count ?? 0}人</td>
                          <td className="py-2 px-2">{r.reservation_count ?? 0}件</td>
                          <td className="py-2 px-2 max-w-[200px] truncate">
                            {r.memo ?? "-"}
                          </td>
                        </tr>
                      );
                    })}
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

// ============================================
// サマリーカードコンポーネント
// ============================================
function SummaryCard({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      {sub && (
        <p className={`text-xs mt-1 ${subColor ?? "text-gray-400"}`}>{sub}</p>
      )}
    </div>
  );
}

// ============================================
// 前週比計算
// 今週（直近7日）と前週（8〜14日前）を比較
// ============================================
function calcWeekComparison(reports: StoreData["reports"]) {
  const now = new Date();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(now.getDate() - 14);
  const nowStr = now.toISOString().split("T")[0];
  const weekAgoStr = weekAgo.toISOString().split("T")[0];
  const twoWeeksAgoStr = twoWeeksAgo.toISOString().split("T")[0];

  const thisWeek = reports.filter((r) => r.report_date > weekAgoStr && r.report_date <= nowStr);
  const lastWeek = reports.filter((r) => r.report_date > twoWeeksAgoStr && r.report_date <= weekAgoStr);

  if (lastWeek.length === 0) return { revenue: null, customers: null };

  const thisRevenue = thisWeek.reduce((s, r) => s + (r.revenue ?? 0), 0);
  const lastRevenue = lastWeek.reduce((s, r) => s + (r.revenue ?? 0), 0);
  const thisCustomers = thisWeek.reduce((s, r) => s + (r.customer_count ?? 0), 0);
  const lastCustomers = lastWeek.reduce((s, r) => s + (r.customer_count ?? 0), 0);

  return {
    revenue: lastRevenue > 0 ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100) : null,
    customers: lastCustomers > 0 ? Math.round(((thisCustomers - lastCustomers) / lastCustomers) * 100) : null,
  };
}

// ============================================
// 曜日別統計
// ============================================
const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_NAMES[d.getDay()];
}

function calcDayOfWeekStats(reports: StoreData["reports"]) {
  const stats: Record<number, { revenue: number; customers: number; count: number }> = {};

  for (const r of reports) {
    const d = new Date(r.report_date + "T00:00:00");
    const dow = d.getDay();
    if (!stats[dow]) stats[dow] = { revenue: 0, customers: 0, count: 0 };
    stats[dow].revenue += r.revenue ?? 0;
    stats[dow].customers += r.customer_count ?? 0;
    stats[dow].count++;
  }

  const result = Object.entries(stats).map(([dow, s]) => {
    const avgRevenue = Math.round(s.revenue / s.count);
    const avgCustomers = Math.round(s.customers / s.count);
    return {
      dayIndex: parseInt(dow),
      day: DAY_NAMES[parseInt(dow)],
      平均売上: avgRevenue,
      avgCustomers,
      avgUnitPrice: avgCustomers > 0 ? Math.round(avgRevenue / avgCustomers) : 0,
      count: s.count,
      isMax: false,
      isMin: false,
    };
  });

  // 月曜始まりでソート
  result.sort((a, b) => ((a.dayIndex + 6) % 7) - ((b.dayIndex + 6) % 7));

  if (result.length >= 2) {
    const revenues = result.map((r) => r.平均売上);
    const max = Math.max(...revenues);
    const min = Math.min(...revenues);
    result.forEach((r) => {
      if (r.平均売上 === max) r.isMax = true;
      if (r.平均売上 === min) r.isMin = true;
    });
  }

  return result;
}

// ============================================
// 天候別統計
// ============================================
const WEATHER_COLORS: Record<string, string> = {
  "晴れ": "#f59e0b",
  "くもり": "#9ca3af",
  "雨": "#3b82f6",
  "雪": "#93c5fd",
};

function calcWeatherStats(reports: StoreData["reports"]) {
  const stats: Record<string, { revenue: number; customers: number; count: number }> = {};

  for (const r of reports) {
    if (!r.weather) continue;
    // 天気文字列から主要部分を抽出（「晴れ（5℃〜15℃）」→「晴れ」）
    const weatherName = r.weather.split("（")[0].trim();
    if (!stats[weatherName]) stats[weatherName] = { revenue: 0, customers: 0, count: 0 };
    stats[weatherName].revenue += r.revenue ?? 0;
    stats[weatherName].customers += r.customer_count ?? 0;
    stats[weatherName].count++;
  }

  return Object.entries(stats)
    .map(([weather, s]) => ({
      weather,
      平均売上: Math.round(s.revenue / s.count),
      avgCustomers: Math.round(s.customers / s.count),
      count: s.count,
    }))
    .sort((a, b) => b.平均売上 - a.平均売上);
}
