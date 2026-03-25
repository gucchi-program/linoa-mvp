import type { MetadataRoute } from "next";

// /robots.txt を自動生成する Next.js App Router 規約ファイル
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: "https://li-noa.jp/sitemap.xml",
    host: "https://li-noa.jp",
  };
}
