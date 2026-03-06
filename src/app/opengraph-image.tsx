import { ImageResponse } from "next/og";

// Next.js App Routerの規約ファイル。OGP画像を動的に生成する
// /opengraph-image というURLで自動配信され、metadataに自動リンクされる
export const runtime = "edge";
export const alt = "Linoa - 飲食店の経営をサポートするAI秘書";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
          background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              fontSize: "72px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            Linoa
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "rgba(255,255,255,0.9)",
              fontWeight: 600,
            }}
          >
            飲食店の経営をサポートするAI秘書
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "16px",
              padding: "12px 32px",
              borderRadius: "999px",
              background: "#06C755",
              fontSize: "24px",
              color: "white",
              fontWeight: 700,
            }}
          >
            LINEで無料で始める
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
