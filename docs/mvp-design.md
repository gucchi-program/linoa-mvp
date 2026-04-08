# Linoa MVP 設計手順書
## 飲食店オーナーの右腕になるLINE AI

*2026年4月策定。実装を進める中で更新すること。*

---

## 1. Linoaとは何か

### 一言で
**飲食店オーナーの右腕になるLINE AI。**

### もう少し詳しく
個人飲食店のオーナー（1〜3名規模）は、料理は得意でも、SNSの更新・口コミの返信・売上管理・集客施策といった「経営まわりの雑務」に手が回っていない。しかし従来のDXツール（POSレジ、予約管理、MEOツール等）は、管理画面にログインして操作する前提で設計されており、営業中のオーナーにとっては「管理画面を開く」こと自体がハードルです。

Linoaは、オーナーが毎日使い慣れているLINEをインターフェースにすることで、ITリテラシーに関係なく導入できる飲食店AI経営支援を実現します。

### Linoaの核心的な差別化
1. **管理画面が不要**：UIはLINE。ダッシュボードを作らない（Phase 3まで）
2. **会話でデータが溜まる**：フォーム入力ではなく自然言語でデータを蓄積
3. **店舗固有のAIに育つ**：オーナーとの会話から「この店らしさ」を学習し、投稿や返信のトーンに反映
4. **個人店を狙う**：競合（トレタ、Canly等）が「営業コストに見合わない」として放置している1〜3名規模の個人店が主戦場

---

## 2. ターゲットペルソナ

- **規模**：1〜3名で運営している個人飲食店
- **業態**：居酒屋、イタリアン、和食、焼肉、焼き鳥が主。客単価3,000〜8,000円
- **エリア**：初期は阪急今津線沿線（宝塚〜西宮北口）。5年以上営業している地元密着型
- **オーナー像**：40〜60代、スマホはLINEとカメラくらいしか使っていない
- **課題**：SNS投稿できていない、口コミ返信が面倒、売上管理がノート、常連情報が頭の中にしかない

---

## 3. Linoaが解決する「5つの場面」

| Scene | タイミング | アクション |
|---|---|---|
| 1 | 朝、仕入れから戻った時 | 写真+ひとこと → SNS投稿文生成 |
| 2 | 隙間時間に口コミ通知 | 口コミをLinoaに転送 → 返信案生成 |
| 3 | 閉店後のレジ締め | 「今日18万、52人」 → 売上記録 |
| 4 | 月末のレポート | 自動サマリー + アクション提案 |
| 5 | 常連客の予約 | 「田中さんの情報」 → 来歴・好み返答 |

---

## 4. 技術スタック

```
Runtime       : Next.js 14+（App Router）
Language      : TypeScript
Hosting       : Vercel（Serverless Functions）
Database      : Supabase（PostgreSQL + Auth + Storage）
AI            : Claude API（claude-sonnet-4-20250514）
Messaging     : LINE Messaging API
Graph Image   : QuickChart API（グラフをPNG画像として生成）
```

### Phase 1で使わないもの（意図的に排除）
- ❌ Instagram / GBP への自動投稿API連携（手動代行）
- ❌ Google口コミの自動検知
- ❌ スマレジ / AirレジとのPOS API連携
- ❌ Webダッシュボード / 管理画面
- ❌ LIFF（LINEミニアプリ）
- ❌ 決済・課金システム（手動請求）

---

## 5. システムアーキテクチャ

```
[LINE] ←→ [Vercel / Next.js API Routes] ←→ [Supabase]
                    ↕
              [Claude API]
                    ↕
         [QuickChart API]（画像生成時のみ）
```

### メッセージ処理フロー

```
1. オーナーがLINEでメッセージを送信
2. LINE Messaging API がWebhookでPOST /api/webhook/line に送信
3. Webhook Handler：
   a. リクエスト署名を検証
   b. メッセージをmessagesテーブルに保存
   c. Claude APIで意図を判定
4. 意図に応じたハンドラーを実行：
   ├─ sns_post_request  → 投稿文生成
   ├─ sales_input       → daily_sales にINSERT
   ├─ customer_note     → customer_notes にUPSERT
   ├─ customer_query    → customer_notes を検索して返答
   ├─ inventory         → inventory_logs にINSERT
   ├─ review_reply      → 口コミ返信生成
   ├─ report_request    → 集計 + QuickChartグラフ
   ├─ question          → 店舗プロファイル付き経営相談
   └─ casual            → 雑談
5. Claude APIのレスポンスをLINE Reply Messageで返信
```

