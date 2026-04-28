// ============================================
// VC面談用 ピッチ資料ページ
// Basic Auth (middleware) で保護されている / robots noindex で検索除外
// ============================================

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Linoa - Pre-Seed 投資資料",
  description: "VC向け資料（非公開）",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

// 数値ハイライトカード
function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs text-slate-500 font-medium tracking-wide">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// セクション見出し
function SectionTitle({ no, title, sub }: { no: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <p className="text-sm font-semibold text-emerald-600 tracking-widest">SECTION {no}</p>
      <h2 className="mt-1 text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{title}</h2>
      {sub && <p className="mt-2 text-base text-slate-600">{sub}</p>}
    </div>
  );
}

// テーブル用ラッパー
function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-slate-700 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-slate-200">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-slate-700 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ForVcPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white py-16 sm:py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-300 text-sm font-semibold tracking-widest uppercase">
            Confidential / For VC Only
          </p>
          <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight">
            Linoa Pre-Seed 投資資料
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            LINE × AI で個人飲食店の経営を支援する SaaS
          </p>
          <p className="mt-2 text-sm text-slate-400">2026年4月28日 / 原口翔伍</p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <p className="text-xs text-slate-300">調達額</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">¥1,000万</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <p className="text-xs text-slate-300">想定バリュエーション</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">¥3〜5千万</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <p className="text-xs text-slate-300">LTV / CAC</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">14.2x</p>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur border border-white/20 p-4">
              <p className="text-xs text-slate-300">ランウェイ</p>
              <p className="mt-1 text-2xl sm:text-3xl font-bold">12ヶ月</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: 調達額の結論 */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="01" title="今日の結論" sub="Pre-Seed ¥1,000万円の調達計画" />

          <DataTable
            headers={["項目", "内容"]}
            rows={[
              ["調達額", <strong key="1">¥1,000万円</strong>],
              ["想定バリュエーション", "¥3,000〜5,000万円（Pre-money）"],
              ["希望条件", "J-KISS型新株予約権（バリュエーションキャップ ¥5,000万）"],
              ["資金使途", "開発費40%、営業費30%、運転資金30%"],
              ["ランウェイ", "約12ヶ月（2027年4月のSeed調達まで）"],
            ]}
          />

          <h3 className="mt-10 text-xl font-bold text-slate-900">なぜ¥1,000万か</h3>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li>
              <strong>少なすぎるリスク：</strong>¥500万では2027年4月のSeed到達前に資金が枯渇する可能性がある
            </li>
            <li>
              <strong>多すぎるリスク：</strong>プロダクト未リリースで¥2,000万以上を求めると、バリュエーションの正当化が難しい
            </li>
            <li>
              <strong>¥1,000万の根拠：</strong>月次バーン約80万円（開発インフラ + 最小限の外注 + 営業交通費）× 12ヶ月 ≒ ¥960万
            </li>
          </ul>

          <h3 className="mt-10 text-xl font-bold text-slate-900">資金使途の内訳</h3>
          <div className="mt-4">
            <DataTable
              headers={["用途", "金額", "内容"]}
              rows={[
                ["開発費", "¥400万", "Claude API利用料、Supabase、インフラ、UI/UX改善"],
                ["営業費", "¥300万", "代理店紹介料、チラシ・販促物、交通費、セミナー出展"],
                ["運転資金", "¥300万", "予備費、法人設立費用、会計・法務"],
              ]}
            />
          </div>
        </div>
      </section>

      {/* Section 2: ワンページサマリー */}
      <section className="py-16 px-5 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="02" title="ワンページサマリー" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="価格" value="¥9,800/月" sub="設定費 ¥29,800" />
            <StatCard label="LTV" value="¥382,600" sub="継続3年想定" />
            <StatCard label="CAC" value="¥27,000" sub="加重平均" />
            <StatCard label="LTV/CAC" value="14.2x" sub="健全ライン3xを超過" />
            <StatCard label="粗利率" value="65〜70%" sub="API原価控除後" />
            <StatCard label="ペイバック" value="5.4ヶ月" sub="CAC回収期間" />
            <StatCard label="TAM" value="¥2.75兆" sub="対面接客型 234万店" />
            <StatCard label="SAM" value="¥1,176億" sub="飲食店100万店" />
            <StatCard label="SOM Phase 1" value="¥1.2億" sub="関西1,000店" />
          </div>

          <p className="mt-6 text-sm text-slate-600">
            初期チャネル: <strong>京都商工会議所</strong> + <strong>鮮魚卸業者リファラル</strong>
          </p>
        </div>
      </section>

      {/* Section 3: 市場規模 */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="03" title="市場規模 (TAM / SAM / SOM)" />

          {/* 構造図 */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-100 p-5 border border-slate-300">
                <p className="text-xs font-semibold text-slate-500">TAM</p>
                <p className="text-lg font-bold text-slate-900">対面接客型ローカルビジネス全体</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">234万店 × ¥117,600 ≒ 約 2.75兆円/年</p>

                <div className="mt-4 rounded-lg bg-emerald-50 p-5 border border-emerald-200">
                  <p className="text-xs font-semibold text-emerald-700">SAM</p>
                  <p className="text-base font-bold text-slate-900">飲食店全体</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">100万店 × ¥117,600 ≒ 約 1,176億円/年</p>

                  <div className="mt-4 rounded-lg bg-emerald-100 p-5 border border-emerald-300">
                    <p className="text-xs font-semibold text-emerald-800">SOM Phase 2 (3-5年後)</p>
                    <p className="text-sm font-bold text-slate-900">個人 × 継続 × IT受容 = 22.7万店</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">≒ 約 267億円/年</p>

                    <div className="mt-4 rounded-lg bg-emerald-200 p-5 border border-emerald-400">
                      <p className="text-xs font-semibold text-emerald-900">SOM Phase 1 (〜3年)</p>
                      <p className="text-sm font-bold text-slate-900">関西 1,000店</p>
                      <p className="text-lg font-bold text-slate-900 mt-1">≒ 約 1.2億円/年</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">TAM 内訳</h3>
          <div className="mt-4">
            <DataTable
              headers={["業種", "事業所数", "出典"]}
              rows={[
                ["飲食店", "約100万店", "衛生行政報告例（食品衛生法ベース）"],
                ["小売業（個人商店・専門店）", "約88万事業所", "令和3年経済センサス"],
                ["生活関連サービス業（美容・理容・エステ等）", "約46万事業所", "令和3年経済センサス"],
                [<strong key="t">合計</strong>, <strong key="t2">約234万店</strong>, ""],
              ]}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">なぜ横展開が可能か</h3>
          <ul className="mt-4 space-y-2 text-slate-700 list-disc pl-5">
            <li>全業種で共通する課題: 1〜3人運営、店主が経営と現場を兼務、ITに不慣れ</li>
            <li>全業種でLINEが顧客接点として既に機能している</li>
            <li>Linoaのコアバリュー「LINE × AIで店主を支援する」は業種非依存</li>
          </ul>

          <h3 className="mt-10 text-xl font-bold text-slate-900">SAM 絞り込みロジック（飲食店100万店）</h3>
          <div className="mt-4">
            <DataTable
              headers={["条件", "残存比率", "店舗数"]}
              rows={[
                ["全国飲食店", "100%", "1,000,000"],
                ["× 個人経営", "70%", "700,000"],
                ["× 継続営業（5年生存）", "50%", "350,000"],
                ["× LINE/スマホ活用可能", "65%", <strong key="s">227,500</strong>],
              ]}
            />
            <p className="mt-3 text-sm text-slate-600">→ 227,500店 × ¥117,600 ≒ <strong>約267億円/年</strong></p>
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">SOM Phase 1 絞り込みロジック（関西1,000店）</h3>
          <div className="mt-4">
            <DataTable
              headers={["条件", "店舗数"]}
              rows={[
                ["関西2府（大阪・兵庫）の飲食店", "65,000"],
                ["× 個人経営70%", "45,500"],
                ["× 継続営業50%", "22,750"],
                ["× IT受容65%", "14,800"],
                ["× 3年で獲得シェア6.7%", <strong key="s">1,000</strong>],
              ]}
            />
            <p className="mt-3 text-sm text-slate-600">→ 1,000店 × ¥117,600 ≒ <strong>約1.2億円/年</strong></p>
          </div>
        </div>
      </section>

      {/* Section 4: ユニットエコノミクス */}
      <section className="py-16 px-5 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="04" title="ユニットエコノミクス" />

          <h3 className="text-xl font-bold text-slate-900">価格体系</h3>
          <div className="mt-4">
            <DataTable
              headers={["項目", "金額"]}
              rows={[
                ["初期設定費", "¥29,800（1回）"],
                ["月額利用料", "¥9,800"],
                ["年間ARPU", "¥117,600（¥9,800 × 12）"],
              ]}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">LTV（顧客生涯価値）</h3>
          <div className="mt-4 rounded-xl bg-slate-900 text-white p-5 font-mono text-sm">
            LTV = 設定費 + 月額 × 平均継続月数<br />
            &nbsp;&nbsp;&nbsp;&nbsp;= ¥29,800 + ¥9,800 × 36ヶ月<br />
            &nbsp;&nbsp;&nbsp;&nbsp;= <span className="text-emerald-400 font-bold">¥382,600</span>
          </div>
          <div className="mt-4">
            <DataTable
              headers={["継続期間", "LTV"]}
              rows={[
                ["12ヶ月", "¥147,400"],
                ["24ヶ月", "¥265,000"],
                [<strong key="b">36ヶ月（ベースケース）</strong>, <strong key="b2">¥382,600</strong>],
                ["60ヶ月", "¥617,800"],
              ]}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">CAC（顧客獲得コスト）</h3>
          <div className="mt-4">
            <DataTable
              headers={["フェーズ", "主チャネル", "平均CAC"]}
              rows={[
                ["Phase 0（シード20店）", "リファラル100%", "¥10,000"],
                ["Phase 1（〜100店）", "リファラル+商工会", "¥15,000"],
                ["Phase 2（〜500店）", "代理店+口コミ", "¥25,000"],
                ["Phase 3（〜1,000店）", "複数チャネル並走", "¥35,000"],
                [<strong key="a">全フェーズ加重平均</strong>, "", <strong key="a2">¥27,000</strong>],
              ]}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">LTV / CAC 比率</h3>
          <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center">
            <p className="text-sm text-emerald-700 font-semibold">¥382,600 ÷ ¥27,000</p>
            <p className="mt-2 text-5xl font-bold text-emerald-700">14.2倍</p>
            <p className="mt-2 text-xs text-slate-600">SaaS業界の健全ライン3倍を大きく超過 / スケール時でも11倍を維持見込み</p>
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">1店舗あたり月次コスト構造</h3>
          <div className="mt-4">
            <DataTable
              headers={["項目", "月額"]}
              rows={[
                ["売上", "¥9,800"],
                ["Claude API利用料", "▲¥2,000"],
                ["LINE Messaging API", "▲¥1,000"],
                ["インフラ按分", "▲¥300"],
                ["CS工数按分", "▲¥1,500"],
                [<strong key="g">粗利</strong>, <strong key="g2">¥5,000（粗利率51%）</strong>],
              ]}
            />
            <p className="mt-3 text-sm text-slate-600">※ 保守的見積もり。API利用効率改善で粗利率65〜70%まで引き上げ可能</p>
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">CAC回収月数</h3>
          <div className="mt-4 rounded-xl bg-slate-900 text-white p-5 font-mono text-sm">
            CAC ÷ 月次粗利 = ¥27,000 ÷ ¥5,000 = <span className="text-emerald-400 font-bold">5.4ヶ月</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            約6ヶ月で獲得コスト回収完了。SaaS業界の目安（12ヶ月以内）を大きくクリア。
          </p>
        </div>
      </section>

      {/* Section 5: 顧客獲得ロジック */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="05" title="顧客獲得ロジック (SOM Phase 1: 1,000店まで)" />

          <h3 className="text-xl font-bold text-slate-900">初期チャネル（既に確保済み）</h3>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Channel 01</p>
              <h4 className="mt-1 text-lg font-bold text-slate-900">京都商工会議所</h4>
              <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>商工会議所とのコネクトが既にある</li>
                <li>セミナー・交流会・会員メルマガ経由で店舗獲得</li>
                <li>「商工会議所推薦」の信頼が初期の心理的障壁を下げる</li>
                <li>京都→大阪→神戸の商工会議所ネットワークに横展開</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Channel 02</p>
              <h4 className="mt-1 text-lg font-bold text-slate-900">鮮魚卸業者リファラル</h4>
              <ul className="mt-3 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>飲食店向けに魚を卸している方からの直接紹介</li>
                <li>卸業者は店主と毎朝顔を合わせる→信頼ベースの紹介</li>
                <li>このチャネルを「代理店制度」に発展させることが Phase 2 の鍵</li>
              </ul>
            </div>
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">獲得ロードマップ</h3>
          <div className="mt-4">
            <DataTable
              headers={["フェーズ", "店舗数", "主チャネル", "CAC"]}
              rows={[
                ["Phase 0（〜2026年8月）", "20店", "リファラル100%", "¥10,000"],
                ["Phase 1（〜2027年3月）", "100店", "リファラル+商工会", "¥15,000"],
                ["Phase 2（〜2028年3月）", "500店", "代理店+口コミ", "¥25,000"],
                ["Phase 3（〜2029年3月）", "1,000店", "複数チャネル並走", "¥35,000"],
              ]}
            />
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">代理店制度（Phase 2 で本格稼働）</h3>
          <div className="mt-4">
            <DataTable
              headers={["報酬体系", "金額"]}
              rows={[
                ["紹介成約報酬", "¥14,900（設定費の50%）"],
                ["月次継続報酬", "¥980/月（月額の10%）"],
              ]}
            />
            <p className="mt-3 text-sm text-slate-600">
              卸業者にとって「紹介するだけで毎月の不労所得」が生まれる経済的動機を設計
            </p>
            <p className="mt-2 text-sm text-slate-600">
              対象パートナー業種: 食品卸、酒類卸、厨房機器、看板業者、税理士、行政書士
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: 5ヵ年ロードマップ */}
      <section className="py-16 px-5 bg-white border-y border-slate-200">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="06" title="5ヵ年ロードマップ (2026-2031)" />

          <DataTable
            headers={["年", "ステータス", "店舗数", "MRR", "ARR", "調達"]}
            rows={[
              ["2026", "休学中（100%）", "50", "¥49万", "¥588万", <strong key="r1">Pre-Seed ¥1,000万</strong>],
              ["2027", "同志社復学（70%）", "250", "¥245万", "¥2,940万", <strong key="r2">Seed ¥3〜5千万</strong>],
              ["2028", "同志社4年（70%）", "800", "¥784万", <strong key="r3">¥9,400万</strong>, <strong key="r4">Series A ¥1〜3億</strong>],
              ["2029", "京大院M1（70%）", "2,000", "¥1,960万", "¥2.35億", "—"],
              ["2030", "京大院M2（70%）", "5,000", "¥5,500万", "¥6.6億", <strong key="r5">Series B ¥5〜10億</strong>],
              ["2031", "修了→フルタイム", "8,500", "¥8,500万", <strong key="r6">¥10億</strong>, "—"],
            ]}
          />

          <h3 className="mt-10 text-xl font-bold text-slate-900">各年のマイルストーン</h3>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-emerald-600">2026年（Year 1）</p>
              <h4 className="mt-1 font-bold">プロダクト立ち上げ + PMF</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>5月: 開発・営業開始</li>
                <li>7月: PMF調査開始（無料トライアル20店舗）</li>
                <li>8月: 有料版リリース（レビュー返信・新メニュー対応）</li>
                <li>12月: 有料加盟店50店舗達成</li>
                <li>Pre-Seed調達（エンジェル / 関西アクセラ）</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-emerald-600">2027年（Year 2）</p>
              <h4 className="mt-1 font-bold">復学 + Seed + スケール開始</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>4月: 同志社復学、機能拡充（AI強化・在庫/シフト管理）</li>
                <li>代理店制度本格スタート（10社体制）</li>
                <li>初の正社員採用（CS 1名、エンジニア 1名）</li>
                <li>12月: 250店舗、Seed調達</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-emerald-600">2028年（Year 3）</p>
              <h4 className="mt-1 font-bold">Series A + ARR 1億突破</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>チーム5→8名体制</li>
                <li>関西→全国展開開始</li>
                <li>ARR 1億突破 = Tier1 VCとの対話が現実的に</li>
                <li>卒論をLinoa関連テーマで執筆</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-emerald-600">2029年（Year 4）</p>
              <h4 className="mt-1 font-bold">京大院進 + 他業種展開</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>3月: 同志社卒業</li>
                <li>4月: 京大院入学、美容・小売への横展開開始</li>
                <li>COO/VP of Sales採用、営業組織を自分の手から離す</li>
                <li>チーム15名規模</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-emerald-600">2030年（Year 5）</p>
              <h4 className="mt-1 font-bold">Series B + ARPU拡張</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>エンタープライズプラン投入（¥19,800/月）</li>
                <li>チーム30名規模</li>
                <li>ARR 6.6億でSeries B調達</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-semibold text-emerald-600">2031年（Year 5.5）</p>
              <h4 className="mt-1 font-bold">修了 → ARR 10億</h4>
              <ul className="mt-2 space-y-1 text-sm text-slate-700 list-disc pl-5">
                <li>3月: 京大修了、フルタイム経営へ</li>
                <li>12月: 8,500店舗、ARR 10億達成</li>
              </ul>
            </div>
          </div>

          <h3 className="mt-10 text-xl font-bold text-slate-900">資金調達ロードマップ</h3>
          <div className="mt-4">
            <DataTable
              headers={["ラウンド", "時期", "調達額", "想定バリュエーション", "トリガー"]}
              rows={[
                ["Pre-Seed", "2026年夏", "¥1,000万", "¥3,000〜5,000万", "PMF 20店+有料転換"],
                ["Seed", "2027年春", "¥3,000〜5,000万", "¥2〜3億", "ARR ¥1,000万超"],
                ["Series A", "2028年春", "¥1〜3億", "¥10〜20億", "ARR ¥5,000万〜1億"],
                ["Series B", "2030年", "¥5〜10億", "¥50〜100億", "ARR ¥5億超"],
              ]}
            />
            <p className="mt-3 text-sm text-slate-600">累計調達: 約¥7〜15億</p>
          </div>
        </div>
      </section>

      {/* Section 7: 想定Q&A */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="07" title="想定Q&A" />

          <div className="space-y-5">
            {[
              {
                q: "学生起業で本気度はあるのか？",
                a: "現在休学してフルタイムで取り組んでいる。復学後もLinoaに70%以上コミットし、京大院進後も経営を継続する。5年間は学生のまま走り切り、2031年の修了後にフルタイムCEOに移行する計画。学生であることは「低コストで長く走れる」という構造的優位性。",
              },
              {
                q: "月額¥9,800は個人飲食店に高くないか？",
                a: "POSレジの月額平均（¥10,000〜）とほぼ同等。かつLinoaは単機能ではなくAIによる経営支援全般を提供するため、ROIは十分。設定費¥29,800は従来の業務システム（数十万〜）と比較して参入障壁が低い。",
              },
              {
                q: "20店舗の見込みの根拠は？",
                a: "京都商工会議所とのコネクト、および飲食店向け鮮魚卸業者からのリファラルという2つのチャネルが既に確保済み。飛び込み営業ゼロで20店舗を集められる見込み。",
              },
              {
                q: "競合は？",
                a: "トレタ（予約管理）、Airレジ（POS）、favyなどは存在するが、いずれも「特定機能のデジタル化」であり、「LINE上のAIが店主と会話しながら経営全般を支援する」というポジションは空いている。競合が\"ツール\"なら、Linoaは\"パートナー\"。",
              },
              {
                q: "なぜ今この調達が必要なのか？",
                a: "2026年8月の有料版リリースから2027年4月のSeed調達まで約8ヶ月のランウェイが必要。この期間にPMF検証と50店舗獲得を完了させ、Seed調達時のエビデンスを作るための資金。",
              },
              {
                q: "エグジット戦略は？",
                a: "5年後にARR 10億を達成し、IPOまたはM&Aを選択肢として持つ。飲食×AI×SaaSの領域は、大手POS企業（スマレジ、USENグループ等）からの買収ニーズも想定される。ただし現時点ではIPOを第一目標とする。",
              },
              {
                q: "TAM 2.75兆円は大きすぎないか？",
                a: "TAMは将来の対面接客型ローカルビジネス全体への横展開を含む最大市場。実際に追いかけるのはSAM（飲食店100万店 / 1,176億円）とSOM（関西1,000店 / 1.2億円）。TAMは「天井の高さ」を示すもので、実行計画はSOM Phase 1から積み上げている。",
              },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="font-bold text-slate-900">Q{i + 1}. {item.q}</p>
                <p className="mt-2 text-slate-700 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: 3つのキーメッセージ */}
      <section className="py-16 px-5 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto">
          <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">SECTION 08</p>
          <h2 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight">
            今日の面談で絶対に伝える3つのメッセージ
          </h2>

          <div className="mt-10 space-y-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Message 01</p>
              <h3 className="mt-2 text-xl font-bold">チャネルが既にある</h3>
              <p className="mt-3 text-slate-300 leading-relaxed">
                Linoaは飛び込み営業に依存しない。京都商工会議所と鮮魚卸という&quot;店主が信頼する相手&quot;を起点に、リファラル中心で獲得する。最初の20店舗は今年の夏までに集まる見込みが既にある。
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Message 02</p>
              <h3 className="mt-2 text-xl font-bold">ユニットエコノミクスが健全</h3>
              <p className="mt-3 text-slate-300 leading-relaxed">
                LTV ¥382,600に対してCAC ¥27,000。LTV/CAC比率は14倍で、SaaS業界の健全ライン3倍を大きく超える。CACの回収は約6ヶ月で完了する。
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <p className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Message 03</p>
              <h3 className="mt-2 text-xl font-bold">5年で10億、段階的に確実に</h3>
              <p className="mt-3 text-slate-300 leading-relaxed">
                関西の個人飲食店1,000店から始めて、全国展開、他業種展開と段階的にSOMを拡大する。2031年にARR 10億を達成し、その先にIPOを見据える。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: 用語集 */}
      <section className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <SectionTitle no="09" title="用語集" />
          <DataTable
            headers={["用語", "意味", "Linoaでの値"]}
            rows={[
              ["TAM", "全体市場規模", "2.75兆円"],
              ["SAM", "獲得可能市場", "1,176億円"],
              ["SOM", "実現可能市場", "1.2億円（Phase 1）"],
              ["MRR", "月次経常収益", "店舗数 × ¥9,800"],
              ["ARR", "年次経常収益", "MRR × 12"],
              ["ARPU", "1顧客あたり平均売上", "¥117,600/年"],
              ["LTV", "顧客生涯価値", "¥382,600"],
              ["CAC", "顧客獲得コスト", "¥27,000（平均）"],
              ["LTV/CAC", "ユニットエコノミクス健全性", "14.2倍"],
              ["チャーン率", "月次解約率", "目標2.8%以下"],
              ["ペイバック", "CAC回収期間", "約6ヶ月"],
              ["J-KISS", "新株予約権型の調達手法", "Pre-Seedで推奨"],
              ["バリュエーションキャップ", "J-KISSの上限評価額", "¥5,000万"],
              ["ランウェイ", "資金が尽きるまでの期間", "12ヶ月"],
            ]}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-5 bg-slate-900 text-slate-400 text-center text-xs">
        <p>本資料は2026年4月28日時点の計画値に基づく。店舗数・売上等は全て見込みであり、実績に応じて随時更新する。</p>
        <p className="mt-2">Confidential / Linoa / 原口翔伍</p>
      </footer>
    </main>
  );
}
