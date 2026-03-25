import { NextRequest, NextResponse } from "next/server";
import { verifyDashboardToken, getStoresByOwnerId, getDailyReportsForStores } from "@/lib/db";

// ============================================
// 本部ダッシュボード用 全店舗データAPI
// GET /api/dashboard/overview?token=xxx
// token → owner_id → 全店舗 → 直近30日日報 → 集計して返す
// ============================================

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "トークンが必要です" }, { status: 401 });
  }

  const ownerId = await verifyDashboardToken(token);
  if (!ownerId) {
    return NextResponse.json({ error: "無効または期限切れのトークンです" }, { status: 401 });
  }

  // オーナーの全店舗を取得
  const stores = await getStoresByOwnerId(ownerId);
  if (stores.length === 0) {
    return NextResponse.json({ stores: [] });
  }

  const storeIds = stores.map((s) => s.id);

  // 全店舗の直近30日日報を一括取得
  const allReports = await getDailyReportsForStores(storeIds, 30);

  // 店舗ごとに集計
  const storeData = stores.map((store) => {
    const reports = allReports.filter((r) => r.store_id === store.id);

    const totalRevenue = reports.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    const totalCustomers = reports.reduce((sum, r) => sum + (r.customer_count ?? 0), 0);
    const avgRevenuePerDay = reports.length > 0 ? Math.round(totalRevenue / reports.length) : 0;

    // 直近7日の集計（概要テーブル表示用）
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0];

    const recentReports = reports.filter((r) => r.report_date >= sevenDaysAgoStr);
    const recentRevenue = recentReports.reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    const recentCustomers = recentReports.reduce((sum, r) => sum + (r.customer_count ?? 0), 0);
    const avgUnitPrice = recentCustomers > 0 ? Math.round(recentRevenue / recentCustomers) : 0;

    return {
      id: store.id,
      store_name: store.store_name,
      genre: store.genre,
      totalRevenue,
      totalCustomers,
      avgRevenuePerDay,
      recentRevenue,
      recentCustomers,
      avgUnitPrice,
      // グラフ用に日別データも返す
      recentReports: reports.map((r) => ({
        report_date: r.report_date,
        revenue: r.revenue,
        customer_count: r.customer_count,
      })),
    };
  });

  return NextResponse.json({ stores: storeData });
}
