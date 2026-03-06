import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Linoa - あなたのお店の専属AI秘書",
  description:
    "LINEで話しかけるだけ。日報記録・売上分析・経営アドバイスで、飲食店オーナーの毎日をサポートするAI秘書サービスです。",
  openGraph: {
    title: "Linoa - あなたのお店の専属AI秘書",
    description:
      "LINEで話しかけるだけ。日報記録・売上分析・経営アドバイスで、飲食店オーナーの毎日をサポートします。",
    url: "https://li-noa.jp",
    siteName: "Linoa",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Linoa - あなたのお店の専属AI秘書",
    description:
      "LINEで話しかけるだけ。日報記録・売上分析・経営アドバイスで、飲食店オーナーの毎日をサポートします。",
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
