"use client";

// お問い合わせ・資料請求フォーム（クライアントコンポーネント）
// フォーム送信 → /api/contact に POST → Supabase保存
import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

const INQUIRY_TYPES = [
  "資料請求",
  "導入相談",
  "料金について",
  "その他",
] as const;

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    storeName: "",
    email: "",
    phone: "",
    inquiryType: "資料請求",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("送信失敗");
      setState("success");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="text-center py-12">
        {/* チェックアイコン */}
        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          お問い合わせありがとうございます
        </h3>
        <p className="text-indigo-200 text-sm leading-relaxed">
          内容を確認の上、2営業日以内にご連絡いたします。
          <br />
          しばらくお待ちください。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* お名前・店舗名 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-indigo-100 mb-1">
            お名前 <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="山田 太郎"
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
        </div>
        <div>
          <label htmlFor="storeName" className="block text-sm font-medium text-indigo-100 mb-1">
            店舗名
          </label>
          <input
            id="storeName"
            name="storeName"
            type="text"
            value={form.storeName}
            onChange={handleChange}
            placeholder="居酒屋 山田"
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
        </div>
      </div>

      {/* メール・電話 */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-indigo-100 mb-1">
            メールアドレス <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="hello@example.com"
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-indigo-100 mb-1">
            お電話番号 <span className="text-indigo-300 text-xs">任意</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="090-0000-0000"
            className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
          />
        </div>
      </div>

      {/* お問い合わせ種別 */}
      <div>
        <label htmlFor="inquiryType" className="block text-sm font-medium text-indigo-100 mb-1">
          お問い合わせ種別
        </label>
        <select
          id="inquiryType"
          name="inquiryType"
          value={form.inquiryType}
          onChange={handleChange}
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-white/40 text-sm cursor-pointer"
        >
          {INQUIRY_TYPES.map((t) => (
            <option key={t} value={t} className="bg-indigo-800 text-white">
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* メッセージ */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-indigo-100 mb-1">
          メッセージ <span className="text-indigo-300 text-xs">任意</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={form.message}
          onChange={handleChange}
          placeholder="ご質問やご要望をご記入ください"
          className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-3 text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm resize-none"
        />
      </div>

      {/* エラー */}
      {state === "error" && (
        <p className="text-red-300 text-sm text-center">
          送信に失敗しました。時間をおいて再度お試しください。
        </p>
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-full py-4 font-bold text-indigo-700 bg-white hover:bg-indigo-50 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        {state === "submitting" ? "送信中..." : "送信する"}
      </button>
    </form>
  );
}
