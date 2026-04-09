"use client";

// ============================================
// 資料請求フォームコンポーネント（クライアントコンポーネント）
// useState でフォーム状態を管理し、/api/contact にPOSTする
// ============================================

import { useState } from "react";

type FormState = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [form, setForm] = useState({
    storeName: "",
    ownerName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "送信に失敗しました");
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMsg("ネットワークエラーが発生しました。もう一度お試しください。");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        {/* 成功チェックアイコン */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "#E8FFF0" }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M8 16l5 5 11-11" stroke="#00B900" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">送信完了しました</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          資料請求を受け付けました。<br />
          2営業日以内にご登録のメールアドレスへご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <div className="flex flex-col gap-5">

        {/* 店舗名 */}
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1.5">
            店舗名 <span className="text-red-500">*</span>
          </label>
          <input
            id="storeName"
            name="storeName"
            type="text"
            required
            value={form.storeName}
            onChange={handleChange}
            placeholder="例：炭火焼き 山田屋"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
            style={{ "--tw-ring-color": "#00B900" } as React.CSSProperties}
          />
        </div>

        {/* オーナー名 */}
        <div>
          <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-1.5">
            オーナー様のお名前 <span className="text-red-500">*</span>
          </label>
          <input
            id="ownerName"
            name="ownerName"
            type="text"
            required
            value={form.ownerName}
            onChange={handleChange}
            placeholder="例：山田 太郎"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
          />
        </div>

        {/* メールアドレス */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="例：owner@restaurant.jp"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
          />
        </div>

        {/* 電話番号（任意） */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
            電話番号
            <span className="ml-2 text-xs text-gray-400 font-normal">任意</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="例：090-1234-5678"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
          />
        </div>

        {/* メッセージ（任意） */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
            ご要望・ご質問
            <span className="ml-2 text-xs text-gray-400 font-normal">任意</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={form.message}
            onChange={handleChange}
            placeholder="例：SNS投稿の自動化に興味があります。導入の流れを教えてください。"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow resize-none leading-relaxed"
          />
        </div>

        {/* エラーメッセージ */}
        {state === "error" && (
          <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl" role="alert">
            {errorMsg}
          </p>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={state === "loading"}
          className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity cursor-pointer disabled:opacity-60 min-h-[44px]"
          style={{ backgroundColor: "#00B900" }}
        >
          {state === "loading" ? "送信中..." : "無料で資料を請求する"}
        </button>

        <p className="text-center text-xs text-gray-400">
          送信後、2営業日以内にご連絡いたします
        </p>
      </div>
    </form>
  );
}
