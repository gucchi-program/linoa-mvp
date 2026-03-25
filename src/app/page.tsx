import ContactForm from "./components/ContactForm";

// Google検索のリッチスニペット表示用の構造化データ（JSON-LD）
function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Linoa",
    url: "https://li-noa.jp",
    logo: "https://li-noa.jp/icon.png",
    description: "個人飲食店向けのHP制作＋LINE連携AI秘書サービス。",
    sameAs: ["https://x.com/panaentre"],
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@li-noa.jp",
      contactType: "customer service",
      availableLanguage: "Japanese",
    },
  };

  // LocalBusiness スキーマ: ローカル検索・Googleマップへの露出に効果的
  const localBusiness = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Linoa",
    url: "https://li-noa.jp",
    description:
      "個人飲食店向けのHP制作＋LINE連携AI秘書サービス。LINEに送るだけでHP・Google・Instagramが自動更新。",
    email: "contact@li-noa.jp",
    priceRange: "¥¥",
    areaServed: {
      "@type": "Country",
      name: "Japan",
    },
    serviceType: ["ホームページ制作", "AI秘書", "LINE連携", "SNS自動投稿"],
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Linoa",
    description:
      "LINEに送るだけでHP・Google・Instagramが自動更新。使い続けるほどあなたのお店だけのAIが育っていく。",
    url: "https://li-noa.jp",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "49800",
      priceCurrency: "JPY",
      description: "HP制作 初期費用",
    },
    featureList: [
      "LP・ホームページ制作",
      "LINEによるHP自動更新",
      "売上・在庫管理",
      "SNS自動投稿",
      "AI需要予測・発注提案",
    ],
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "まずどこから始めればいいですか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "まずHP制作（Starterプラン 49,800円）から始めることをおすすめしています。その後、必要に応じてLinoaのAI機能を月額で追加できます。",
        },
      },
      {
        "@type": "Question",
        name: "ITに詳しくなくても使えますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "はい。LINEが使えれば大丈夫です。専用アプリのインストールや難しい操作は一切ありません。LINE設定もこちらで対応します。",
        },
      },
      {
        "@type": "Question",
        name: "どんな業態に対応していますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "居酒屋、カフェ、レストラン、バーなど、個人経営の飲食店全般に対応しています。",
        },
      },
      {
        "@type": "Question",
        name: "ホットペッパーや食べログをやめられますか？",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Linoaで自前のHP・Instagram・Googleビジネスプロフィールを育てることで、プラットフォーム依存を減らしていくことができます。",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
      />
    </>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-4 mt-4">
        <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 h-14 flex items-center justify-between shadow-lg shadow-black/10">
          <span className="text-lg font-bold text-white tracking-wide">
            Linoa
          </span>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-white/70">
            <a href="#phases" className="hover:text-white transition-colors duration-200 cursor-pointer">
              サービス
            </a>
            <a href="#pricing" className="hover:text-white transition-colors duration-200 cursor-pointer">
              料金
            </a>
            <a href="#story" className="hover:text-white transition-colors duration-200 cursor-pointer">
              想い
            </a>
            <a href="#faq" className="hover:text-white transition-colors duration-200 cursor-pointer">
              FAQ
            </a>
          </nav>
          <a
            href="#contact"
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-900 bg-white hover:bg-indigo-50 transition-colors duration-200 cursor-pointer shadow-sm"
          >
            相談する
          </a>
        </div>
      </div>
    </header>
  );
}

