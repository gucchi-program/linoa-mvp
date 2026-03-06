import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://li-noa.jp"),
  title: {
    default: "Linoa - 飲食店の経営をサポートするAI秘書 | LINE連携",
    template: "%s | Linoa",
  },
  description:
    "飲食店オーナー向けAI秘書サービス。LINEで日報を送るだけで、売上分析・経営アドバイス・SNS投稿作成まで。個人経営の飲食店の業務効率化を支援します。",
  keywords: [
    "飲食店",
    "AI秘書",
    "日報",
    "売上分析",
    "LINE",
    "経営支援",
    "飲食店経営",
    "業務効率化",
    "飲食店DX",
    "個人経営",
    "売上管理",
  ],
  authors: [{ name: "Linoa" }],
  creator: "Linoa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Linoa - 飲食店の経営をサポートするAI秘書",
    description:
      "LINEで日報を送るだけ。売上分析・経営アドバイスで飲食店オーナーの毎日をサポートするAI秘書サービスです。",
    url: "https://li-noa.jp",
    siteName: "Linoa",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linoa - 飲食店の経営をサポートするAI秘書",
    description:
      "LINEで日報を送るだけ。売上分析・経営アドバイスで飲食店オーナーの毎日をサポートします。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
