// ============================================
// データ削除のお申し出
// Meta審査「ユーザーデータの削除手順URL」で参照されるため
// 公開URL: https://li-noa.jp/data-deletion
// ============================================

export const metadata = {
  title: "データ削除のお申し出 | Linoa",
  description: "Linoaに登録された個人情報・利用データの削除手続きについて",
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 py-12 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">データ削除のお申し出</h1>
          <p className="text-sm text-gray-500">最終更新日: 2026年4月22日</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed">
          <p>
            Linoa（以下「当方」といいます）は、本サービスに登録されたユーザーの個人情報および利用データの削除について、以下の手続きを設けています。
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">削除の申し出方法</h2>
            <p className="mb-3">以下の宛先までメールにてご連絡ください。</p>
            <div className="pl-4 py-3 bg-gray-50 rounded-lg space-y-1">
              <p><span className="text-gray-500">宛先:</span> s.haraguchi@li-noa.jp</p>
              <p><span className="text-gray-500">件名:</span> データ削除依頼</p>
            </div>
            <p className="mt-3">本文に以下の情報をご記入ください（本人確認のため）。</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
              <li>店舗名</li>
              <li>オーナー名</li>
              <li>登録メールアドレス</li>
              <li>削除を希望する対象（例: アカウント全体 / Instagram連携情報のみ など）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">削除対象となる情報</h2>
            <p className="mb-3">お申し出に基づき、以下の情報を削除または匿名化します。</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>店舗プロフィール（店舗名・業態・エリア・コンセプト等）</li>
              <li>アカウント情報（メールアドレス、認証情報）</li>
              <li>LINE連携情報（LINEユーザーID、送受信メッセージ、写真）</li>
              <li>Meta（Instagram / Facebook）連携情報（OAuthアクセストークン、Instagramビジネスアカウント情報）</li>
              <li>AIが生成したコンテンツ（投稿文案、画像）</li>
              <li>Stripe顧客情報との紐付け（顧客ID参照。決済履歴自体はStripe社が保管）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Meta連携情報のみを解除したい場合</h2>
            <p>
              アカウント全体は残したまま、Meta（Instagram / Facebook）連携のみを解除したい場合は、本サービスの「店舗設定」画面からInstagram連携解除ボタンを押下してください。アクセストークン等のMeta関連情報が即時に削除されます。あわせてMetaアカウントの設定画面からアプリ連携を解除することもできます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">削除完了までの期間</h2>
            <p>
              お申し出を受領後、本人確認が完了次第、原則として30日以内に削除を完了し、完了時にメールにて通知します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">法令により保管が必要な情報</h2>
            <p>
              電子帳簿保存法、税法その他の法令により一定期間の保管が義務付けられている情報（取引記録、請求書、税務関連情報等）については、当該法令が定める期間に限り保管を継続します。保管期間経過後は速やかに削除します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">関連ポリシー</h2>
            <p>
              個人情報の取扱い全般については <a href="/privacy" className="text-blue-600 underline">プライバシーポリシー</a> をご参照ください。
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>© 2026 Linoa. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
