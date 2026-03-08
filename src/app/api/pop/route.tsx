import { NextRequest } from "next/server";
import { ImageResponse } from "next/og";

/**
 * POP画像生成API
 *
 * satori（next/ogに内蔵）を使い、HTML/CSSからPOP画像をサーバー側で生成する。
 * 外部の画像生成AIは使わず、テンプレートベースで高品質なPOPを出力する。
 * LINEの画像メッセージとして送信するためのURL。
 *
 * クエリパラメータ:
 * - headline: メインコピー
 * - subtext: サブテキスト
 * - store: 店名
 * - accent: テーマカラー（warm/cool/festive）
 * - size: small（プレビュー240px）/ large（本画像1040px、デフォルト）
 */
export const runtime = "edge";

// テーマカラー定義
const THEMES = {
  warm: {
    bg: "linear-gradient(135deg, #FF6B35 0%, #F7C59F 50%, #EFEFD0 100%)",
    headlineColor: "#FFFFFF",
    subtextColor: "rgba(255,255,255,0.9)",
    storeColor: "rgba(255,255,255,0.7)",
    overlayBg: "rgba(0,0,0,0.15)",
  },
  cool: {
    bg: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
    headlineColor: "#E2E8F0",
    subtextColor: "rgba(226,232,240,0.85)",
    storeColor: "rgba(226,232,240,0.6)",
    overlayBg: "rgba(255,255,255,0.05)",
  },
  festive: {
    bg: "linear-gradient(135deg, #E63946 0%, #F4A261 50%, #E9C46A 100%)",
    headlineColor: "#FFFFFF",
    subtextColor: "rgba(255,255,255,0.9)",
    storeColor: "rgba(255,255,255,0.7)",
    overlayBg: "rgba(0,0,0,0.1)",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const headline = searchParams.get("headline") ?? "本日のおすすめ";
  const subtext = searchParams.get("subtext") ?? "";
  const store = searchParams.get("store") ?? "";
  const accent = (searchParams.get("accent") ?? "warm") as keyof typeof THEMES;
  const size = searchParams.get("size") === "small" ? 240 : 1040;

  const theme = THEMES[accent] ?? THEMES.warm;

  // 画像サイズ（LINE推奨: 1040x1040）
  const imgSize = size;
  const headlineFontSize = size === 240 ? 22 : 64;
  const subtextFontSize = size === 240 ? 12 : 28;
  const storeFontSize = size === 240 ? 10 : 20;
  const padding = size === 240 ? "20px" : "80px";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: theme.bg,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 装飾的な背景要素 */}
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "30%",
            height: "30%",
            borderRadius: "50%",
            background: theme.overlayBg,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "15%",
            right: "10%",
            width: "25%",
            height: "25%",
            borderRadius: "50%",
            background: theme.overlayBg,
            display: "flex",
          }}
        />

        {/* メインコンテンツ */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding,
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* メインコピー */}
          <div
            style={{
              fontSize: headlineFontSize,
              fontWeight: 900,
              color: theme.headlineColor,
              lineHeight: 1.3,
              letterSpacing: "-1px",
              marginBottom: size === 240 ? "8px" : "24px",
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            {headline}
          </div>

          {/* 区切り線 */}
          <div
            style={{
              width: size === 240 ? "40px" : "120px",
              height: size === 240 ? "2px" : "4px",
              background: theme.headlineColor,
              opacity: 0.5,
              borderRadius: "2px",
              marginBottom: size === 240 ? "8px" : "24px",
              display: "flex",
            }}
          />

          {/* サブテキスト */}
          {subtext && (
            <div
              style={{
                fontSize: subtextFontSize,
                color: theme.subtextColor,
                lineHeight: 1.6,
                maxWidth: "80%",
              }}
            >
              {subtext}
            </div>
          )}
        </div>

        {/* 店名 */}
        {store && (
          <div
            style={{
              position: "absolute",
              bottom: size === 240 ? "10px" : "40px",
              fontSize: storeFontSize,
              color: theme.storeColor,
              letterSpacing: "2px",
              display: "flex",
            }}
          >
            {store}
          </div>
        )}
      </div>
    ),
    { width: imgSize, height: imgSize }
  );
}
