// ============================================
// Instagram Graph API クライアント
// フィード投稿の2ステップ（コンテナ作成→公開）を担う。
// アクセストークンと Instagram ユーザーIDは stores テーブルから取得する。
// ============================================

const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

// フィード投稿（写真 + キャプション）
// 戻り値: 投稿されたメディアID
export async function postPhotoToInstagram(params: {
  accessToken: string;
  instagramUserId: string;
  imageUrl: string;    // 公開アクセス可能なURL（Supabase Storage public URL）
  caption: string;
}): Promise<string> {
  // ステップ1: メディアコンテナを作成
  const containerRes = await fetch(
    `${GRAPH_API_BASE}/${params.instagramUserId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: params.imageUrl,
        caption: params.caption,
        access_token: params.accessToken,
      }),
    }
  );

  if (!containerRes.ok) {
    const err = await containerRes.text();
    throw new Error(`Instagram container creation failed: ${err}`);
  }

  const container = await containerRes.json();
  if (!container.id) {
    throw new Error(`Instagram container ID が取得できませんでした: ${JSON.stringify(container)}`);
  }

  // ステップ2: コンテナを公開
  const publishRes = await fetch(
    `${GRAPH_API_BASE}/${params.instagramUserId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: container.id,
        access_token: params.accessToken,
      }),
    }
  );

  if (!publishRes.ok) {
    const err = await publishRes.text();
    throw new Error(`Instagram publish failed: ${err}`);
  }

  const published = await publishRes.json();
  return published.id as string;
}

// Facebook OAuthコードをアクセストークンに交換する
export async function exchangeCodeForToken(params: {
  code: string;
  redirectUri: string;
}): Promise<{ accessToken: string; userId: string }> {
  const res = await fetch(`${GRAPH_API_BASE}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      redirect_uri: params.redirectUri,
      code: params.code,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${err}`);
  }

  const data = await res.json();

  // 短期トークン→長期トークン（60日間）に交換
  const longLivedRes = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?grant_type=fb_exchange_token` +
    `&client_id=${process.env.FACEBOOK_APP_ID}` +
    `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
    `&fb_exchange_token=${data.access_token}`
  );

  if (!longLivedRes.ok) {
    const err = await longLivedRes.text();
    throw new Error(`Long-lived token exchange failed: ${err}`);
  }

  const longLived = await longLivedRes.json();

  return {
    accessToken: longLived.access_token,
    userId: data.user_id ?? "",
  };
}

// アクセストークンに紐付くInstagramビジネスアカウントIDを取得する
export async function getInstagramBusinessAccountId(params: {
  accessToken: string;
  userId: string;
}): Promise<string | null> {
  const res = await fetch(
    `${GRAPH_API_BASE}/${params.userId}/accounts?access_token=${params.accessToken}`
  );

  if (!res.ok) return null;

  const data = await res.json();
  const page = data.data?.[0];
  if (!page) return null;

  // Facebookページに紐付くInstagramビジネスアカウントを取得
  const igRes = await fetch(
    `${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
  );

  if (!igRes.ok) return null;

  const igData = await igRes.json();
  return igData.instagram_business_account?.id ?? null;
}
