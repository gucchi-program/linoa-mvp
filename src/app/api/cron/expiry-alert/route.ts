import { NextRequest, NextResponse } from "next/server";
import { pushMessage } from "@/lib/line";
import { getExpiringItems, markExpiryNotified } from "@/lib/db";

/**
 * 賞味期限アラート配信 API
 *
 * VPSのcrontabから毎日9:00（JST）に呼び出される。
 * 期限が2日以内に迫っている未通知アイテムを持つ店舗に
 * LINEプッシュメッセージを送信する。
 *
 * セキュリティ: CRON_SECRET ヘッダーで認証
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 期限2日以内の未通知アイテムを取得
    const items = await getExpiringItems(2);

    if (items.length === 0) {
      return NextResponse.json({ status: "ok", sent: 0, items: 0 });
    }

    // 店舗ごとにグループ化
    const storeMap = new Map<string, {
      lineUserId: string;
      storeName: string;
      items: typeof items;
    }>();

    for (const item of items) {
      const storeData = item.stores as unknown as { line_user_id: string; store_name: string | null };
      const existing = storeMap.get(item.store_id);
      if (existing) {
        existing.items.push(item);
      } else {
        storeMap.set(item.store_id, {
          lineUserId: storeData.line_user_id,
          storeName: storeData.store_name ?? "お店",
          items: [item],
        });
      }
    }

    // 店舗ごとにアラート送信
    let sent = 0;
    const notifiedIds: string[] = [];

    for (const [, storeData] of storeMap) {
      try {
        const now = new Date();
        const jstOffset = 9 * 60 * 60 * 1000;
        const todayStr = new Date(now.getTime() + jstOffset).toISOString().split("T")[0];

        const lines = storeData.items.map((item) => {
          const daysLeft = Math.ceil(
            (new Date(item.expiry_date).getTime() - new Date(todayStr).getTime()) / (24 * 60 * 60 * 1000)
          );
          const qty = item.quantity ? `（${item.quantity}）` : "";
          const urgency = daysLeft <= 0 ? "期限切れ" : `あと${daysLeft}日`;
          return `・${item.item_name}${qty} → ${item.expiry_date}（${urgency}）`;
        });

        const message = [
          `${storeData.storeName}さん、賞味期限のお知らせです。`,
          "",
          ...lines,
          "",
          "早めに使い切るか、メニューに活用してみませんか？",
        ].join("\n");

        await pushMessage(storeData.lineUserId, [
          { type: "text", text: message },
        ]);

        notifiedIds.push(...storeData.items.map((i) => i.id));
        sent++;
      } catch (error) {
        console.error(`Expiry alert failed for store:`, error);
      }
    }

    // 通知済みフラグを更新
    await markExpiryNotified(notifiedIds);

    return NextResponse.json({
      status: "ok",
      stores: sent,
      items: notifiedIds.length,
    });
  } catch (error) {
    console.error("Expiry alert cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
