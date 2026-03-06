import { NextRequest, NextResponse } from "next/server";
import { verifyDashboardToken, getStoresByOwnerId, getDailyReports } from "@/lib/db";

// ダッシュボードAPI
// トークン認証 → オーナーの全店舗 + 日報データを返す
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "トークンが必要です" }, { status: 401 });
  }

  // トークン検証
  const ownerId = await verifyDashboardToken(token);
  if (!ownerId) {
    return NextResponse.json({ error: "無効または期限切れのトークンです" }, { status: 401 });
  }

  // オーナーの全店舗取得
  const stores = await getStoresByOwnerId(ownerId);

  // 各店舗の日報データを取得
  const storesWithReports = await Promise.all(
    stores.map(async (store) => {
      const reports = await getDailyReports(store.id);
      return {
        id: store.id,
        store_name: store.store_name,
        genre: store.genre,
        seat_count: store.seat_count,
        reports,
      };
    })
  );

  return NextResponse.json({ stores: storesWithReports });
}
