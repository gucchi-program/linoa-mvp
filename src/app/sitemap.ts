import type { MetadataRoute } from "next";

// Next.js App Routerの規約ファイル。/sitemap.xml を自動生成する
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://li-noa.jp",
      lastModified: new Date("2026-03-25"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
