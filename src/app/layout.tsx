import type { Metadata } from "next";
import Script from "next/script";
import { Geist } from "next/font/google";
import "./globals.css";

// Google Search Consoleの所有権確認用メタタグ
// Google Analytics（GA4）の計測ID
const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;
const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://li-noa.jp"),
  title: {
    default: "Linoa - 飲食店専属AI × ホームページ制作",
    template: "%s | Linoa",
  },
  description:
    "飲食店専属AI秘書「Linoa」。LINEに送るだけでHP・Google・Instagramが自動更新。HP制作49,800円〜。使うほどお店専属AIが育ちます。個人経営の飲食店向け。",
  keywords: [
    "飲食店",
    "ホームページ制作",
    "LP制作",
    "AI秘書",
    "LINE",
    "飲食店DX",
    "個人経営",
    "売上管理",
    "SNS自動投稿",
    "飲食店AI",
    "店舗専属AI",
    "飲食店集客",
  ],
  authors: [{ name: "Linoa" }],
  creator: "Linoa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Linoa - 飲食店専属AI × ホームページ制作",
    description:
      "LINEに送るだけでHP・Google・Instagramが自動更新。使い続けるほどあなたのお店だけのAIが育っていく。",
    url: "https://li-noa.jp",
    siteName: "Linoa",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://li-noa.jp/og-image.png",
        width: 1200,
        height: 630,
        alt: "Linoa - 飲食店専属AI × ホームページ制作",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linoa - 飲食店専属AI × ホームページ制作",
    description:
      "LINEに送るだけでHP・Google・Instagramが自動更新。使い続けるほどあなたのお店だけのAIが育っていく。",
    images: ["https://li-noa.jp/og-image.png"],
    creator: "@panaentre",
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
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
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        {/* Google Analytics（GA4）: GA_MEASUREMENT_ID が設定されている場合のみ有効 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}')`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
