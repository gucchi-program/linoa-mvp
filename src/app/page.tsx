const LINE_URL = "#"; // LINE友だち追加URL（後日設定）

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Linoa
        </span>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-indigo-600 transition-colors">
            機能
          </a>
          <a href="#flow" className="hover:text-indigo-600 transition-colors">
            導入の流れ
          </a>
          <a href="#faq" className="hover:text-indigo-600 transition-colors">
            FAQ
          </a>
        </nav>
        <a
          href={LINE_URL}
          className="rounded-full px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
          style={{ backgroundColor: "#06C755" }}
        >
          無料で始める
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
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-sm font-medium text-indigo-700">
            飲食店オーナーのためのAI秘書
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
          お店の経営、
          <br />
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            ひとりで抱えていませんか？
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl mx-auto">
          LINEで話しかけるだけ。
          <br />
          あなたのお店専属のAI秘書がサポートします。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={LINE_URL}
            className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-white font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200 hover:-translate-y-0.5"
            style={{ backgroundColor: "#06C755" }}
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            LINEで無料で始める
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-medium transition-colors"
          >
            詳しく見る
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

function PainPointsSection() {
  const pains = [
    {
      icon: "📝",
      title: "日報が続かない",
      text: "毎日忙しくて、日報をつける余裕がない。気づけば1週間分溜まっている。",
    },
    {
      icon: "📊",
      title: "売上の把握が曖昧",
      text: "なんとなく忙しかった、暇だった...。数字で振り返る習慣がない。",
    },
    {
      icon: "📱",
      title: "販促に手が回らない",
      text: "SNS投稿やPOP作成、やりたいけど時間がない。結局後回しに。",
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
            忙しい毎日の中で、経営改善まで手が回らない。
            <br />
            それは仕組みの問題です。
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {pains.map((pain) => (
            <div
              key={pain.title}
              className="group bg-white rounded-2xl p-8 text-center border border-gray-200 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
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

function AboutSection() {
  const steps = [
    { num: "1", label: "LINEで入力", desc: "質問に答えるだけで日報完了", icon: "💬" },
    { num: "2", label: "AIが分析", desc: "売上傾向を自動で把握", icon: "🤖" },
    { num: "3", label: "提案・実行", desc: "改善アクションをお届け", icon: "✨" },
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto text-center">
        <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
          How it works
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
          Linoaとは？
        </h2>
        <p className="text-lg text-gray-500 mb-16 max-w-lg mx-auto">
          LINEで日報を送るだけ。あとはLinoaにお任せ。
        </p>
        <div className="relative flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-0">
          {/* PC: ステップ間の接続線 */}
          <div className="hidden sm:block absolute top-10 left-1/2 -translate-x-1/2 w-[60%] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-indigo-200" />

          {steps.map((step) => (
            <div key={step.num} className="relative flex flex-col items-center sm:flex-1">
              <div className="relative z-10 w-20 h-20 rounded-2xl bg-white shadow-lg shadow-indigo-100 border border-indigo-100 flex items-center justify-center text-3xl mb-4">
                {step.icon}
              </div>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold mb-2">
                {step.num}
              </span>
              <span className="font-bold text-gray-900 mb-1">{step.label}</span>
              <span className="text-sm text-gray-500">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: "📝",
      title: "日報入力",
      description: "LINEで質問に答えるだけ。1日3分で日報が完了します。専用アプリのインストールは不要。",
      accent: "from-green-400 to-emerald-500",
    },
    {
      icon: "📊",
      title: "ダッシュボード",
      description: "売上・客数をグラフで可視化。日別・週別の傾向が一目でわかります。",
      accent: "from-blue-400 to-indigo-500",
    },
    {
      icon: "💡",
      title: "AI提案",
      description: "売上データから改善のヒントを自動配信。データに基づく経営判断をサポート。",
      accent: "from-amber-400 to-orange-500",
    },
    {
      icon: "🎨",
      title: "SNS / POP生成",
      description: "投稿文やPOPデザインをAIが自動作成。販促の手間を大幅に削減します。",
      comingSoon: true,
      accent: "from-purple-400 to-pink-500",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-semibold text-indigo-600 tracking-wide uppercase mb-3">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Linoaの機能
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            経営に必要なことを、ひとつのLINEに集約
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="group relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* ホバー時のアクセントライン */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              {f.comingSoon && (
                <span className="absolute top-4 right-4 text-xs bg-purple-50 text-purple-600 font-semibold px-3 py-1 rounded-full border border-purple-100">
                  Coming Soon
                </span>
              )}
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 leading-relaxed text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlowSection() {
  const flowSteps = [
    {
      num: "1",
      title: "LINE友だち追加",
      desc: "QRコードを読み取るか、ボタンをタップするだけ",
    },
    {
      num: "2",
      title: "お店の情報を登録",
      desc: "LINEのトーク画面で店名・業態などを入力",
    },
    {
      num: "3",
      title: "日報入力スタート",
      desc: "登録したその日からすぐに使い始められます",
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

function FAQSection() {
  const faqs = [
    {
      q: "料金はかかりますか？",
      a: "現在、無料テスト中です。テスト期間中はすべての機能を無料でお使いいただけます。",
    },
    {
      q: "ITに詳しくなくても使えますか？",
      a: "はい。LINEが使えれば大丈夫です。専用アプリのインストールや難しい操作は一切ありません。",
    },
    {
      q: "どんな業態に対応していますか？",
      a: "居酒屋、カフェ、レストラン、バーなど、飲食店全般に対応しています。",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 bg-white">
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
              className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-indigo-200 transition-colors duration-200"
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
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700" />
      <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          まずは無料で試してみませんか？
        </h2>
        <p className="text-indigo-200 mb-10 leading-relaxed max-w-md mx-auto">
          LINEで友だち追加するだけで、すぐに始められます。
          <br />
          面倒な登録手続きは一切ありません。
        </p>
        <a
          href={LINE_URL}
          className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-white font-bold text-lg shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: "#06C755" }}
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          LINEで無料で始める
        </a>
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
            <p className="text-gray-500 text-sm mt-1">あなたのお店の、専属AI秘書</p>
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
      <Header />
      <HeroSection />
      <PainPointsSection />
      <AboutSection />
      <FeaturesSection />
      <FlowSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  );
}
