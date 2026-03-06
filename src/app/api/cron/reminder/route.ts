import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { pushMessage } from "@/lib/line";

/**
 * 日報リマインダー配信 API
 *
 * VPSのcrontabから毎日20:00（JST）に呼び出される。
 * その日まだ日報を提出していないオンボーディング完了済みの店舗に
 * LINEプッシュメッセージを送信する。
 *
 * セキュリティ: CRON_SECRET ヘッダーで認証（外部から叩けないようにする）
 */
export async function GET(request: NextRequest) {
  // 認証チェック
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 今日の日付（JST）
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(now.getTime() + jstOffset);
    const today = jstDate.toISOString().split("T")[0];

    // オンボーディング完了済みの全店舗を取得
    const { data: stores, error: storesError } = await supabase
      .from("stores")
      .select("id, line_user_id, store_name")
      .eq("onboarding_completed", true);

    if (storesError || !stores) {
      console.error("Failed to fetch stores:", storesError);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // 今日の日報が存在する店舗IDを取得
    const { data: todayReports } = await supabase
      .from("daily_reports")
      .select("store_id")
      .eq("report_date", today);

    const reportedStoreIds = new Set(
      (todayReports ?? []).map((r) => r.store_id)
    );

    // 未提出の店舗にリマインダー送信
    const targets = stores.filter((s) => !reportedStoreIds.has(s.id));

    let sent = 0;
    for (const store of targets) {
      try {
        const storeName = store.store_name ?? "お店";
        await pushMessage(store.line_user_id, [
          {
            type: "text",
            text: `${storeName}さん、今日もお疲れさまです！\n\nまだ今日の日報が届いていないようです。\n「日報」と送って、今日の振り返りをしませんか？`,
          },
        ]);
        sent++;
      } catch (error) {
        // ブロック済みユーザー等でエラーが出ても他の送信は続行
        console.error(`Reminder failed for ${store.id}:`, error);
      }
    }

    return NextResponse.json({
      status: "ok",
      date: today,
      total: stores.length,
      skipped: reportedStoreIds.size,
      sent,
    });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
