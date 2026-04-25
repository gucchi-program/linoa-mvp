// ============================================
// Linoa LP - ITスタートアップスタイル
// Dark hero + 3-step funnel + Before/After + Metrics
// ============================================

import Image from "next/image";
import ContactForm from "@/components/ContactForm";

// ---- アイコンコンポーネント ----

function CheckIcon({ color = "#00B900" }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill={color} />
      <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// LINEチャット吹き出し
function ChatBubble({ from, children }: { from: "user" | "linoa"; children: React.ReactNode }) {
  if (from === "user") {
    return (
      <div className="flex justify-end mb-2">
        <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm text-white leading-relaxed"
          style={{ backgroundColor: "#00B900" }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2 mb-2">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: "#00B900" }}>
        L
      </div>
      <div className="max-w-[80%] bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-gray-800 leading-relaxed shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );
}

// シーンカード
function SceneCard({ number, title, timing, children }: {
  number: string; title: string; timing: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: "#00B900" }}>
            {number}
          </span>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-400">{timing}</p>
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
          ナビゲーション（floating）
      ====================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          {/* ロゴ */}
          <div className="flex items-center gap-2.5">
            <Image src="/linoa-logo.png" alt="Linoa" width={32} height={32} className="object-contain" />
            <span className="font-bold text-xl text-white tracking-tight">Linoa</span>
          </div>
          {/* ナビリンク（md以上） */}
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors cursor-pointer">使い方</a>
            <a href="#features" className="hover:text-white transition-colors cursor-pointer">機能</a>
            <a href="#pricing" className="hover:text-white transition-colors cursor-pointer">料金</a>
          </div>
          {/* CTA */}
          <a href="#contact"
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer min-h-[44px] flex items-center"
            style={{ backgroundColor: "#00B900", color: "white" }}>
            資料請求（無料）
          </a>
        </div>
      </nav>

      {/* ======================================
          Hero（ダーク背景・大見出し）
      ====================================== */}
      <section className="relative pt-16 overflow-hidden bg-slate-900">
        {/* 背景グラデーション装飾 */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #00B900 0%, transparent 70%)" }} />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full opacity-8"
            style={{ background: "radial-gradient(circle, #D4A017 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-5">
          <div className="flex flex-col lg:flex-row items-center gap-12 py-20 lg:py-28">
            {/* テキスト */}
            <div className="flex-1 text-center lg:text-left">
              {/* バッジ */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 text-xs text-slate-400 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                クローズドβ版 ・ 資料請求受付中
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-6 tracking-tight">
                飲食店の雑務を、<br />
                <span style={{ color: "#00B900" }}>LINEだけ</span>で<br />
                片付ける。
              </h1>

              <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-xl">
                SNS投稿・口コミ返信・売上記録・顧客管理。<br />
                LINEに話しかけるだけで、AIが全部やります。<br />
                新しいアプリも管理画面も、一切不要。
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="#contact"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-base shadow-lg hover:opacity-90 transition-opacity cursor-pointer min-h-[44px]"
                  style={{ backgroundColor: "#00B900" }}>
                  無料で資料請求する
                  <ArrowRightIcon />
                </a>
                <a href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 text-base border border-white/20 hover:bg-white/10 transition-colors cursor-pointer min-h-[44px]">
                  使い方を見る
                </a>
              </div>

              {/* ミニ信頼テキスト */}
              <p className="mt-5 text-xs text-slate-500">
                資料請求は無料・2営業日以内にご連絡
              </p>
            </div>

            {/* Hero画像 */}
            <div className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                <Image
                  src="/hero-chat.jpg"
                  alt="LINEで話しかけるだけのAI秘書"
                  fill
                  className="object-cover"
                  priority
                />
                {/* オーバーレイカード */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: "#00B900" }}>L</div>
                      <div>
                        <p className="text-white text-xs font-medium">今月の売上レポートが届きました</p>
                        <p className="text-slate-400 text-xs">売上合計 2,450,000円・前月比 +12%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 区切り波線 */}
        <div className="relative z-10">
          <svg viewBox="0 0 1440 40" fill="none" className="w-full" aria-hidden="true">
            <path d="M0 40 Q360 0 720 20 Q1080 40 1440 10 L1440 40 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ======================================
          メトリクスバー
      ====================================== */}
      <section className="py-10 px-5 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "月30h", label: "削減できる作業時間" },
              { value: "5分", label: "1件のSNS投稿にかかる時間" },
              { value: "¥0", label: "βテスト期間中の費用" },
              { value: "LINE", label: "だけで完結するUI" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
                  {item.value}
                </span>
                <span className="text-xs text-gray-500 mt-1">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          課題提起（Before）
      ====================================== */}
      <section className="py-20 px-5 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              個人飲食店オーナーの<br />
              「時間泥棒」を特定しました。
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {[
              {
                label: "SNS更新",
                detail: "投稿するネタはあるのに、文章を考える時間がない",
                before: "週1回できれば良い方",
              },
              {
                label: "口コミ返信",
                detail: "返信しなきゃと思いつつ、何を書けばいいか毎回悩む",
                before: "後回しになりがち",
              },
              {
                label: "売上管理",
                detail: "ノートに書いているが、月末に集計する気力がない",
                before: "エクセルで2〜3時間",
              },
              {
                label: "顧客情報",
                detail: "常連さんの好みや誕生日が全部頭の中にある",
                before: "スタッフへの引き継ぎ不可",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-bold text-gray-900">{item.label}</span>
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                    {item.before}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-800 font-semibold text-lg">
            これら全部、<span style={{ color: "#00B900" }}>LINEを送るだけ</span>で解決します。
          </p>
        </div>
      </section>

      {/* ======================================
          How It Works（3ステップ）
      ====================================== */}
      <section id="how-it-works" className="py-20 px-5 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              始め方はたった3ステップ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* ステップ間の矢印（デスクトップのみ） */}
            <div className="hidden md:block absolute top-10 left-[37%] w-[26%] z-10">
              <svg viewBox="0 0 100 20" fill="none" aria-hidden="true">
                <path d="M0 10 H90 M80 4 L96 10 L80 16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hidden md:block absolute top-10 right-[4%] w-[26%] z-10" style={{ right: "37%" }}>
              <svg viewBox="0 0 100 20" fill="none" aria-hidden="true">
                <path d="M0 10 H90 M80 4 L96 10 L80 16" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            {[
              {
                step: "01",
                title: "資料請求",
                desc: "フォームから送信。2営業日以内に担当者がご連絡します。",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M3 9h18M8 4v5M16 4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "初期設定（15分）",
                desc: "担当者が店舗情報を登録。LINEの友だち追加で準備完了。",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "LINEで話しかける",
                desc: "あとはLINEを送るだけ。AIが意図を読み取って動きます。",
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: "#00B900" }}>
                    {item.icon}
                  </div>
                  <span className="text-4xl font-black text-gray-100 leading-none">{item.step}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          機能デモ（シーンカード）
      ====================================== */}
      <section id="features" className="py-20 px-5 bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              1日のどんな場面でも
            </h2>
            <p className="mt-3 text-slate-400 text-base">実際のLINEでのやり取りイメージ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <SceneCard number="1" title="SNS投稿を自動生成" timing="朝、仕入れから戻った時">
              <ChatBubble from="user">今日仕入れた地鶏、投稿文作って</ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1 text-xs text-gray-500">Instagram用</span>
                今朝入荷した地元産地鶏。炭火でじっくり焼き上げます。今夜のおすすめ、ぜひ。
                <span className="block mt-1 text-xs" style={{ color: "#00B900" }}>#地鶏 #炭火焼き #宝塚グルメ</span>
              </ChatBubble>
            </SceneCard>

            <SceneCard number="2" title="口コミ返信案を生成" timing="口コミ通知が来た時">
              <ChatBubble from="user">「接客が丁寧で絶品でした」への返信作って</ChatBubble>
              <ChatBubble from="linoa">
                温かいお言葉をいただき、誠にありがとうございます。スタッフ一同の励みになります。またのお越しを心よりお待ちしております。
              </ChatBubble>
            </SceneCard>

            <SceneCard number="3" title="売上を一言で記録" timing="閉店後のレジ締め">
              <ChatBubble from="user">今日18万、52人</ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">記録しました</span>
                <span className="text-xs text-gray-500">4月9日　売上 180,000円　客数 52人　客単価 3,461円</span>
                <span className="block mt-1 text-xs text-gray-400">今月累計：890,000円（8日営業）</span>
              </ChatBubble>
            </SceneCard>

            <SceneCard number="4" title="月次レポートを自動配信" timing="月末にLinoaから届く">
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">3月のレポートです</span>
                <span className="text-xs text-gray-500">売上合計 2,450,000円　前月比 +12%　客単価 3,820円</span>
                <span className="block mt-2 text-xs p-2 rounded-lg bg-white/70">
                  金曜の2名客でドリンク注文率が低い傾向です。ドリンクセットを提案してみませんか？
                </span>
              </ChatBubble>
            </SceneCard>

            <SceneCard number="5" title="顧客情報をすぐ呼び出せる" timing="常連客の予約が入った時">
              <ChatBubble from="user">田中さんの情報</ChatBubble>
              <ChatBubble from="linoa">
                <span className="font-semibold block mb-1">田中さん（12回来店）</span>
                <span className="text-xs text-gray-500">
                  最終来店 4月2日　好み 赤ワイン・牛肉料理<br />
                  アレルギー 甲殻類　誕生日 3月15日
                </span>
              </ChatBubble>
            </SceneCard>

            {/* 最後のカード：サポートアピール */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="relative rounded-xl overflow-hidden shadow-md aspect-video mb-4">
                  <Image
                    src="/handshake.webp"
                    alt="導入サポートのイメージ"
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">導入サポート付き</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  初期設定は担当者が対応します。ITが苦手でも安心してご利用いただけます。
                </p>
              </div>
              <a href="#contact"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                style={{ color: "#00B900" }}>
                詳しく聞く
                <ArrowRightIcon />
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================
          比較テーブル（vs 従来の方法）
      ====================================== */}
      <section className="py-20 px-5 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Why Linoa</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              これまでとの違い
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            {/* ヘッダー */}
            <div className="grid grid-cols-3 bg-slate-900 text-white text-sm font-semibold">
              <div className="px-5 py-4 text-slate-400">タスク</div>
              <div className="px-5 py-4 text-center border-l border-white/10">従来の方法</div>
              <div className="px-5 py-4 text-center border-l border-white/10" style={{ color: "#00B900" }}>Linoa</div>
            </div>
            {/* 行 */}
            {[
              {
                task: "SNS投稿",
                before: "毎回ゼロから文章を考える",
                after: "「投稿文作って」で即完成",
              },
              {
                task: "口コミ返信",
                before: "何を書くか悩んで後回し",
                after: "口コミを貼るだけで返信案",
              },
              {
                task: "売上管理",
                before: "ノート → 月末にエクセル集計",
                after: "「今日○万」で即記録・自動集計",
              },
              {
                task: "顧客情報",
                before: "オーナーの頭の中だけ",
                after: "LINEで検索、すぐ呼び出せる",
              },
              {
                task: "月次レポート",
                before: "作る時間がない・作れない",
                after: "月末に自動送信",
              },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 text-sm border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                <div className="px-5 py-4 font-medium text-gray-700">{row.task}</div>
                <div className="px-5 py-4 text-gray-400 border-l border-gray-100 text-center leading-relaxed">{row.before}</div>
                <div className="px-5 py-4 border-l border-gray-100 text-center leading-relaxed font-medium" style={{ color: "#059669" }}>{row.after}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================
          料金セクション
      ====================================== */}
      <section id="pricing" className="py-20 px-5 bg-gray-50">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Pricing</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            今なら無料
          </h2>

          <div className="bg-white rounded-2xl border-2 p-8 shadow-sm" style={{ borderColor: "#00B900" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-white mb-5"
              style={{ backgroundColor: "#00B900" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              クローズドβ版
            </div>
            <div className="text-6xl font-black text-gray-900 mb-1 tracking-tight">
              ¥0
            </div>
            <p className="text-gray-400 text-sm mb-7">/月 · βテスト期間中</p>

            <ul className="text-left space-y-3 mb-8">
              {[
                "SNS投稿文生成（Instagram・X）",
                "口コミ返信案の自動生成",
                "売上記録・月次レポート",
                "顧客メモ管理",
                "在庫・仕入れメモ",
                "導入サポート付き",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <a href="#contact"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-bold text-base hover:opacity-90 transition-opacity cursor-pointer min-h-[44px]"
              style={{ backgroundColor: "#00B900" }}>
              無料で資料請求する
              <ArrowRightIcon />
            </a>
          </div>

          <p className="mt-5 text-xs text-gray-400">
            βテスト終了後は有償化予定。参加店舗には優遇プランを提供予定。
          </p>
        </div>
      </section>

      {/* ======================================
          資料請求フォーム
      ====================================== */}
      <section id="contact" className="py-20 px-5 bg-slate-900">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">Contact</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              まず、話を聞いてみる
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              フォームを送信後、2営業日以内に担当者からご連絡します。<br />
              導入の流れや費用についても、遠慮なくご相談ください。
            </p>
          </div>

          <ContactForm />
        </div>
      </section>

      {/* ======================================
          フッター
      ====================================== */}
      <footer className="py-10 px-5 bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* 上段: ロゴ + 規約リンク */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <Image src="/linoa-logo.png" alt="Linoa" width={28} height={28} className="object-contain" />
              <span className="text-white font-bold">Linoa</span>
            </div>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <a href="/privacy" className="hover:text-white transition-colors cursor-pointer">
                プライバシーポリシー
              </a>
              <a href="/terms" className="hover:text-white transition-colors cursor-pointer">
                利用規約
              </a>
              <a href="/data-deletion" className="hover:text-white transition-colors cursor-pointer">
                データ削除のお手続き
              </a>
            </nav>
          </div>
          {/* 下段: 著作権 */}
          <div className="pt-6 text-center sm:text-right">
            <p className="text-slate-600 text-xs">© 2026 Linoa. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
