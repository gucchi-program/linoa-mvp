// ============================================
// Next.js Middleware
// 1. admin.li-noa.jp → /admin/* へ内部リライト
// 2. /admin/* の認証保護（未ログインは /admin/login へ）
// ============================================

import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";

  // ── サブドメイン検出：admin.li-noa.jp → /admin/* にリライト ──
  const isAdminSubdomain =
    hostname.startsWith("admin.") || hostname === "admin.li-noa.jp";

  if (isAdminSubdomain && !pathname.startsWith("/admin")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ── サブドメイン検出：app.li-noa.jp → /store/* にリライト ──
  // /api/* は除外（Cronジョブ・OAuth callbackはそのまま通す）
  const isStoreSubdomain =
    hostname.startsWith("app.") || hostname === "app.li-noa.jp";

  if (isStoreSubdomain && !pathname.startsWith("/store") && !pathname.startsWith("/api")) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/store${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // ── /store/* の認証保護 ──
  if (pathname.startsWith("/store")) {
    const publicStorePaths = ["/store/login"];
    if (publicStorePaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    let response = NextResponse.next({ request });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/store/login";
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  // ── /admin/* の認証保護 ──
  if (pathname.startsWith("/admin")) {
    // ログイン・MFAページは認証不要
    const publicAdminPaths = ["/admin/login", "/admin/mfa", "/admin/mfa/enroll"];
    if (publicAdminPaths.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    // セッション確認
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // admin/* と サブドメイン対象（静的ファイルは除外）
    "/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
