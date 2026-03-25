import { NextRequest, NextResponse } from "next/server";

// ============================================
// middleware.ts - サブドメイン解決
//
// clientA.li-noa.jp へのリクエストを受けたとき:
// 1. Hostヘッダからサブドメインを抽出
// 2. x-subdomain ヘッダを付与してリクエストを転送
//
// ダッシュボードページ側では x-subdomain を読んで
// Supabaseからowner情報を取得する。
//
// DBへの直接アクセスはしない（Supabase接続はEdge Runtimeで
// 環境変数が必要なため、ヘッダ転送のみに留める）
// ============================================

// 本番ドメイン
const ROOT_DOMAIN = process.env.ROOT_DOMAIN ?? "li-noa.jp";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";

  // ローカル開発環境はスキップ
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    return NextResponse.next();
  }

  // サブドメインを抽出
  // "clientA.li-noa.jp" → "clientA"
  // "li-noa.jp" または "www.li-noa.jp" → null（ルートドメイン）
  const subdomain = extractSubdomain(hostname, ROOT_DOMAIN);

  if (!subdomain) {
    // ルートドメイン → そのまま通す
    return NextResponse.next();
  }

  // サブドメインをヘッダに付与して転送
  // ダッシュボードのページコンポーネントで headers() から読み取る
  const response = NextResponse.next();
  response.headers.set("x-subdomain", subdomain);
  return response;
}

function extractSubdomain(hostname: string, rootDomain: string): string | null {
  // ポート番号を除去
  const host = hostname.split(":")[0];

  if (!host.endsWith(`.${rootDomain}`)) {
    return null;
  }

  const subdomain = host.slice(0, -(`.${rootDomain}`.length));

  // "www" はルートと同扱い
  if (!subdomain || subdomain === "www") {
    return null;
  }

  return subdomain;
}

export const config = {
  // _next/static などのアセットリクエストには適用しない
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/).*)",
  ],
};