// LINEチャット風モックUI（ヒーローの視覚的要素）
function LineMockup() {
  return (
    <div className="relative w-72 shrink-0 animate-float">
      {/* フォン外枠 */}
      <div className="relative rounded-[2.5rem] bg-slate-800 border border-white/10 p-2 shadow-2xl shadow-black/40">
        {/* 画面 */}
        <div className="rounded-[2rem] bg-slate-900 overflow-hidden">
          {/* LINEヘッダー */}
          <div className="bg-[#00B900] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 5.92 2 10.72c0 2.88 1.54 5.44 3.96 7.12L5 21l3.28-1.64C9.4 19.76 10.68 20 12 20c5.52 0 10-3.92 10-8.72S17.52 2 12 2z"/>
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-bold">Linoa</p>
              <p className="text-green-100 text-xs">オンライン</p>
            </div>
          </div>

          {/* チャット本文 */}
          <div className="p-4 space-y-3 bg-[#BACEE0]/10 min-h-[340px]">
            {/* ユーザーメッセージ */}
            <div className="flex justify-end">
              <div className="bg-[#00B900] text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[200px] leading-relaxed">
                今日の売上 52,000円<br />客数 41人でした
              </div>
            </div>

            {/* AIレスポンス */}
            <div className="flex justify-start">
              <div className="bg-white text-slate-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[220px] leading-relaxed shadow-sm">
                お疲れ様でした！<br />
                今週の売上推移はこちらです。
                <div className="mt-2 bg-slate-50 rounded-lg p-2 border border-slate-100">
                  <p className="text-[10px] text-slate-500 mb-1">今週の売上</p>
                  <div className="flex items-end gap-1 h-10">
                    {[60, 45, 70, 55, 80, 65, 90].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-indigo-500 to-violet-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-slate-400">月</span>
                    <span className="text-[9px] text-slate-400">日</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AIプロアクティブ提案 */}
            <div className="flex justify-start">
              <div className="bg-white text-slate-800 text-xs rounded-2xl rounded-tl-sm px-3 py-2 max-w-[220px] leading-relaxed shadow-sm">
                <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">AI提案</span><br />
                明日は金曜日です。過去のデータから唐揚げの仕込みを1.3倍にすることをお勧めします。
              </div>
            </div>

            {/* ユーザーメッセージ */}
            <div className="flex justify-end">
              <div className="bg-[#00B900] text-white text-xs rounded-2xl rounded-tr-sm px-3 py-2 max-w-[160px] leading-relaxed">
                ありがとう！<br />対応します
              </div>
            </div>
          </div>

          {/* 入力欄 */}
          <div className="bg-slate-800 px-3 py-2 flex items-center gap-2">
            <div className="flex-1 bg-white/10 rounded-full px-3 py-1.5 text-[11px] text-white/40">
              メッセージを送る…
            </div>
            <div className="w-7 h-7 rounded-full bg-[#00B900] flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* グロー効果 */}
      <div className="absolute -inset-4 bg-indigo-500/10 rounded-[3rem] blur-2xl -z-10" />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-slate-950 pt-20 pb-16 px-6">
      {/* Aurora背景アニメーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-aurora absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="animate-aurora2 absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/25 rounded-full blur-3xl" />
        <div className="animate-aurora absolute top-1/2 right-1/3 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" style={{ animationDelay: "-5s" }} />
        <div className="animate-aurora2 absolute bottom-10 left-1/3 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" style={{ animationDelay: "-8s" }} />
      </div>

      {/* グリッドオーバーレイ */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          {/* 左: テキスト */}
          <div className="flex-1 text-center lg:text-left">
            {/* バッジ */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-4 py-1.5 mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse motion-reduce:animate-none" />
              <span className="text-sm font-medium text-white/80">
                個人飲食店向け・LINE連携AI秘書
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] mb-6 tracking-tight">
              あなたのお店の
              <br />
              経験と勘を、
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                専属AIに変えていく。
              </span>
            </h1>

            <p className="text-lg text-white/60 mb-4 leading-relaxed max-w-xl mx-auto lg:mx-0">
              LINEに送るだけ。HPもGoogleもInstagramも自動更新。
              <br />
              使い続けるほど、あなたのお店だけのAIが育っていく。
            </p>

            <p className="text-sm text-white/40 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
              まずはホームページ制作から。Linoaはデータが積み上がるにつれ、
              売上パターンや仕込みのクセを学習し、逆提案するようになります。
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-slate-900 font-bold text-base bg-white hover:bg-indigo-50 transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                まず相談してみる（無料）
              </a>
              <a
                href="#phases"
                className="inline-flex items-center gap-2 text-white/60 hover:text-white font-medium text-sm transition-colors duration-200 cursor-pointer"
              >
                サービスの詳細を見る
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* 右: LINE チャットモックアップ */}
          <div className="hidden lg:flex justify-center">
            <LineMockup />
          </div>
        </div>
      </div>

      {/* 下部グラデーションフェード */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}

// 数値で見せる信頼性
function SocialProofSection() {
  const stats = [
    { value: "49,800円", label: "HP制作 初期費用から", sub: "制作会社の1/6の価格" },
    { value: "LINE", label: "だけで全操作完結", sub: "アプリ不要・設定はこちらで" },
    { value: "∞", label: "使うほど賢くなる", sub: "お店専属AIが育っていく" },
  ];

  return (
    <section className="py-16 px-6 bg-white border-b border-slate-100">
      <div className="max-w-4xl mx-auto">
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <dt className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-1">
                {s.value}
              </dt>
              <dd className="font-semibold text-slate-900 mb-0.5">{s.label}</dd>
              <dd className="text-sm text-slate-400">{s.sub}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function PainPointsSection() {
  const pains = [
    {
      gradient: "from-indigo-500 to-blue-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
        </svg>
      ),
      title: "HPがない、または止まっている",
      text: "作ったまま数年放置。メニューが変わっても更新できていない。",
    },
    {
      gradient: "from-rose-500 to-pink-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      ),
      title: "食べログ・ぐるなびへの依存",
      text: "毎月の掲載費が重い。自前の集客の仕組みを持てていない。",
    },
    {
      gradient: "from-amber-500 to-orange-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      ),
      title: "SNS投稿が続かない",
      text: "やりたいけど時間がない。何を投稿すればいいかもわからない。",
    },
  ];

  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
            Pain Points
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            こんなお悩み、ありませんか？
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            集客も情報発信も、仕組みがないと続かない。
            <br />
            Linoaはその仕組みをまるごと作ります。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {pains.map((pain) => (
            <div
              key={pain.title}
              className="group relative bg-white rounded-2xl p-8 border border-slate-200 hover:border-transparent hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden cursor-default"
            >
              {/* ホバー時グラデーション上辺 */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${pain.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />

              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pain.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 motion-reduce:transition-none shadow-lg`}>
                {pain.icon}
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-lg">{pain.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{pain.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 3フェーズのサービス紹介
function PhasesSection() {
  const phases = [
    {
      num: "01",
      accent: "from-indigo-500 to-blue-500",
      badge: "bg-indigo-100 text-indigo-700",
      label: "Phase 1",
      title: "お店の顔をつくる",
      price: "初期費用 49,800円〜",
      body: "まずホームページをゼロから制作します。スマートフォン対応・Google Maps連携・お知らせページを標準装備。制作会社への依頼では30万円以上かかる水準を、49,800円でご提供します。ホットペッパーに掲載しなくても、お店の世界観をきちんと伝えられる場所をつくります。",
      features: ["スマートフォン対応", "Google Maps連携", "お知らせページ", "お問い合わせフォーム"],
    },
    {
      num: "02",
      accent: "from-violet-500 to-purple-500",
      badge: "bg-violet-100 text-violet-700",
      label: "Phase 2",
      title: "LINEでぜんぶつながる",
      price: "月額 3,000〜5,000円",
      body: "LINEにメニューの写真を送るだけで、HPが自動更新されます。GoogleビジネスプロフィールもInstagramも、同時に反映。「更新のたびに業者へ連絡する」手間も費用も不要になります。",
      features: ["LINE → HP自動更新", "Googleビジネス連携", "Instagram連携", "売上・客数管理"],
    },
    {
      num: "03",
      accent: "from-amber-500 to-orange-500",
      badge: "bg-amber-100 text-amber-700",
      label: "Phase 3",
      title: "お店専属のAIが育つ",
      price: "月額 8,000〜15,000円",
      body: "売上・仕込み量・食材ロス・常連の来店パターン。LINEで送り続けるだけで、お店のデータが蓄積されていきます。AIが「今週は〇〇が売れる」「この食材は今日使い切ったほうがいい」と逆提案するようになります。",
      features: ["AI需要予測", "在庫・賞味期限管理", "SNS/POP自動生成", "シフト管理"],
    },
  ];

  return (
    <section id="phases" className="py-24 px-6 bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-indigo-400 tracking-widest uppercase mb-3">
            Service
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Linoaが提供する、3つのフェーズ
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
            最初からフルプランである必要はありません。
            <br />
            HPからはじめて、少しずつAIへ育てていく。
          </p>
        </div>

        <div className="space-y-6">
          {phases.map((phase, idx) => (
            <div
              key={phase.num}
              className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all duration-300 overflow-hidden"
            >
              {/* 左サイドのアクセントバー */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${phase.accent}`} />

              <div className="p-8 pl-10">
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  {/* フェーズ番号 */}
                  <div className="shrink-0">
                    <span className={`text-6xl font-extrabold bg-gradient-to-br ${phase.accent} bg-clip-text text-transparent leading-none`}>
                      {phase.num}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${phase.badge}`}>
                        {phase.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{phase.price}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{phase.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm mb-5">{phase.body}</p>

                    {/* 機能タグ */}
                    <div className="flex flex-wrap gap-2">
                      {phase.features.map((f) => (
                        <span key={f} className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1 text-xs text-slate-300">
                          <svg className="w-3 h-3 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* フェーズ間コネクター */}
              {idx < phases.length - 1 && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-white/20 to-transparent z-10" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 料金プラン
function PricingSection() {
  const plans = [
    {
      name: "Starter",
      desc: "まずHPをつくる",
      initial: "49,800円",
      monthly: "なし",
      features: ["HP制作・納品", "スマートフォン対応", "Google Maps連携", "お知らせページ"],
      highlight: false,
      cta: "相談する",
    },
    {
      name: "Standard",
      desc: "HPとLINE連携",
      initial: "79,800円",
      monthly: "3,000〜5,000円/月",
      features: ["Starterの全機能", "LINE自動更新", "売上・客数管理", "週次レポート"],
      highlight: false,
      cta: "相談する",
    },
    {
      name: "Pro",
      desc: "AI機能フル活用",
      initial: "79,800円",
      monthly: "8,000〜10,000円/月",
      features: ["Standardの全機能", "在庫・賞味期限管理", "SNS自動投稿", "POP画像生成"],
      highlight: true,
      cta: "相談する",
    },
    {
      name: "Full",
      desc: "店舗AIを育てる",
      initial: "79,800円",
      monthly: "12,000〜15,000円/月",
      features: ["Proの全機能", "シフト管理", "AI需要予測", "発注提案"],
      highlight: false,
      cta: "相談する",
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            まずHPから、少しずつAIへ。
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto leading-relaxed">
            最初からフルプランである必要はありません。
            使い続けながら段階的に機能を追加できます。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300 ${
                plan.highlight
                  ? "bg-gradient-to-b from-indigo-600 to-violet-700 shadow-2xl shadow-indigo-500/30 scale-[1.02]"
                  : "bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-lg"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-block bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  おすすめ
                </span>
              )}

              <div className="mb-5">
                <h3 className={`text-lg font-extrabold mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-xs mb-4 ${plan.highlight ? "text-indigo-200" : "text-slate-400"}`}>
                  {plan.desc}
                </p>
                <div className={`rounded-xl p-3 ${plan.highlight ? "bg-white/10" : "bg-slate-50"}`}>
                  <div className="mb-2">
                    <span className={`text-xs ${plan.highlight ? "text-indigo-200" : "text-slate-400"}`}>初期費用</span>
                    <p className={`text-xl font-extrabold ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.initial}</p>
                  </div>
                  <div>
                    <span className={`text-xs ${plan.highlight ? "text-indigo-200" : "text-slate-400"}`}>月額</span>
                    <p className={`text-sm font-bold ${plan.highlight ? "text-indigo-200" : "text-indigo-600"}`}>{plan.monthly}</p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-indigo-100" : "text-slate-600"}`}>
                    <svg className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-indigo-300" : "text-indigo-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full text-center rounded-full py-3 text-sm font-bold transition-all duration-200 cursor-pointer ${
                  plan.highlight
                    ? "bg-white text-indigo-700 hover:bg-indigo-50 shadow-lg shadow-indigo-900/20"
                    : "bg-slate-100 text-slate-700 hover:bg-indigo-600 hover:text-white"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-slate-400 mt-8">
          Linoaはお店とともに育っていくサービスです。まずは無料相談からお気軽にどうぞ。
        </p>
      </div>
    </section>
  );
}

function FlowSection() {
  const flowSteps = [
    {
      num: "1",
      title: "無料相談（30分）",
      desc: "お店の状況をヒアリングし、最適なプランをご提案します",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
    },
    {
      num: "2",
      title: "HP制作・納品（約2週間）",
      desc: "スマートフォン対応のLPを制作。Google Maps・お知らせ機能つき",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0H3" />
        </svg>
      ),
    },
    {
      num: "3",
      title: "LINEにLinoaを追加（5分）",
      desc: "設定はこちらで対応。オーナー様の作業は最小限です",
      icon: (
        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 5.92 2 10.72c0 2.88 1.54 5.44 3.96 7.12L5 21l3.28-1.64C9.4 19.76 10.68 20 12 20c5.52 0 10-3.92 10-8.72S17.52 2 12 2z"/>
        </svg>
      ),
    },
    {
      num: "4",
      title: "日報入力スタート",
      desc: "データが積み上がるにつれ、AIの提案精度が上がっていきます",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="flow" className="py-24 px-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
            Getting Started
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            導入の流れ
          </h2>
        </div>

        <div className="grid sm:grid-cols-4 gap-6">
          {flowSteps.map((step, idx) => (
            <div key={step.num} className="relative flex flex-col items-center text-center">
              {/* ステップ番号アイコン */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                {step.icon}
              </div>

              {/* コネクターライン（最後のステップ以外） */}
              {idx < flowSteps.length - 1 && (
                <div className="hidden sm:block absolute top-7 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-px bg-gradient-to-r from-indigo-300 to-violet-300" />
              )}

              <span className="text-xs font-bold text-indigo-600 mb-1">STEP {step.num}</span>
              <h3 className="font-bold text-slate-900 mb-2 text-sm leading-snug">{step.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// 代表プロフィール・想い
function ProfileSection() {
  return (
    <section id="story" className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
            Story
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            なぜ、飲食店のための
            <br />
            AIをつくるのか。
          </h2>
        </div>

        <div className="relative rounded-3xl overflow-hidden">
          {/* 背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />

          <div className="relative p-10 sm:p-14">
            {/* 引用マーク */}
            <div className="text-6xl font-serif text-indigo-400/40 leading-none mb-4 select-none">&ldquo;</div>

            <div className="space-y-5 text-slate-300 leading-relaxed">
              <p>
                すき家でアルバイトをしていた時のことです。
              </p>
              <p>
                誰かが何か起きるたびに、報告のLINEが飛んできます。
                欠勤の連絡、在庫の報告、売上のメモ。毎日、何十通も流れていく。
                「これをうまく整理できないか」と思ったのが、Linoaの出発点でした。
              </p>
              <p>
                大手チェーンで感じたその課題は、個人の居酒屋にも同じように、
                あるいはもっと深刻な形で存在していました。
                HPの更新が止まっている。SNSをやりたいけど時間がない。
                メニューが変わるたびに手動で修正している。
              </p>
              <p className="text-white font-medium">
                あなたが20年かけて培ってきた「今日は何を多めに仕込むか」という感覚。
                「あの常連さんが来る日は〇〇が売れる」という経験。
                それは今、どこにも記録されていません。
              </p>
              <p>
                その勘と経験を、AIに変えていきたいと思っています。
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-white">Shogo H.</p>
                <p className="text-sm text-slate-400">Linoa 代表 / @panaentre</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      q: "まずどこから始めればいいですか？",
      a: "まずHP制作（Starterプラン 49,800円）から始めることをおすすめしています。その後、必要に応じてLinoaのAI機能を月額で追加できます。",
    },
    {
      q: "ITに詳しくなくても使えますか？",
      a: "はい。LINEが使えれば大丈夫です。LINE設定もこちらで対応するので、オーナー様の作業は最小限です。",
    },
    {
      q: "ホットペッパーや食べログをやめられますか？",
      a: "Linoaで自前のHP・Instagram・Googleビジネスプロフィールを育てることで、段階的にプラットフォーム依存を減らしていけます。",
    },
    {
      q: "どんな業態に対応していますか？",
      a: "居酒屋、カフェ、レストラン、バーなど、個人経営の飲食店全般に対応しています。",
    },
    {
      q: "データの管理やセキュリティは大丈夫ですか？",
      a: "お客様のデータは暗号化して安全に管理しています。第三者への提供は一切行いません。",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 tracking-widest uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            よくある質問
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
            >
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-3 flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-xs font-bold shrink-0 mt-0.5 shadow-sm">
                    Q
                  </span>
                  {faq.q}
                </h3>
                <p className="text-slate-500 leading-relaxed pl-9 text-sm">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="contact" className="relative py-24 px-6 overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-aurora absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="animate-aurora2 absolute bottom-0 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-bold text-indigo-400 tracking-widest uppercase mb-4">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            まず、相談してみる
          </h2>
          <p className="text-slate-400 leading-relaxed">
            HP制作だけでも、AI機能についても、お気軽にご相談ください。
            <br />
            2営業日以内にご連絡いたします。
          </p>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-6 bg-slate-950 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Linoa
            </span>
            <p className="text-slate-500 text-sm mt-1">あなたのお店の経験と勘を、専属AIに変えていく</p>
            <p className="text-slate-600 text-xs mt-2">
              Next.js / Supabase / Claude API / LINE Messaging API
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="mailto:contact@li-noa.jp" className="hover:text-white transition-colors duration-200 cursor-pointer">
              お問い合わせ
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-slate-600 text-sm">
            &copy; {new Date().getFullYear()} Linoa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <JsonLd />
      <Header />
      <HeroSection />
      <SocialProofSection />
      <PainPointsSection />
      <PhasesSection />
      <PricingSection />
      <FlowSection />
      <ProfileSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
