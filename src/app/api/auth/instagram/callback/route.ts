// ============================================
// Instagram OAuth コールバック
// Facebook OAuthのcodeをトークンに交換し、
// Instagram Business Account IDを取得してstoresに保存する
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  exchangeCodeForToken,
  getInstagramBusinessAccountId,
} from "@/lib/instagram";
import { getStoreByAuthUserId, updateStoreInstagram } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // OAuthエラー or ユーザーがキャンセルした場合
  if (error || !code) {
    return NextResponse.redirect(
      new URL("/store/settings?error=instagram_cancelled", request.url)
    );
  }

  // ログイン中のユーザーを確認
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/store/login", request.url));
  }

  const store = await getStoreByAuthUserId(user.id);
  if (!store) {
    return NextResponse.redirect(
      new URL("/store/settings?error=store_not_found", request.url)
    );
  }

  try {
    const redirectUri = `${new URL(request.url).origin}/api/auth/instagram/callback`;

    // code → アクセストークン交換
    const { accessToken, userId } = await exchangeCodeForToken({ code, redirectUri });

    // Instagram Business Account IDを取得
    const businessAccountId = await getInstagramBusinessAccountId({
      accessToken,
      userId,
    });

    if (!businessAccountId) {
      return NextResponse.redirect(
        new URL("/store/settings?error=no_instagram_business", request.url)
      );
    }

    // storesテーブルに保存
    await updateStoreInstagram(store.id, {
      instagramAccessToken: accessToken,
      instagramUserId: userId,
      instagramBusinessAccountId: businessAccountId,
    });

    return NextResponse.redirect(
      new URL("/store/settings?success=instagram_connected", request.url)
    );
  } catch (err) {
    console.error("Instagram OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/store/settings?error=token_exchange_failed", request.url)
    );
  }
}
