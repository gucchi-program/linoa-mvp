import ContactForm from "./components/ContactForm";

// Google検索のリッチスニペット表示用の構造化データ（JSON-LD）
function JsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Linoa",
    url: "https://li-noa.jp",
    description: "個人飲食店向けのHP制作＋LINE連携AI秘書サービス。",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@li-noa.jp",
      contactType: "customer service",
      availableLanguage: "Japanese",
    },
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
    </>
  );
}

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Linoa
        </span>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-gray-600">
          <a href="#phases" className="hover:text-indigo-600 transition-colors">
            サービス
          </a>
          <a href="#pricing" className="hover:text-indigo-600 transition-colors">
            料金
          </a>
          <a href="#story" className="hover:text-indigo-600 transition-colors">
            想い
          </a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">
            FAQ
          </a>
        </nav>
        <a
          href="#contact"
          className="rounded-full px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
        >
          相談する
        </a>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-28 px-6">
      {/* 背景装飾 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute top-40 right-1/4 w-48 h-48 bg-green-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-4 py-1.5 mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse motion-reduce:animate-none" />
          <span className="text-sm font-medium text-indigo-700">
            LINEで育てる、店舗専属AI
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
          あなたのお店の経験と勘を、
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            専属のAIに変えていく。
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 mb-6 leading-relaxed max-w-xl mx-auto">
          LINEに送るだけ。
          <br />
          それだけで、HPもGoogleもInstagramも自動で更新される。
          <br />
          そして使い続けるほど、あなたのお店だけのAIが育っていく。
        </p>

        <p className="text-sm text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto">
          Linoaは、個人飲食店オーナーのためのLINE連携AIサービスです。
          まずはホームページの制作から。LINEで写真や一言を送るだけで自動更新できる仕組みを構築し、
          使い続けるうちにお店の売上パターンや仕込みのクセをAIが学習します。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-white font-bold text-lg bg-indigo-600 shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* エンベロープアイコン */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            まず相談してみる
          </a>
          <a
            href="#phases"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            サービスの詳細を見る
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

// 信頼性を高めるソーシャルプルーフ
function SocialProofSection() {
  const stats = [
    { value: "49,800円", label: "HP制作 初期費用から" },
    { value: "LINE", label: "だけで全操作完結" },
    { value: "使うほど", label: "AIが育っていく" },
  ];

  return (
    <section className="py-10 px-6 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto">
        <dl className="grid grid-cols-3 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {s.value}
              </dt>
              <dd className="mt-1 text-sm text-gray-500">{s.label}</dd>
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
      icon: (
        // グローブアイコン: HPがない・止まっていることを表現
        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
        </svg>
      ),
      title: "HPがない、または止まっている",
      text: "作ったまま数年放置。メニューが変わっても更新できていない。",
    },
    {
      icon: (
        // ビルディングアイコン: プラットフォーム依存を表現
        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
        </svg>
      ),
      title: "食べログ・ぐるなびへの依存",
      text: "毎月の掲載費が重い。自前の集客の仕組みを持てていない。",
    },
    {
      icon: (
        // メガホンアイコン: SNS発信の停滞を表現
        <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      ),
      title: "SNS投稿が続かない",
      text: "やりたいけど時間がない。何を投稿すればいいかもわからない。",
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Pain Points
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            こんなお悩み、ありませんか？
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            集客も情報発信も、仕組みがないと続かない。
            <br />
            Linoaはその仕組みをまるごと作ります。
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {pains.map((pain) => (
            <div
              key={pain.title}
              className="group bg-white rounded-2xl p-8 text-center border border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 motion-reduce:transition-none">
                {pain.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{pain.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {pain.text}
              </p>
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
      num: "Phase 1",
      accent: "from-indigo-500 to-blue-500",
      iconBg: "bg-indigo-50",
      icon: (
        // グローブアイコン: HP制作・お店の顔をつくる
        <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253M3 12a8.959 8.959 0 01.284-2.253" />
        </svg>
      ),
      title: "お店の顔をつくる",
      body: "まず、ホームページをゼロから制作します。スマートフォン対応・Google Maps連携・お知らせページを標準装備。制作会社への依頼では30万円以上かかる水準を、49,800円でご提供します。ホットペッパーに掲載しなくても、お店の世界観をきちんと伝えられる場所をつくります。",
    },
    {
      num: "Phase 2",
      accent: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-50",
      icon: (
        // チャットアイコン: LINEでぜんぶつながる
        <svg className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
      title: "LINEでぜんぶつながる",
      body: "LINEにメニューの写真を送るだけで、HPが自動更新されます。GoogleビジネスプロフィールもInstagramも、同時に反映。「更新のたびに業者へ連絡する」手間も費用も不要になります。月額3,000〜5,000円で、情報発信が継続できる仕組みを構築します。",
    },
    {
      num: "Phase 3",
      accent: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-50",
      icon: (
        // スパークルアイコン: AIが育つ
        <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      ),
      title: "お店専属のAIが育つ",
      body: "売上・仕込み量・食材ロス・常連の来店パターン。LINEで送り続けるだけで、お店のデータが蓄積されていきます。データが積み上がるにつれ、AIが「今週は〇〇が売れる」「この食材は今日使い切ったほうがいい」と逆提案するようになります。長年かけて磨いてきた経験と勘を、AIが引き継いでいくイメージです。",
    },
  ];

  return (
    <section id="phases" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Service
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Linoaが提供する、3つのフェーズ
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            最初からフルプランである必要はありません。
            <br />
            HPからはじめて、少しずつAIへ育てていく。
          </p>
        </div>

        <div className="space-y-8">
          {phases.map((phase) => (
            <div
              key={phase.num}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${phase.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl ${phase.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 motion-reduce:transition-none`}>
                  {phase.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-1 block">
                    {phase.num}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{phase.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{phase.body}</p>
                </div>
              </div>
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
      initial: "49,800円",
      monthly: "なし",
      features: ["HP制作のみ", "スマートフォン対応", "Google Maps連携", "お知らせページ"],
      highlight: false,
    },
    {
      name: "Standard",
      initial: "79,800円",
      monthly: "3,000〜5,000円/月",
      features: ["HP制作", "LINE自動更新", "売上・客数管理", "週次レポート"],
      highlight: false,
    },
    {
      name: "Pro",
      initial: "79,800円",
      monthly: "8,000〜10,000円/月",
      features: ["Standardの全機能", "在庫・賞味期限管理", "SNS自動投稿", "POP画像生成"],
      highlight: true,
    },
    {
      name: "Full",
      initial: "79,800円",
      monthly: "12,000〜15,000円/月",
      features: ["Proの全機能", "シフト管理", "AI需要予測", "発注提案"],
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            まずHPから、少しずつAIへ。
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            最初からフルプランである必要はありません。
            使い続けながら段階的に機能を追加できます。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 border transition-all duration-300 flex flex-col ${
                plan.highlight
                  ? "border-indigo-400 shadow-lg shadow-indigo-100 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-block bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  おすすめ
                </span>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{plan.name}</h3>
                <div className="mb-1">
                  <span className="text-xs text-gray-400">初期費用</span>
                  <p className="text-xl font-extrabold text-gray-900">{plan.initial}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">月額</span>
                  <p className="text-sm font-semibold text-indigo-600">{plan.monthly}</p>
                </div>
              </div>
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-8">
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
    },
    {
      num: "2",
      title: "HP制作・納品（約2週間）",
      desc: "スマートフォン対応のLPを制作。Google Maps・お知らせ機能つき",
    },
    {
      num: "3",
      title: "LINEにLinoaを追加（5分で完了）",
      desc: "設定はこちらで対応。オーナー様の作業は最小限です",
    },
    {
      num: "4",
      title: "日報入力スタート",
      desc: "データが積み上がるにつれ、AIの提案精度が上がっていきます",
    },
  ];

  return (
    <section id="flow" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Getting Started
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            導入の流れ
          </h2>
        </div>
        <div className="relative">
          {/* タイムライン縦線 */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-300 via-purple-300 to-indigo-100" />

          <div className="space-y-12">
            {flowSteps.map((step) => (
              <div key={step.num} className="relative flex items-start gap-8 pl-2">
                <div className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-lg shadow-indigo-200">
                  {step.num}
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200 flex-1 hover:shadow-md transition-shadow duration-200">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// 代表プロフィール・想い
function ProfileSection() {
  return (
    <section id="story" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Story
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            なぜ、飲食店のための
            <br />
            AIをつくるのか。
          </h2>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 sm:p-12 border border-indigo-100">
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed mb-5">
              すき家でアルバイトをしていた時のことです。
            </p>
            <p className="text-gray-600 leading-relaxed mb-5">
              誰かが何か起きるたびに、報告のLINEが飛んできます。
              欠勤の連絡、在庫の報告、売上のメモ。毎日、何十通も流れていく。
              「これをうまく整理できないか」と思ったのが、Linoaの出発点でした。
            </p>
            <p className="text-gray-600 leading-relaxed mb-5">
              大手チェーンで感じたその課題は、個人の居酒屋にも同じように、
              あるいはもっと深刻な形で存在していました。
              HPの更新が止まっている。SNSをやりたいけど時間がない。
              メニューが変わるたびにぐるなびとホットペッパーを手動で直している。
            </p>
            <p className="text-gray-600 leading-relaxed mb-5">
              ただ、解決したいのは「作業の効率化」だけではありません。
            </p>
            <p className="text-gray-600 leading-relaxed mb-5">
              あなたが20年かけて培ってきた「今日は何を多めに仕込むか」という感覚。
              「あの常連さんが来る日は〇〇が売れる」という経験。
              それは今、どこにも記録されていません。あなたの頭の中にだけあります。
            </p>
            <p className="text-gray-600 leading-relaxed">
              その勘と経験を、AIに変えていきたいと思っています。
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-indigo-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">原口 翔伍</p>
              <p className="text-sm text-gray-500">Linoa 代表</p>
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
    <section id="faq" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            よくある質問
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-200 transition-colors duration-200"
            >
              <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 text-xs font-bold shrink-0 mt-0.5">Q</span>
                {faq.q}
              </h3>
              <p className="text-gray-500 leading-relaxed pl-9">
                {faq.a}
              </p>
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
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            まず、相談してみる
          </h2>
          <p className="text-indigo-200 leading-relaxed">
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
    <footer className="py-12 px-6 bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xl font-bold text-white">Linoa</span>
            <p className="text-gray-500 text-sm mt-1">あなたのお店の経験と勘を、専属AIに変えていく</p>
            <p className="text-gray-600 text-xs mt-2">
              使用技術: Next.js / Supabase / Claude API / LINE Messaging API
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="mailto:contact@li-noa.jp" className="hover:text-white transition-colors">
              お問い合わせ
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Linoa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
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
