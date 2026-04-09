// ============================================
// 管理画面レイアウト
// サイドバー + メインコンテンツ
// ============================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Linoa Admin", template: "%s | Linoa Admin" },
  robots: { index: false, follow: false }, // 管理画面はクロール禁止
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