### 意図判定プロンプト

```
あなたは飲食店オーナー向けAIアシスタント「Linoa」のメッセージ分類器です。
以下のメッセージを読み、最も適切なカテゴリを1つだけ返してください。

カテゴリ:
- sns_post_request: SNSやGoogleに投稿したい、おすすめメニューの紹介依頼、「投稿作って」等
- sales_input: 売上、客数、客単価に関する数値の報告。「今日○万」「○人来た」等
- customer_note: 常連客やお客さんに関するメモ・情報の記録。「田中さんは〜」等
- customer_query: 特定の顧客の情報を知りたい。「田中さんの情報」「田中さんって何好きだっけ」等
- inventory: 食材の入荷、在庫、仕入れに関する情報。「鶏肉20kg入荷」「あと5kg」等
- review_reply_request: 口コミへの返信を作ってほしい。口コミテキストが含まれる場合も
- report_request: 売上レポートやサマリーを見たい。「今月の売上」「先週どうだった」等
- question: 経営やオペレーションに関する質問・相談。「値上げすべき？」等
- casual: 挨拶、雑談、お礼、その他

メッセージ: "{message}"

カテゴリ名のみを返してください。余計な文章は不要です。
```

### 店舗プロファイルのSystem Prompt

```
あなたは「Linoa」という飲食店オーナー向けAIアシスタントです。
以下の店舗情報をもとに、このオーナーの右腕として応答してください。

【店舗情報】
- 店名：{store_name}
- 業態：{store_type}（例：イタリアン、居酒屋）
- エリア：{area}
- 席数：{seat_count}席
- 客単価帯：{price_range}
- 営業年数：{years_in_business}年
- こだわり：{specialty}
- 客層：{customer_profile}
- オーナーの話し方：{owner_tone}（例：関西弁でフランク、丁寧語）

【応答ルール】
- 簡潔に答える。長文は避ける
- 数字を出す時は必ず具体的に
- 経営アドバイスは「何をすればいいか」のアクションまで落とす
- オーナーの言葉遣いに合わせたトーンで話す
- 絵文字は控えめに（オーナーが使っていれば合わせる）
```

---

## 6. データベース設計

