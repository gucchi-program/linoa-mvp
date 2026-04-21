// ============================================
// 利用規約
// Meta審査・Stripe審査・特定商取引法で参照されるため
// 公開URL: https://li-noa.jp/terms
// ============================================

export const metadata = {
  title: "利用規約 | Linoa",
  description: "Linoaの利用規約",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-800 py-12 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10 pb-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">利用規約</h1>
          <p className="text-sm text-gray-500">最終更新日: 2026年4月21日</p>
        </header>

        <div className="space-y-8 text-sm leading-relaxed">
          <p>
            この利用規約（以下「本規約」といいます）は、Linoa（以下「当方」といいます）が提供するサービス「Linoa」（以下「本サービス」といいます）の利用条件を定めるものです。利用者（以下「ユーザー」といいます）は、本規約に同意のうえ本サービスを利用するものとします。
          </p>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第1条（本サービスの内容）</h2>
            <p className="mb-3">
              本サービスは、飲食店等の店舗運営者向けに、LINEを主要インターフェースとして以下の機能を提供するクラウドサービスです。
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              <li>LINE経由での店舗データ（売上・メニュー・写真等）の収集・蓄積</li>
              <li>AIによる分析・施策提案およびコンテンツ（投稿文案・画像）の生成</li>
              <li>Instagramビジネスアカウントへの投稿自動化（ユーザーの事前同意に基づく）</li>
              <li>その他、当方が随時追加する関連機能</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第2条（利用契約の成立）</h2>
            <p>
              利用契約は、ユーザーが本規約に同意のうえ所定の方法で申込みを行い、当方がこれを承諾した時点で成立します。当方は、過去に規約違反があったユーザー、反社会的勢力に該当するおそれがあるユーザー、その他当方が不適切と判断したユーザーからの申込みを承諾しない場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第3条（利用料金）</h2>
            <div className="space-y-3">
              <p>本サービスの利用料金は以下のとおりです（消費税込）。</p>
              <dl className="space-y-2 pl-4">
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-32 shrink-0">初期費用</dt>
                  <dd>金29,800円（初回契約時のみ）</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-32 shrink-0">月額利用料</dt>
                  <dd>金9,800円</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-32 shrink-0">支払方法</dt>
                  <dd>Stripeによるクレジットカード決済</dd>
                </div>
                <div className="flex gap-4">
                  <dt className="text-gray-500 w-32 shrink-0">支払時期</dt>
                  <dd>初回契約時に初期費用＋初月月額を請求、以降は毎月同日に月額を請求</dd>
                </div>
              </dl>
              <p className="text-gray-600">
                料金の改定を行う場合、当方は効力発生日の30日前までにユーザーに通知します。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第4条（アカウント管理）</h2>
            <p>
              ユーザーは、自己の責任においてアカウント情報（メールアドレス、パスワード、店舗コード、LINE連携情報等）を管理するものとします。アカウント情報の第三者への開示・貸与・譲渡により発生した損害について、当方は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第5条（禁止事項）</h2>
            <p className="mb-3">ユーザーは、本サービスの利用にあたり以下の行為を行ってはなりません。</p>
            <ol className="list-decimal pl-6 space-y-1 text-gray-700">
              <li>法令、公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当方、他のユーザー、または第三者の権利・利益を侵害する行為</li>
              <li>本サービスの運営を妨害する行為、または過度な負荷をかける行為</li>
              <li>不正アクセス、リバースエンジニアリング、自動化ツールによる大量アクセス等の行為</li>
              <li>他人になりすます行為、虚偽の情報を登録する行為</li>
              <li>AIが生成したコンテンツを、事実と異なる情報として第三者に提示する行為</li>
              <li>連携する外部サービス（LINE、Meta、Stripe等）の規約に違反する行為</li>
              <li>その他、当方が不適切と合理的に判断する行為</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第6条（知的財産権）</h2>
            <div className="space-y-3">
              <p>
                本サービスおよび本サービスを構成するプログラム・デザイン・商標等に関する知的財産権は、当方または正当な権利者に帰属します。
              </p>
              <p>
                ユーザーが本サービス上で入力・アップロードしたコンテンツ（店舗情報、写真、テキスト等）の著作権はユーザーに帰属します。ただしユーザーは、本サービスの提供・改善・AIモデルの学習（※個人を特定できない形に限る）・マーケティング上の参照のために必要な範囲で、当方が当該コンテンツを無償で利用することを許諾するものとします。
              </p>
              <p>
                AIが生成したコンテンツ（投稿文案、画像等）の利用権はユーザーに許諾されますが、第三者の権利を侵害しないことをユーザー自身の責任で確認するものとします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第7条（外部サービス連携）</h2>
            <p>
              本サービスは、LINE、Meta（Instagram / Facebook）、Stripe等の外部サービスと連携します。ユーザーは、これらの外部サービスの規約に同意した上で連携機能を利用するものとし、外部サービスの仕様変更、障害、アカウント停止等により本サービスの一部機能が利用できない場合があることに同意します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第8条（契約期間・解約）</h2>
            <div className="space-y-3">
              <p>
                利用契約の期間は、契約成立日から1か月とし、ユーザーまたは当方から解約の申し出がない限り、自動的に1か月ごとに更新されます。
              </p>
              <p>
                ユーザーは、次回更新日の前日までに所定の方法で解約の申し出を行うことで、次回更新日をもって契約を終了させることができます。月途中の解約による月額利用料の日割り返金は行いません。初期費用は理由の如何を問わず返金しません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第9条（利用停止・契約解除）</h2>
            <p>
              当方は、ユーザーが本規約に違反した場合、利用料金の支払いを怠った場合、その他当方が合理的に必要と判断した場合、事前の通知なく本サービスの利用停止または利用契約の解除を行うことができます。この場合、当方は生じた損害について一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第10条（サービスの変更・中断・終了）</h2>
            <p>
              当方は、本サービスの内容を随時変更・追加・廃止することができます。また、システムメンテナンス、障害、天災、外部サービスの仕様変更その他やむを得ない事由により、事前の通知なく本サービスの全部または一部を中断することがあります。当方は、本サービス全体を終了する場合、合理的な期間をもってユーザーに通知します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第11条（免責事項）</h2>
            <div className="space-y-3">
              <p>
                当方は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、特定目的への適合性、セキュリティ等に関する欠陥を含む）がないことを明示的にも黙示的にも保証しません。
              </p>
              <p>
                AIが生成するコンテンツ（投稿文案、画像、分析結果等）について、当方はその正確性・有用性・適法性を保証しません。ユーザーは、AI生成物を利用する際、内容を自身で確認のうえ、自己の責任で利用するものとします。
              </p>
              <p>
                当方は、本サービスに起因してユーザーに生じた損害について、当方の故意または重過失による場合を除き、責任を負いません。なお当方が責任を負う場合であっても、その賠償額はユーザーが直近12か月に当方に支払った利用料金の総額を上限とします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第12条（個人情報の取扱い）</h2>
            <p>
              当方は、本サービスの提供にあたり取得する個人情報を、別途定めるプライバシーポリシー（<a href="/privacy" className="text-blue-600 underline">/privacy</a>）に従い適切に取り扱います。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第13条（規約の変更）</h2>
            <p>
              当方は、必要と判断した場合、ユーザーに事前に通知することにより本規約を変更できます。変更後の規約は、本サービス上に掲載した時点から効力を生じ、ユーザーが本サービスを引き続き利用した場合、変更後の規約に同意したものとみなします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第14条（準拠法・裁判管轄）</h2>
            <p>
              本規約は日本法を準拠法とします。本サービスまたは本規約に関して生じた一切の紛争については、訴額に応じて東京地方裁判所または東京簡易裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">第15条（お問い合わせ）</h2>
            <p>本規約に関するお問い合わせは、以下の窓口までお願いいたします。</p>
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
