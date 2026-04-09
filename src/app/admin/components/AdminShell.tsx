"use client";

// 認証後ページ共通レイアウト（サイドバー + メイン）
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-slate-950 p-8">
        {children}
      </main>
    </div>
  );
}
