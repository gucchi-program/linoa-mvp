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

  // ── /forvc の Basic 認証 ──
  // VC向け資料ページはパスワード保護する
  // ユーザー名 "vc" 固定 + 環境変数 FORVC_PASSWORD で照合
  if (pathname.startsWith("/forvc")) {
    const expected = process.env.FORVC_PASSWORD;
    if (!expected) {
      return new NextResponse("Service Unavailable: FORVC_PASSWORD未設定", { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Basic ")) {
      try {
        const decoded = atob(authHeader.slice(6));
        const [user, pass] = decoded.split(":");
        if (user === "vc" && pass === expected) {
          return NextResponse.next();
        }
      } catch {
        // base64 デコード失敗は認証失敗扱い
      }
    }

    return new NextResponse("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Linoa VC", charset="UTF-8"',
      },
    });
  }

  // ── サブドメイン検出：admin.li-noa.jp → /admin/* にリライト ──
  const isAdminSubdomain =
    hostname.startsWith("admin.") || hostname === "admin.li-noa.jp";

  // /api/* は除外（admin 画面から叩く Route Handler をそのまま通すため）
  if (isAdminSubdomain && !pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
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
    // ログイン・契約ページは認証のみ or 未認証でも通す
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

    // /store/billing 配下は契約状況にかかわらず通す（契約・再契約のため）
    if (pathname.startsWith("/store/billing")) {
      return response;
    }

    // 契約状況チェック: active / trialing 以外は /store/billing へ強制
    const { data: store } = await supabase
      .from("stores")
      .select("subscription_status")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    const status = store?.subscription_status;
    const isPaid = status === "active" || status === "trialing";
    if (!isPaid) {
      const billingUrl = request.nextUrl.clone();
      billingUrl.pathname = "/store/billing";
      return NextResponse.redirect(billingUrl);
    }

    return response;
  }

  // ── /admin/* の認証保護 ──
  if (pathname.startsWith("/admin")) {
    // ログインページは完全にパブリック
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

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

    // admin ロール必須（店舗オーナーが間違って入るのを防ぐ）
    const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
    if (role !== "admin") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("error", "forbidden");
      return NextResponse.redirect(loginUrl);
    }

    // MFA 設定/検証ページはここで通す（AAL2 強制の対象外）
    if (pathname.startsWith("/admin/mfa")) {
      return response;
    }

    // AAL2 (TOTP 検証済) 必須
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalData?.currentLevel !== "aal2") {
      const mfaUrl = request.nextUrl.clone();
      // MFA 登録済みで verify 待ち → /admin/mfa、未登録 → /admin/mfa/enroll
      mfaUrl.pathname = aalData?.nextLevel === "aal2" ? "/admin/mfa" : "/admin/mfa/enroll";
      return NextResponse.redirect(mfaUrl);
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
