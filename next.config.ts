import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ワイルドカードサブドメイン対応
  // *.li-noa.jp からのリクエストをすべて受け付ける
  // Cloudflare経由でワイルドカードDNS + SSLは処理済みの前提
  async headers() {
    return [
      {
        // APIエンドポイントのCORS設定（将来のパートナー連携用）
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
