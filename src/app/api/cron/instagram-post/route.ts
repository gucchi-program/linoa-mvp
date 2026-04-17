// ============================================
// Instagram自動投稿 Cronジョブ
// Vercel Cronが1分ごとに呼び出す。
// scheduled_at を過ぎた pending コンテンツを Instagram に投稿する。
//
// セキュリティ: CRON_SECRET環境変数で認証
// vercel.json の crons 設定と対になっている。
// ============================================

import { NextRequest, NextResponse } from "next/server";
import {
  getPendingContentsToPost,
  markContentAsPosted,
  markContentAsFailed,
  getStoreByLineUserId,
} from "@/lib/db";
import { postPhotoToInstagram } from "@/lib/instagram";
import { defaultLineClient } from "@/lib/line";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  // Vercel Cronからのリクエストのみ許可
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pendingContents = await getPendingContentsToPost();

  if (pendingContents.length === 0) {
    return NextResponse.json({ posted: 0 });
  }

  let postedCount = 0;
  let failedCount = 0;

  for (const content of pendingContents) {
    try {
      // storeのInstagram連携情報を取得
      const { data: store } = await supabase
        .from("stores")
        .select("instagram_access_token, instagram_business_account_id, line_user_id")
        .eq("id", content.store_id)
        .single();

      if (!store?.instagram_access_token || !store?.instagram_business_account_id) {
        console.error(`store ${content.store_id}: Instagram未連携のためスキップ`);
        await markContentAsFailed(content.id);
        failedCount++;
        continue;
      }

      // Instagram Graph APIで投稿
      await postPhotoToInstagram({
        accessToken: store.instagram_access_token,
        instagramUserId: store.instagram_business_account_id,
        imageUrl: content.image_url,
        caption: content.generated_text,
      });

      const postedAt = new Date().toISOString();
      await markContentAsPosted(content.id, postedAt);
      postedCount++;

      // オーナーにLINEで完了通知
      if (content.pending_line_user_id) {
        await defaultLineClient.pushMessage(content.pending_line_user_id, [
          {
            type: "text",
            text: "✅ Instagramに投稿しました！\nご確認ください。",
          },
        ]).catch((err) => {
          // 通知失敗は投稿成功に影響させない
          console.error("投稿完了通知の送信失敗:", err);
        });
      }
    } catch (error) {
      console.error(`content ${content.id} の投稿失敗:`, error);
      await markContentAsFailed(content.id);
      failedCount++;

      // オーナーにエラー通知
      if (content.pending_line_user_id) {
        await defaultLineClient.pushMessage(content.pending_line_user_id, [
          {
            type: "text",
            text: "⚠️ Instagramへの投稿に失敗しました。\nInstagram連携を確認してください。",
          },
        ]).catch(() => {});
      }
    }
  }

  return NextResponse.json({ posted: postedCount, failed: failedCount });
}
