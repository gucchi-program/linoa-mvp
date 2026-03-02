export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-4">
          Linoa
        </h1>
        <p className="text-xl text-gray-500 mb-8">
          あなたのお店の、専属AI秘書
        </p>
        <p className="text-gray-600 leading-relaxed mb-12">
          LINEで話しかけるだけで、日報記録・売上分析・経営アドバイスを提供。
          <br />
          個人経営の飲食店オーナーの毎日をサポートします。
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-3 text-white font-medium">
          LINEで友だち追加して始める
        </div>
      </div>
    </main>
  );
}
