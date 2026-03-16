"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface StoreInfo {
  id: string;
  store_name: string | null;
  genre: string | null;
  seat_count: number | null;
  reports: { report_date: string }[];
}

// Suspense境界で囲むためのラッパー
export default function DashboardIndexPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <DashboardIndex />
    </Suspense>
  );
}

// ダッシュボードトップ
// 店舗が1つ → 自動リダイレクト
// 店舗が複数 → 店舗選択画面
function DashboardIndex() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [stores, setStores] = useState<StoreInfo[]>([]);
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
        const storeList: StoreInfo[] = data.stores;
        if (storeList.length === 1) {
          router.replace(`/dashboard/${storeList[0].id}?token=${token}`);
        } else if (storeList.length === 0) {
          setError("店舗データがありません");
        } else {
          setStores(storeList);
        }
      })
      .catch(() => setError("データの取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [token, router]);

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
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Linoa ダッシュボード</h1>
          <p className="text-sm text-gray-500">店舗を選択してください</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* 本部ダッシュボード（複数店舗の横断比較） */}
        {stores.length > 1 && (
          <a
            href={`/dashboard/overview?token=${token}`}
            className="block bg-indigo-600 text-white rounded-lg shadow p-4 hover:bg-indigo-700 transition-colors"
          >
            <h2 className="text-lg font-semibold">本部ダッシュボード（全店舗比較）</h2>
            <p className="text-sm text-indigo-200 mt-0.5">
              {stores.length}店舗の売上・客数を横断比較する
            </p>
          </a>
        )}

        {stores.map((store) => (
          <a
            key={store.id}
            href={`/dashboard/${store.id}?token=${token}`}
            className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              {store.store_name ?? "未設定"}
            </h2>
            <p className="text-sm text-gray-500">
              {store.genre ?? ""} {store.seat_count ? `${store.seat_count}席` : ""}
              {" | "}日報 {store.reports.length}件
            </p>
          </a>
        ))}
      </main>
    </div>
  );
}
