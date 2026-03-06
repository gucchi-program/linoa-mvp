import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { pushMessage } from "@/lib/line";
import { generateWeeklyReport } from "@/lib/claude";

/**
 * AI週次レポート配信 API
 *
 * VPSのcrontabから毎週月曜9:00（JST）に呼び出される。
 * 先週（月〜日）の日報データをClaude APIで分析し、
 * 売上トレンド・改善提案をLINEプッシュメッセージで配信する。
 *
 * 日報が0件の店舗にはスキップ（分析する材料がないため）
 */
export async function GET(request: NextRequest) {
  // 認証チェック
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 先週の月曜〜日曜の日付範囲を計算（JST）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstNow = new Date(now.getTime() + jstOffset);

    // 今日（月曜）から7日前が先週月曜、1日前が先週日曜
    const lastSunday = new Date(jstNow);
    lastSunday.setDate(jstNow.getDate() - 1);
    const lastMonday = new Date(lastSunday);
    lastMonday.setDate(lastSunday.getDate() - 6);

    const startDate = lastMonday.toISOString().split("T")[0];
    const endDate = lastSunday.toISOString().split("T")[0];

    // オンボーディング完了済みの全店舗
    const { data: stores, error: storesError } = await supabase
      .from("stores")
      .select("id, line_user_id, store_name, genre")
      .eq("onboarding_completed", true);

    if (storesError || !stores) {
      console.error("Failed to fetch stores:", storesError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    let sent = 0;
    let skipped = 0;

    for (const store of stores) {
      try {
        // 先週の日報データを取得
        const { data: reports } = await supabase
          .from("daily_reports")
          .select("report_date, revenue, customer_count, reservation_count, weather, memo")
          .eq("store_id", store.id)
          .gte("report_date", startDate)
          .lte("report_date", endDate)
          .order("report_date", { ascending: true });

        // 日報が2件未満の場合はスキップ（分析材料不足）
        if (!reports || reports.length < 2) {
          skipped++;
          continue;
        }

        // Claude APIで週次分析を生成
        const report = await generateWeeklyReport({
          storeName: store.store_name ?? "お店",
          genre: store.genre ?? "飲食店",
          startDate,
          endDate,
          reports,
        });

        // LINEに配信（長文になるので2メッセージに分割）
        await pushMessage(store.line_user_id, [
          {
            type: "text",
            text: `【週次レポート】${startDate} 〜 ${endDate}\n\n${report.summary}`,
          },
          {
            type: "text",
            text: `【今週のアドバイス】\n\n${report.advice}`,
          },
        ]);
        sent++;
      } catch (error) {
        console.error(`Weekly report failed for ${store.id}:`, error);
      }
    }

    return NextResponse.json({
      status: "ok",
      period: `${startDate} - ${endDate}`,
      total: stores.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error("Weekly report cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
