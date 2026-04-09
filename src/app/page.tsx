// ============================================
// Linoa LP（ランディングページ）
// 資料請求フォーム導線に変更済み
// ============================================

import Image from "next/image";
import ContactForm from "@/components/ContactForm";

// チェックマークSVG
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#00B900" />
      <path d="M6 10l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// LINEチャット吹き出しコンポーネント
function ChatBubble({ from, children }: { from: "user" | "linoa"; children: React.ReactNode }) {
  if (from === "user") {
    return (
      <div className="flex justify-end mb-2">
        <div
          className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
          style={{ backgroundColor: "#00B900" }}
        >
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 mb-2">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: "#00B900" }}
      >
        L
      </div>
      <div className="max-w-[75%] bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-gray-800 leading-relaxed shadow-sm">
        {children}
      </div>
    </div>
  );
}

// シーンカードコンポーネント
function SceneCard({
  number,
  title,
  timing,
  children,
}: {
  number: string;
  title: string;
  timing: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: "#F0FFF0" }}>
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: "#00B900" }}
          >
            {number}
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-500">{timing}</p>
          </div>
        </div>
      </div>
      <div className="px-4 py-4" style={{ backgroundColor: "#ECE5DD" }}>
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans">

      {/* ======================================
          ナビゲーション
      ====================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/linoa-logo.png" alt="Linoa" width={36} height={36} className="object-contain" />
            <span className="font-bold text-xl text-gray-900">
              Linoa
              <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#00B900" }}>
                β
              </span>
            </span>
          </div>
          <a
            href="#contact"
            className="px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90 cursor-pointer min-h-[44px] flex items-center"
            style={{ backgroundColor: "#00B900" }}
          >
            資料請求（無料）
          </a>
        </div>
      </nav>

      {/* ======================================
          Hero セクション（写真背景）
      ====================================== */}
      <section className="relative pt-28 pb-20 px-5 overflow-hidden">
        {/* 背景画像 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-chat.jpg"
            alt="スマートフォンとチャットのイメージ"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0" style={{ backgroundColor: "rgba(255,255,255,0.82)" }} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          {/* バッジ */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-sm text-gray-600 mb-6">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#00B900" }} />
            クローズドβ版 資料請求受付中
          </div>

          {/* キャッチコピー */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-5">
            LINEで話しかけるだけ。
            <br />
            <span style={{ color: "#00B900" }}>あなたのお店の</span>
            <br />
            専属AI秘書。
          </h1>

          <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
            SNS投稿・口コミ返信・売上管理・顧客メモ。
            <br />
            すべてLINEで完結。新しいアプリは不要です。
          </p>

          {/* CTAボタン */}
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:opacity-90 hover:shadow-xl cursor-pointer min-h-[44px]"
            style={{ backgroundColor: "#00B900" }}
          >
            無料で資料請求する
          </a>

          <p className="mt-4 text-xs text-gray-400">クレジットカード不要・2営業日以内にご連絡</p>
        </div>
      </section>

      {/* ======================================
          課題提起セクション
      ====================================== */}
      <section className="py-16 px-5 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            こんなお悩み、ありませんか？
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            忙しい個人飲食店オーナーが抱える「経営まわりの雑務」
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect width="28" height="28" rx="8" fill="#FEF3C7" />
                    <path d="M9 14h10M9 10h10M9 18h6" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                text: "SNS投稿を「やった方がいい」とわかっているが、面倒でできていない",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect width="28" height="28" rx="8" fill="#FEE2E2" />
                    <path d="M14 8v6l4 2" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="14" cy="14" r="7" stroke="#DC2626" strokeWidth="2" />
                  </svg>
                ),
                text: "口コミへの返信に時間がかかる。何を書けばいいか毎回悩む",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect width="28" height="28" rx="8" fill="#E0E7FF" />
                    <path d="M8 20l4-8 4 4 4-6" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                text: "売上をノートに書いているが、月末に集計する気力がない",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                    <rect width="28" height="28" rx="8" fill="#D1FAE5" />
                    <circle cx="14" cy="11" r="4" stroke="#059669" strokeWidth="2" />
                    <path d="M7 22c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
                text: "常連客の好みや誕生日を覚えているが、自分の頭の中にしかない",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm border border-gray-100">
                {item.icon}
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-800 font-semibold text-base">
              Linoaは、これらをすべて
              <span style={{ color: "#00B900" }}>LINEだけで</span>
              解決します。
            </p>
          </div>
        </div>
      </section>

      {/* ======================================
          5つのシーン
      ====================================== */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            5つの場面で活躍します
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            オーナーの1日に寄り添う、実際の使い方
          </p>

          <div className="flex flex-col gap-5">

            <SceneCard number="1" title="SNS投稿を自動生成" timing="朝、仕入れから戻った時">
              <ChatBubble from="user">今日仕入れた地鶏の写真、投稿文作って</ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">Instagram用</span>
                今朝入荷したばかりの地元産地鶏。柔らかな身と濃厚な旨みが自慢です。今夜のおすすめは地鶏の炭火焼き。ぜひお越しください。
                <span className="block mt-1 text-xs" style={{ color: "#00B900" }}>#地鶏 #炭火焼き #宝塚グルメ</span>
                <span className="font-semibold block mt-2 mb-1">X用</span>
                朝どれ地鶏が入りました。今夜の炭火焼き、ぜひ。
                <span className="block text-xs" style={{ color: "#00B900" }}>#宝塚 #地鶏</span>
              </ChatBubble>
            </SceneCard>

            <SceneCard number="2" title="口コミ返信案を生成" timing="隙間時間に口コミ通知が来た時">
              <ChatBubble from="user">
                口コミへの返信作って。「接客が丁寧で料理も絶品でした。また来ます」
              </ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">【返信案】</span>
                この度は温かいお言葉をいただき、誠にありがとうございます。スタッフ一同の励みになります。またのお越しを心よりお待ちしております。
              </ChatBubble>
            </SceneCard>

            <SceneCard number="3" title="売上を一言で記録" timing="閉店後のレジ締め">
              <ChatBubble from="user">今日18万、52人</ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">記録しました！</span>
                <span className="block text-xs text-gray-500 mb-1">── 4月9日（水）──</span>
                売上：180,000円
                <br />
                客数：52人　客単価：3,461円
                <br />
                <span className="block mt-1 text-xs text-gray-500">今月累計：890,000円（8日営業）</span>
              </ChatBubble>
            </SceneCard>

            <SceneCard number="4" title="月次レポートを自動配信" timing="月末にLinoaから届く">
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">3月のレポートです</span>
                売上合計：2,450,000円
                <br />
                前月比：+12%
                <br />
                客単価：3,820円
                <br />
                <span className="block mt-2 text-xs p-2 rounded-lg" style={{ backgroundColor: "#F0FFF4" }}>
                  金曜の2名客でドリンク注文率が低い傾向です。ドリンクセットを提案してみませんか？
                </span>
              </ChatBubble>
            </SceneCard>

            <SceneCard number="5" title="顧客情報をすぐ呼び出せる" timing="常連客の予約が入った時">
              <ChatBubble from="user">田中さんの情報</ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">【田中さん】</span>
                来店回数：12回
                <br />
                最終来店：4月2日
                <br />
                好み：赤ワイン・牛肉料理
                <br />
                アレルギー：甲殻類
                <br />
                誕生日：3月15日
              </ChatBubble>
            </SceneCard>

          </div>
        </div>
      </section>

      {/* ======================================
          特徴セクション
      ====================================== */}
      <section className="py-16 px-5" style={{ backgroundColor: "#F0FFF4" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-3">
            Linoaが選ばれる理由
          </h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            他のDXツールとは根本的に違います
          </p>

          <div className="flex flex-col gap-5">
            {[
              {
                title: "管理画面が不要",
                desc: "ダッシュボードにログインする必要はありません。UIはLINEだけ。営業中にスマホで完結します。",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <rect width="40" height="40" rx="12" fill="#00B900" />
                    <rect x="10" y="12" width="20" height="14" rx="2" stroke="white" strokeWidth="2" />
                    <path d="M15 26v3M25 26v3M13 29h14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 20h8M16 17h5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                title: "会話でデータが溜まる",
                desc: "フォーム入力不要。「今日18万」と送るだけで売上が記録されます。使えば使うほどデータが蓄積されます。",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <rect width="40" height="40" rx="12" fill="#00B900" />
                    <path d="M12 28l4-8 4 4 4-7 4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="28" cy="13" r="3" fill="white" />
                  </svg>
                ),
              },
              {
                title: "あなたのお店専用AIに育つ",
                desc: "会話から「この店らしさ」を学習します。投稿文も口コミ返信も、あなたのお店のトーンで生成されます。",
                icon: (
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <rect width="40" height="40" rx="12" fill="#00B900" />
                    <circle cx="20" cy="17" r="5" stroke="white" strokeWidth="2" />
                    <path d="M12 30c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M26 12l2 2-5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 flex items-start gap-4 shadow-sm border border-gray-100">
                {item.icon}
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          信頼セクション（握手写真）
      ====================================== */}
      <section className="py-16 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* 写真 */}
            <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-md aspect-video relative">
              <Image
                src="/handshake.webp"
                alt="パートナーシップと信頼のイメージ"
                fill
                className="object-cover object-center"
              />
            </div>
            {/* テキスト */}
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                導入から運用まで、<br />
                <span style={{ color: "#00B900" }}>サポートします</span>
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                ITが苦手でも大丈夫。資料請求後、担当者がご連絡し、店舗に合わせた初期設定をサポートします。LINEの操作さえできれば、すぐに使い始められます。
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "導入時の初期設定サポート付き",
                  "使い方のつまずきもLINEで相談OK",
                  "クローズドβ版のため完全無料",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================
          料金セクション
      ====================================== */}
      <section className="py-16 px-5 bg-gray-50">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">料金</h2>
          <p className="text-gray-500 text-sm mb-8">シンプルでわかりやすい料金体系</p>

          <div className="rounded-2xl border-2 p-8 shadow-lg bg-white" style={{ borderColor: "#00B900" }}>
            <div className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold mb-4" style={{ backgroundColor: "#00B900" }}>
              クローズドβ版
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">
              ¥0
              <span className="text-lg font-normal text-gray-500">/月</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">現在クローズドβ版につき、無料でご利用いただけます</p>

            <ul className="text-left space-y-3 mb-8">
              {[
                "SNS投稿文生成（Instagram・X）",
                "口コミ返信案生成",
                "売上記録・月次レポート",
                "顧客メモ管理",
                "在庫・仕入れメモ",
                "経営相談チャット",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#contact"
              className="flex items-center justify-center w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90 cursor-pointer min-h-[44px]"
              style={{ backgroundColor: "#00B900" }}
            >
              無料で資料請求する
            </a>
          </div>
        </div>
      </section>

      {/* ======================================
          資料請求フォームセクション
      ====================================== */}
      <section id="contact" className="py-20 px-5 text-white" style={{ background: "linear-gradient(135deg, #00B900 0%, #00a000 100%)" }}>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              無料で資料請求する
            </h2>
            <p className="text-white/80 text-sm leading-relaxed">
              フォームを送信後、2営業日以内に担当者よりご連絡いたします。<br />
              導入方法や費用について、丁寧にご説明します。
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* ======================================
          フッター
      ====================================== */}
      <footer className="py-8 px-5 bg-gray-900">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/linoa-logo.png" alt="Linoa" width={32} height={32} className="object-contain brightness-0 invert" />
            <span className="text-white font-bold text-lg">Linoa</span>
          </div>
          <p className="text-gray-400 text-xs">© 2026 Linoa. All rights reserved.</p>
        </div>
      </footer>

    </main>
  );
}
