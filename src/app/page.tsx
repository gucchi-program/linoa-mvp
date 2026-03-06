const LINE_URL = "#"; // LINE友だち追加URL（後日設定）

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold text-indigo-600 tracking-wide mb-4">
          飲食店オーナーのためのAI秘書
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          お店の経営、
          <br className="sm:hidden" />
          ひとりで抱えていませんか？
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed">
          LINEで話しかけるだけ。
          <br />
          あなたのお店専属のAI秘書がサポートします。
        </p>
        <a
          href={LINE_URL}
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: "#06C755" }}
        >
          LINEで無料で始める
        </a>
      </div>
    </section>
  );
}

function PainPointsSection() {
  const pains = [
    {
      icon: "📝",
      text: "日報つけたいけど、忙しくて続かない",
    },
    {
      icon: "📊",
      text: "売上の傾向、なんとなくしかわからない",
    },
    {
      icon: "📱",
      text: "SNS投稿やPOP、作る時間がない",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          こんなお悩み、ありませんか？
        </h2>
        <p className="text-center text-gray-500 mb-12">
          忙しい毎日の中で、経営改善まで手が回らない...
        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {pains.map((pain) => (
            <div
              key={pain.text}
              className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100"
            >
              <div className="text-4xl mb-4">{pain.icon}</div>
              <p className="text-gray-700 font-medium leading-relaxed">
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
    { num: "1", label: "LINEで入力", icon: "💬" },
    { num: "2", label: "AIが分析", icon: "🤖" },
    { num: "3", label: "提案・実行", icon: "✨" },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Linoaとは？
        </h2>
        <p className="text-lg text-gray-600 mb-14 leading-relaxed">
          LINEで日報を送るだけ。あとはLinoaにお任せ。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-center gap-4 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl mb-3 border border-indigo-100">
                  {step.icon}
                </div>
                <span className="text-xs text-indigo-500 font-semibold mb-1">
                  STEP {step.num}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <span className="text-2xl text-indigo-300 hidden sm:block">
                  →
                </span>
              )}
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
      description: "LINEで質問に答えるだけ。1日3分で日報完了。",
    },
    {
      icon: "📊",
      title: "ダッシュボード",
      description: "売上・客数をグラフで可視化。傾向が一目でわかる。",
    },
    {
      icon: "💡",
      title: "AI提案",
      description: "売上改善のヒントを自動で配信。データに基づくアドバイス。",
    },
    {
      icon: "🎨",
      title: "SNS / POP生成",
      description: "投稿文やPOPデザインを自動作成。（Coming Soon）",
      comingSoon: true,
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
          Linoaの機能
        </h2>
        <p className="text-center text-gray-500 mb-12">
          経営に必要なことを、ひとつのLINEに
        </p>
        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow duration-200"
            >
              {f.comingSoon && (
                <span className="absolute top-4 right-4 text-xs bg-purple-100 text-purple-600 font-semibold px-3 py-1 rounded-full">
                  Coming Soon
                </span>
              )}
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{f.description}</p>
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
      desc: "QRコードを読み取るだけ",
    },
    {
      num: "2",
      title: "お店の情報を登録",
      desc: "店名・業態などをLINEで入力",
    },
    {
      num: "3",
      title: "日報入力スタート",
      desc: "その日からすぐ使える",
    },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-indigo-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
          導入の流れ
        </h2>
        <div className="space-y-8">
          {flowSteps.map((step) => (
            <div key={step.num} className="flex items-start gap-6">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {step.num}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
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
      a: "はい。LINEが使えれば大丈夫です。難しい操作は一切ありません。",
    },
    {
      q: "どんな業態に対応していますか？",
      a: "居酒屋、カフェ、レストランなど、飲食店全般に対応しています。",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-12">
          よくある質問
        </h2>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.q}
              className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
            >
              <h3 className="font-bold text-gray-900 mb-2">Q. {faq.q}</h3>
              <p className="text-gray-600 leading-relaxed">A. {faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 to-purple-600">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          まずは無料で試してみませんか？
        </h2>
        <p className="text-indigo-100 mb-10 leading-relaxed">
          LINEで友だち追加するだけで、すぐに始められます。
        </p>
        <a
          href={LINE_URL}
          className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
          style={{ backgroundColor: "#06C755" }}
        >
          LINEで無料で始める
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-8 px-6 bg-gray-900 text-center">
      <p className="text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Linoa
        <span className="mx-2">|</span>
        <a href="mailto:contact@li-noa.jp" className="hover:text-white transition-colors">
          お問い合わせ
        </a>
      </p>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
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
