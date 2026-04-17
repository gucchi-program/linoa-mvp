import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linoa - 店舗管理",
  description: "Linoa 店舗オーナー向け管理画面",
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
}
