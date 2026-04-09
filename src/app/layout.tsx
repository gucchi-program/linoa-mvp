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
    default: "Linoa - 飲食店オーナーの右腕になるLINE AI",
    template: "%s | Linoa",
  },
  description:
    "LINEに話しかけるだけで、SNS投稿・口コミ返信・売上管理をAIが肩代わり。新しいアプリ不要。個人飲食店オーナーのための専属AI秘書。",
  keywords: [
    "飲食店AI",
    "LINE AI",
    "飲食店DX",
    "売上管理",
    "SNS自動投稿",
    "口コミ返信",
    "個人経営",
    "飲食店集客",
    "AI秘書",
    "店舗専属AI",
  ],
  authors: [{ name: "Linoa" }],
  creator: "Linoa",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Linoa - 飲食店オーナーの右腕になるLINE AI",
    description:
      "LINEに話しかけるだけで、SNS投稿・口コミ返信・売上管理をAIが肩代わり。個人飲食店オーナーの専属AI秘書。",
    url: "https://li-noa.jp",
    siteName: "Linoa",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "https://li-noa.jp/og-image.png",
        width: 1200,
        height: 630,
        alt: "Linoa - 飲食店オーナーの右腕になるLINE AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Linoa - 飲食店オーナーの右腕になるLINE AI",
    description:
      "LINEに話しかけるだけで、SNS投稿・口コミ返信・売上管理をAIが肩代わり。",
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
