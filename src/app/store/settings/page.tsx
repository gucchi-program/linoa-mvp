"use client";

export const dynamic = "force-dynamic";

// ============================================
// 店舗設定ページ
// - Instagram連携（OAuth）
// - 参照POP画像アップロード（スタイル学習用）
// ============================================

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Store } from "@/types";

export default function StoreSettingsPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // ログイン中のユーザーに紐付く店舗を取得
  useEffect(() => {
    async function loadStore() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/store/login");
        return;
      }

      const res = await fetch(`/api/store/me`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      setStore(data.store);
      setLoading(false);
    }

    loadStore();
  }, [supabase, router]);

  // Instagram OAuth フローを開始する
  function handleConnectInstagram() {
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/api/auth/instagram/callback`
    );
    const scope = encodeURIComponent(
      "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,business_management"
    );
    const url =
      `https://www.facebook.com/v19.0/dialog/oauth` +
      `?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&scope=${scope}` +
      `&response_type=code`;

    window.location.href = url;
  }

  // 参照POP画像をアップロードする
  async function handleReferenceImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !store) return;

    setUploadingImage(true);
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("storeId", store.id);

      const res = await fetch("/api/store/reference-images", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("アップロード失敗");

      setUploadMessage("参照画像を保存しました。次回のPOP生成から反映されます。");
    } catch {
      setUploadMessage("アップロードに失敗しました。もう一度お試しください。");
    } finally {
      setUploadingImage(false);
      // ファイル選択をリセット
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/store/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-sm">読み込み中...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <p className="text-slate-600 text-sm mb-2">店舗情報が見つかりません。</p>
          <p className="text-slate-400 text-xs">担当者に連絡してアカウントを紐付けてください。</p>
        </div>
      </div>
    );
  }

  const isInstagramConnected =
    !!store.instagram_access_token && !!store.instagram_business_account_id;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-200 px-5 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/linoa-logo.png" alt="Linoa" width={32} height={32} className="object-contain" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{store.store_name ?? "店舗名未設定"}</p>
              <p className="text-xs text-slate-400">設定</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            ログアウト
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-6">
        {/* Instagram連携 */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">Instagram連携</h2>
          <p className="text-xs text-slate-500 mb-5">
            連携すると、LINEに写真を送るだけでInstagramに自動投稿されます。
          </p>

          {isInstagramConnected ? (
            <div className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">連携済み</p>
                <p className="text-xs text-green-600 mt-0.5">
                  写真をLINEに送ると30分後に自動投稿されます
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-amber-50 rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-700">未連携</p>
              </div>
              <button
                onClick={handleConnectInstagram}
                className="w-full py-3 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transition-opacity"
              >
                Instagramと連携する
              </button>
              <p className="text-xs text-slate-400 text-center">
                Facebookビジネスアカウントが必要です
              </p>
            </div>
          )}
        </section>

        {/* 参照POP画像 */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-1">参照POP画像</h2>
          <p className="text-xs text-slate-500 mb-5">
            お店で使っているPOPや好みのデザインを登録すると、
            AI生成のPOPがお店のスタイルに合わせて作成されます。
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleReferenceImageUpload}
            className="hidden"
            id="reference-image-input"
          />

          <label
            htmlFor="reference-image-input"
            className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
              uploadingImage
                ? "border-slate-200 bg-slate-50 cursor-not-allowed"
                : "border-slate-300 hover:border-green-400 hover:bg-green-50"
            }`}
          >
            {uploadingImage ? (
              <p className="text-sm text-slate-400">アップロード中...</p>
            ) : (
              <>
                <p className="text-sm text-slate-500 font-medium">クリックして画像を選択</p>
                <p className="text-xs text-slate-400 mt-1">JPG / PNG / WebP</p>
              </>
            )}
          </label>

          {uploadMessage && (
            <p
              className={`text-xs mt-3 px-4 py-3 rounded-xl ${
                uploadMessage.includes("失敗")
                  ? "text-red-600 bg-red-50"
                  : "text-green-700 bg-green-50"
              }`}
            >
              {uploadMessage}
            </p>
          )}
        </section>

        {/* 店舗情報サマリー */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">店舗情報</h2>
          <dl className="flex flex-col gap-3">
            {[
              { label: "店名", value: store.store_name },
              { label: "業態", value: store.store_type },
              { label: "エリア", value: store.area },
              { label: "席数", value: store.seat_count ? `${store.seat_count}席` : null },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <dt className="text-xs text-slate-500">{label}</dt>
                <dd className="text-sm text-slate-800 font-medium">
                  {value ?? <span className="text-slate-300">未設定</span>}
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-slate-400 mt-4">
            店舗情報の変更はLINEで「店舗情報を変えたい」とメッセージしてください。
          </p>
        </section>
      </main>
    </div>
  );
}
