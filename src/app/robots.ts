import type { MetadataRoute } from "next";

// Next.js App Routerの規約ファイル。/robots.txt を自動生成する
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/"],
    },
    sitemap: "https://li-noa.jp/sitemap.xml",
  };
}
