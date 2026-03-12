import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { pushMessage } from "@/lib/line";
import { generateSuggestions } from "@/lib/ai-suggestion";

/**
 * AI施策提案配信 API
 *
 * VPSのcrontabから水曜・金曜の12:00（JST）に呼び出される。
 * 日報データを分析し、具体的なアクション提案をLINEプッシュで配信する。
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
    // オンボーディング完了済みの全店舗を取得
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
        const suggestions = await generateSuggestions({
          storeId: store.id,
          storeName: store.store_name ?? "お店",
          genre: store.genre ?? "飲食店",
        });

        // 提案がなければスキップ
        if (suggestions.length === 0) {
          skipped++;
          continue;
        }

        // 優先度順にソート
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        // メッセージ構築
        const priorityIcon = { high: "!", medium: "?", low: "-" };
        const lines = suggestions.map((s) => {
          const icon = priorityIcon[s.priority];
          return `${icon} ${s.trigger}\n→ ${s.suggestion}`;
        });

        const message = [
          `${store.store_name ?? "お店"}さん、Linoaからの提案です。`,
          "",
          ...lines,
          "",
          "気になるものがあれば、詳しく聞いてください。",
        ].join("\n");

        await pushMessage(store.line_user_id, [
          { type: "text", text: message },
        ]);
        sent++;
      } catch (error) {
        console.error(`Suggestion failed for ${store.id}:`, error);
      }
    }

    return NextResponse.json({
      status: "ok",
      total: stores.length,
      sent,
      skipped,
    });
  } catch (error) {
    console.error("Suggestion cron error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