```sql
-- 店舗マスタ（既存テーブルを拡張）
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_name TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_type TEXT,           -- 'izakaya', 'italian', 'ramen', 'yakiniku', etc.
  area TEXT,
  seat_count INTEGER,
  price_range TEXT,          -- '3000-5000', '5000-8000', etc.
  years_in_business INTEGER,
  specialty TEXT,
  customer_profile TEXT,
  owner_tone TEXT,
  profile_prompt TEXT,       -- Claude用の店舗プロファイル全文
  line_channel_id TEXT,
  line_user_id TEXT,
  google_business_id TEXT,   -- Phase 2用
  smaregi_contract_id TEXT,  -- Phase 2用
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- メッセージ全件保存
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  line_user_id TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  intent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 売上記録
CREATE TABLE daily_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  date DATE NOT NULL,
  revenue INTEGER,
  customer_count INTEGER,
  average_spend INTEGER,     -- 自動計算して保存
  memo TEXT,
  source TEXT DEFAULT 'manual_line',  -- 'manual_line' or 'pos_smaregi'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, date)
);

-- 顧客メモ
CREATE TABLE customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  customer_name TEXT NOT NULL,
  notes JSONB DEFAULT '{}',  -- { "preferences": "赤ワイン好き", "allergies": "甲殻類" }
  last_visit DATE,
  visit_count INTEGER DEFAULT 0,
  birthday TEXT,             -- 'MM-DD' 形式
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, customer_name)
);

-- 在庫・仕入れメモ
CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  item_name TEXT NOT NULL,
  quantity DECIMAL,
  unit TEXT,
  action TEXT CHECK (action IN ('received', 'used', 'note', 'waste')),
  memo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 生成コンテンツ（投稿案・返信案等）
CREATE TABLE generated_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) NOT NULL,
  content_type TEXT NOT NULL,  -- 'sns_post', 'review_reply', 'report'
  input_text TEXT,
  generated_text TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft', 'approved', 'posted', 'rejected'
  platform TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. ディレクトリ構成（目標）

```
src/
├── app/
│   └── api/
│       ├── webhook/line/route.ts         # LINE Webhookエンドポイント
│       └── cron/monthly-report/route.ts  # 月次レポート（Vercel Cron）
├── lib/
│   ├── line/
│   │   ├── client.ts
│   │   ├── verify.ts
│   │   ├── flex-templates.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── client.ts
│   │   ├── intent-classifier.ts
│   │   ├── store-profile.ts
│   │   └── prompts/
│   │       ├── system.ts
│   │       ├── sns-post.ts
│   │       ├── review-reply.ts
│   │       ├── sales-parser.ts
│   │       ├── customer-parser.ts
│   │       └── inventory-parser.ts
│   ├── db/
│   │   ├── client.ts
│   │   ├── messages.ts
│   │   ├── sales.ts
│   │   ├── customers.ts
│   │   ├── inventory.ts
│   │   └── contents.ts
│   ├── handlers/
│   │   ├── index.ts              # ルーティング
│   │   ├── sns-post.ts
│   │   ├── sales-input.ts
│   │   ├── customer-note.ts
│   │   ├── customer-query.ts
│   │   ├── inventory.ts
│   │   ├── review-reply.ts
│   │   ├── report-request.ts
│   │   ├── question.ts
│   │   └── casual.ts
│   └── chart/
│       └── quickchart.ts
└── types/index.ts
```

---

## 8. 環境変数

```env
LINE_CHANNEL_SECRET=xxxxx
LINE_CHANNEL_ACCESS_TOKEN=xxxxx
ANTHROPIC_API_KEY=xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

---

## 9. 実装ステップ

### Step 1：土台（DB + Webhook オウム返し）
**判断基準**：LINEでメッセージを送って、DBに保存され、同じ内容がLINEに返ってくればOK。

### Step 2：意図分類 + ルーティング
**判断基準**：「こんにちは」→ 雑談応答、「今日18万」→ sales_inputに分類される。

### Step 3：売上記録ハンドラー
**判断基準**：「今日18万52人」→ DBに保存 →「記録しました！今月累計○万円」が返る。

### Step 4：SNS投稿生成ハンドラー
**判断基準**：「今日のおすすめ投稿作って」→ 投稿案がFlex Messageで返る。

### Step 5：残りのハンドラー
- customer-note / customer-query
- inventory
- review-reply
- report-request（QuickChartグラフ付き）
- question（経営相談）

### Step 6：リッチメニュー + 通しテスト

---

## 10. 実装上の注意事項

### Claude API
- 意図分類：max_tokens: 20。カテゴリ名だけ返させる
- コンテンツ生成：max_tokens: 500。System Promptに店舗プロファイルを含める
- 構造化出力：JSONで返すよう指示し、パース失敗時は「すみません、うまく読み取れませんでした」と返す

### LINE Messaging API
- Webhookレスポンスは**200を即座に返す**。Claude APIの応答を待たない
- Reply TokenはWebhookイベントから取得。有効期限は約1分
- 期限切れの場合はPush Messageにフォールバック（月200通制限注意）

### データの扱い
- daily_sales：同日2回入力はUPSERT（上書き）
- customer_notes：customer_name + store_idでUPSERT。notesのJSONBにマージ

---

## 11. 将来の拡張に向けて意識すること

1. **store_idによる分離**：全テーブルにstore_idを持たせる
2. **sourceカラム**：daily_salesのsourceで`manual_line`/`pos_smaregi`を区別
3. **generated_contentsのstatus**：`draft`→`approved`→`posted`のフロー
4. **ハンドラーの分離**：意図分類→ハンドラー呼び出しのパターンを守る
5. **プロンプトの外出し**：`/lib/ai/prompts/`にファイル分離
