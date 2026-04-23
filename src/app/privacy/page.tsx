// ============================================
// プライバシーポリシー
// 個人情報保護法・Meta審査・Stripe審査で参照されるため
// 公開URL: https://li-noa.jp/privacy
// ============================================

export const metadata = {
  title: "プライバシーポリシー | Linoa",
  description: "Linoaにおける個人情報の取扱いについて",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 py-12 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">プライバシーポリシー</h1>
          <p className="text-sm text-gray-500">最終更新日: 2026年4月21日</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed">
          <p>
            Linoa（以下「当方」といいます）は、当方が提供するサービス「Linoa」（以下「本サービス」といいます）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第1条（事業者情報）</h2>
            <dl className="space-y-1 pl-4">
              <div className="flex gap-4">
                <dt className="text-gray-500 w-24 shrink-0">事業者名</dt>
                <dd>Linoa</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-gray-500 w-24 shrink-0">代表者</dt>
                <dd>原口 翔伍</dd>
              </div>
              <div className="flex gap-4">
                <dt className="text-gray-500 w-24 shrink-0">連絡先</dt>
                <dd>s.haraguchi@li-noa.jp</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第2条（取得する情報）</h2>
            <p className="mb-3">当方は、本サービスの提供にあたり、以下の情報を取得します。</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">(1) ユーザーから直接提供される情報</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>店舗情報（店舗名、オーナー名、業態、エリア、コンセプト等）</li>
                  <li>アカウント情報（メールアドレス、パスワード、認証情報）</li>
                  <li>お問い合わせ・資料請求時に入力される氏名・メールアドレス・電話番号・メッセージ本文</li>
                  <li>LINE経由で送信されるメッセージ、写真、その他コンテンツ</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">(2) 外部サービスから取得する情報</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>LINEプラットフォーム: LINEユーザーID、表示名、プロフィール画像</li>
                  <li>Meta（Instagram / Facebook）: Facebookユーザー情報、接続されたInstagramビジネスアカウントのID・名前・プロフィール、OAuthアクセストークン、投稿の公開結果</li>
                  <li>Stripe: Stripe顧客ID、サブスクリプション状態、決済履歴（※カード番号・有効期限等の決済情報は当方のサーバーを経由せずStripeが直接保管します）</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">(3) 自動的に取得する情報</h3>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>IPアドレス、ブラウザ種別、OS、アクセス日時等のログ情報</li>
                  <li>Cookieおよび類似技術により取得される識別子</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第3条（利用目的）</h2>
            <p className="mb-3">当方は、取得した情報を以下の目的で利用します。</p>
            <ol className="list-decimal pl-6 space-y-1 text-gray-700">
              <li>本サービスの提供・運営・改善のため</li>
              <li>ユーザーからのお問い合わせに対応するため</li>
              <li>AIによる分析・施策提案・コンテンツ生成のため</li>
              <li>ユーザーの同意に基づきInstagramへ自動投稿を行うため</li>
              <li>利用料金の請求・決済のため</li>
              <li>利用規約違反、不正利用、セキュリティインシデントの検知および対応のため</li>
              <li>サービスに関する重要なお知らせの通知のため</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第4条（第三者提供）</h2>
            <p>当方は、法令で定められた場合を除き、あらかじめユーザーの同意を得ることなく個人情報を第三者に提供しません。</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第5条（業務委託先）</h2>
            <p className="mb-3">当方は、利用目的の達成に必要な範囲において、以下の外部サービス（業務委託先）に個人情報の取扱いを委託します。</p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>Supabase, Inc.（データベース・認証基盤）</li>
              <li>Stripe, Inc.（決済処理）</li>
              <li>LINE株式会社（LINEメッセージ送受信）</li>
              <li>Meta Platforms, Inc.（Instagram Graph API連携）</li>
              <li>Anthropic, PBC（AI処理）</li>
              <li>Google LLC（AI処理、画像生成）</li>
              <li>Vercel, Inc.（アプリケーションホスティング）</li>
            </ul>
            <p className="mt-3 text-gray-600">
              業務委託先の選定にあたっては、個人情報を適切に取り扱う事業者を選び、契約・規約により必要かつ適切な監督を行います。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第6条（Metaプラットフォームから取得する情報の取扱い）</h2>
            <p className="mb-3">
              本サービスは、ユーザーの同意のもとMeta Platforms, Inc.が提供するInstagram Graph APIおよびFacebook Login for Businessを利用します。本サービスがMetaプラットフォームから取得する情報および取扱いは以下のとおりです。
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>取得する権限（スコープ）: instagram_basic, instagram_content_publish, pages_show_list, pages_read_engagement, business_management</li>
              <li>利用目的: 各スコープは以下の目的で使用します。
                <ul className="list-disc pl-6 mt-1 space-y-0.5 text-gray-600">
                  <li>instagram_basic: 連携されたInstagramビジネスアカウントの基本情報（ID・名前）を取得</li>
                  <li>instagram_content_publish: ユーザーが指定したInstagramビジネスアカウントへ投稿を公開</li>
                  <li>pages_show_list: ユーザーが管理するFacebookページの一覧を取得し、連携可能なInstagramアカウントを特定</li>
                  <li>pages_read_engagement: FacebookページとInstagramビジネスアカウントの紐付けを取得</li>
                  <li>business_management: Business Portfolio配下のInstagramビジネスアカウントへアクセス</li>
                </ul>
              </li>
              <li>アクセストークンは当方のデータベース内で暗号化して保管し、本サービス以外の目的では利用しません</li>
              <li>ユーザーはMetaアカウントの設定からいつでも連携を解除できます。連携解除後、当方は該当するアクセストークンを削除します</li>
              <li>本サービスの利用は、Metaが定める利用規約およびプラットフォーム利用規約に準拠します</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第7条（Cookie等の利用）</h2>
            <p>
              当方は、ユーザーのログイン状態の維持、利用状況の分析、サービス改善を目的として、Cookieおよび類似技術を使用します。ユーザーはブラウザの設定により、Cookieの受け入れを拒否できますが、その場合本サービスの一部機能が利用できなくなる可能性があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第8条（安全管理措置）</h2>
            <p>
              当方は、個人情報の漏えい、滅失または毀損の防止その他の個人情報の安全管理のために、通信の暗号化（HTTPS）、アクセス権限の制限、多要素認証、脆弱性対応等の必要かつ適切な措置を講じます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第9条（保存期間）</h2>
            <p>
              当方は、利用目的の達成に必要な期間に限り個人情報を保管します。ユーザーが本サービスの利用を終了した場合、または削除を請求した場合、法令で保管が義務付けられている情報を除き、合理的な期間内に削除または匿名化します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第10条（開示・訂正・削除等の請求）</h2>
            <p className="mb-3">
              ユーザーは、個人情報保護法に基づき、当方に対して自己の個人情報の開示、訂正、追加、削除、利用停止、第三者提供の停止を請求できます。請求は以下の窓口までメールでご連絡ください。
            </p>
            <div className="pl-4 py-3 bg-gray-50 rounded-lg">
              <p>お問い合わせ窓口: s.haraguchi@li-noa.jp</p>
            </div>
            <p className="mt-3 text-gray-600">
              請求にあたっては本人確認のため追加情報の提供をお願いする場合があります。合理的な期間内に回答いたします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第11条（プライバシーポリシーの変更）</h2>
            <p>
              当方は、法令の改正、本サービスの内容変更その他の理由により、本ポリシーを変更することがあります。変更後の本ポリシーは、本サービス上に掲載した時点から効力を生じます。重要な変更がある場合は、合理的な方法でユーザーに通知します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第12条（お問い合わせ）</h2>
            <p>
              本ポリシーに関するご質問・ご意見は、以下の窓口までお願いいたします。
            </p>
            <div className="pl-4 py-3 mt-3 bg-gray-50 rounded-lg">
              <p>Linoa</p>
              <p>代表者: 原口 翔伍</p>
              <p>メールアドレス: s.haraguchi@li-noa.jp</p>
            </div>
          </section>
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-500">
          <p>© 2026 Linoa. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}
