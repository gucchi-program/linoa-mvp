import { useState, useEffect } from "react";

// ============================================================
// 型定義
// ============================================================
type TabId = "sprints" | "todo" | "config" | "roadmap";

interface SprintFeature {
  text: string;
  done: boolean;
}

interface Sprint {
  id: number;
  name: string;
  status: "completed" | "in-progress" | "planned";
  date: string;
  features: SprintFeature[];
  migration?: string;
}

interface Todo {
  id: string;
  text: string;
  done: boolean;
  category: "deploy" | "feature" | "check" | "other";
  createdAt: string;
}

interface ConfigSection {
  id: string;
  category: string;
  title: string;
  content: string;
}

// ============================================================
// 初期データ
// ============================================================
const INITIAL_SPRINTS: Sprint[] = [
  {
    id: 1,
    name: "基盤構築",
    status: "completed",
    date: "2026-03-01",
    features: [
      { text: "Next.js + Supabase + LINE Webhook 初期構築", done: true },
      { text: "stores / daily_reports / conversations テーブル", done: true },
      { text: "友だち追加 → storeレコード作成", done: true },
    ],
    migration: "001_initial_schema.sql",
  },
  {
    id: 2,
    name: "日報入力フロー",
    status: "completed",
    date: "2026-03-03",
    features: [
      { text: "質問形式フロー（客数→売上→予約数→所感）", done: true },
      { text: "report_sessions テーブルで途中状態管理", done: true },
      { text: "Claude API 所感分析 + extracted_contexts 抽出", done: true },
      { text: "キャンセル / 24時間自動キャンセル", done: true },
    ],
    migration: "002_sprint2_report_flow.sql",
  },
  {
    id: 3,
    name: "オンボーディング",
    status: "completed",
    date: "2026-03-05",
    features: [
      { text: "5項目質問形式（店名→オーナー名→業態→席数→営業時間）", done: true },
      { text: "stores.onboarding_step カラム追加", done: true },
      { text: "新規 / 再追加完了済み / 再追加途中の3パターン分岐", done: true },
    ],
    migration: "003_onboarding_step.sql",
  },
  {
    id: 4,
    name: "オーナー分離 + ダッシュボード",
    status: "completed",
    date: "2026-03-06",
    features: [
      { text: "owners テーブル新設（1オーナー複数店舗）", done: true },
      { text: "dashboard_tokens（24時間有効ワンタイムURL）", done: true },
      { text: "売上棒グラフ / 客数折れ線 / 日報一覧（Recharts）", done: true },
      { text: "/dashboard → 店舗選択 / /dashboard/[storeId]", done: true },
    ],
    migration: "004_owners_and_dashboard.sql",
  },
  {
    id: 5,
    name: "LP + SEO + リッチメニュー + Cron",
    status: "completed",
    date: "2026-03-07",
    features: [
      { text: "ランディングページ（8セクション）", done: true },
      { text: "OGP / JSON-LD / sitemap.xml / robots.txt", done: true },
      { text: "リッチメニュー2ボタン（日報入力 / レポート）", done: true },
      { text: "天候自動取得（Open-Meteo API）", done: true },
      { text: "日報リマインダー Cron（毎日20:00）", done: true },
      { text: "AI週次レポート Cron（月曜9:00）", done: true },
    ],
  },
  {
    id: 6,
    name: "SNS/POP生成 + 賞味期限管理",
    status: "completed",
    date: "2026-03-10",
    features: [
      { text: "SNS投稿文生成（Instagram / X）", done: true },
      { text: "POP画像生成（satori）", done: true },
      { text: "リッチメニュー3ボタン化（+SNS）", done: true },
      { text: "自然言語対話（AI秘書フリーチャット）", done: true },
      { text: "賞味期限管理（登録・一覧・期限前アラート）", done: true },
      { text: "賞味期限アラート Cron（毎日9:00）", done: true },
    ],
    migration: "005_expiry_items.sql",
  },
  {
    id: 7,
    name: "ダッシュボード強化 + シフト管理 + AI施策提案",
    status: "completed",
    date: "2026-03-12",
    features: [
      { text: "期間切替 / 前週比% / 曜日別分析 / 天候×売上相関", done: true },
      { text: "AI施策提案プッシュ通知（水・金12:00）", done: true },
      { text: "シフト管理（スタッフ登録・シフト登録・確認）", done: true },
    ],
    migration: "006_shifts.sql",
  },
  {
    id: 8,
    name: "本部ダッシュボード + 需要予測 + マニュアルbot",
    status: "completed",
    date: "2026-03-16",
    features: [
      { text: "本部ダッシュボード（全店舗横断比較）", done: true },
      { text: "需要予測・仕入れアドバイス（Claude）", done: true },
      { text: "マニュアルbot（登録・一覧・削除・QA）", done: true },
    ],
    migration: "007_sprint8.sql",
  },
  {
    id: 9,
    name: "POS連携（スマレジ）",
    status: "planned",
    date: "未定",
    features: [
      { text: "スマレジ OAuth 2.0 連携", done: false },
      { text: "売上・客数の自動取得（手入力を廃止）", done: false },
      { text: "商品別売上データでメニュー分析", done: false },
    ],
  },
  {
    id: 10,
    name: "口コミ自動返信 + 予約管理",
    status: "planned",
    date: "未定",
    features: [
      { text: "Google Maps 口コミ返信の自動生成", done: false },
      { text: "LINE経由の予約管理", done: false },
      { text: "Googleビジネスプロフィール更新", done: false },
    ],
  },
  {
    id: 11,
    name: "会計・労務連携",
    status: "planned",
    date: "未定",
    features: [
      { text: "freee / マネーフォワード連携", done: false },
      { text: "シフト→実績→給与計算", done: false },
      { text: "確定申告サポート", done: false },
    ],
  },
];

const INITIAL_CONFIGS: ConfigSection[] = [
  {
    id: "deploy",
    category: "デプロイ",
    title: "デプロイ手順",
    content: `# ローカルでコミット・プッシュ
git add <files>
git commit -m "feat: ..."
git push origin main

# VSSHで接続してpm2再起動
ssh conoha-linoa
cd ~/linoa-mvp
git pull
npm install
npm run build
pm2 restart linoa

# または1コマンドで
ssh conoha-linoa "cd ~/linoa-mvp && git pull && npm install && npm run build && pm2 restart linoa"`,
  },
  {
    id: "vps",
    category: "サーバー",
    title: "VPS / サーバー情報",
    content: `プロバイダ: ConoHa VPS
IPアドレス: 163.44.122.170
ドメイン: li-noa.jp（SSL対応済み）
SSH: ssh conoha-linoa（~/.ssh/configにエイリアス設定済み）
pm2プロセス名: linoa
プロセス確認: pm2 list
ログ確認: pm2 logs linoa`,
  },
  {
    id: "db",
    category: "データベース",
    title: "Supabase / DB",
    content: `Supabase Studio: https://supabase.com/dashboard
プロジェクト名: linoa-mvp

マイグレーション適用方法:
→ Supabase Studio > SQL Editor > 該当ファイルを貼り付けて実行

マイグレーションファイル一覧:
001_initial_schema.sql    ← stores / daily_reports 等
002_sprint2_report_flow.sql ← report_sessions
003_onboarding_step.sql   ← stores.onboarding_step
004_owners_and_dashboard.sql ← owners / dashboard_tokens
005_expiry_items.sql      ← expiry_items
006_shifts.sql            ← staff / shifts
007_sprint8.sql           ← manual_pages / manual_sessions`,
  },
  {
    id: "line",
    category: "LINE",
    title: "LINE設定",
    content: `LINE Official Account: @472wtopo
Webhook URL: https://li-noa.jp/api/webhook/line
  → LINE Developersコンソールで設定
  → 署名検証: HMAC-SHA256（LINE_CHANNEL_SECRET）

リッチメニュー:
  → 設定スクリプト: scripts/setup-richmenu.ts
  → npm run setup:richmenu で再設定可能
  → 現在: 3ボタン（日報入力 / SNS投稿文 / レポート）

Cron（VPS crontab -e で確認）:
  毎日20:00 JST  → /api/cron/reminder（日報リマインダー）
  月曜 9:00 JST  → /api/cron/weekly-report（週次レポート）
  毎日 9:00 JST  → /api/cron/expiry-alert（賞味期限アラート）
  水・金 12:00   → /api/cron/suggestion（AI施策提案）`,
  },
  {
    id: "envvars",
    category: "環境変数",
    title: "環境変数一覧（.env.local）",
    content: `# LINE
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Anthropic
ANTHROPIC_API_KEY=...

# アプリURL
NEXT_PUBLIC_APP_URL=https://li-noa.jp

# GA4（任意）
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Cron認証
CRON_SECRET=...`,
  },
  {
    id: "ga",
    category: "アナリティクス",
    title: "GA4 / Search Console",
    content: `Google Analytics:
  → GA4プロパティを作成して計測ID（G-XXXXXXXXXX）を取得
  → VPSの.env.localにGA_MEASUREMENT_ID=G-XXXXXXを追加
  → pm2 restart linoa

Google Search Console:
  → DNS TXTレコード（google-site-verification）設定済み
  → Search Consoleで「確認」ボタンを押す
  → サイトマップ: https://li-noa.jp/sitemap.xml を送信`,
  },
];

const ROADMAP_ITEMS = [
  {
    year: "Year 1",
    subtitle: "「便利なLINE Bot」→「AI秘書」",
    color: "#6366f1",
    quarters: [
      {
        q: "Q1 (Month 1-3)",
        title: "業務効率化で入り込む",
        items: ["ダッシュボード + リッチメニュー + 天候API", "賞味期限管理（写真+テキスト→アラート）", "シフト管理（簡易版）"],
        done: true,
      },
      {
        q: "Q2 (Month 4-6)",
        title: "AI秘書が目覚める",
        items: ["AI週次レポート配信", "AI施策提案", "自然言語対話"],
        done: true,
      },
      {
        q: "Q3 (Month 7-9)",
        title: "提案→実行の一気通貫",
        items: ["SNS投稿生成", "店内POP・メニュー表生成", "コンテンツ生成エンジン統合"],
        done: true,
      },
      {
        q: "Q4 (Month 10-12)",
        title: "磨き込み + 拡張",
        items: ["口コミ自動返信", "新人教育マニュアルbot ✅ (Sprint 8)", "予約管理（LINE経由）"],
        done: false,
      },
    ],
  },
  {
    year: "Year 2",
    subtitle: "「AI秘書」→「経営パートナー」",
    color: "#10b981",
    quarters: [
      {
        q: "Q1 (Month 13-15)",
        title: "POS連携で手入力を解放",
        items: ["スマレジAPI連携", "Square API連携", "日報の売上・客数が自動入力"],
        done: false,
      },
      {
        q: "Q2 (Month 16-18)",
        title: "マルチ店舗対応",
        items: ["本部ダッシュボード ✅ (Sprint 8)", "店舗間ベンチマーク", "3〜10店舗のミニチェーンへ拡大"],
        done: false,
      },
      {
        q: "Q3 (Month 19-21)",
        title: "仕入れ最適化",
        items: ["需要予測 ✅ (Sprint 8)", "仕入れ量の自動提案", "仕入れ業者連携"],
        done: false,
      },
      {
        q: "Q4 (Month 22-24)",
        title: "会計・労務連携",
        items: ["freee / マネーフォワード連携", "勤怠管理（シフト→給与計算）", "確定申告サポート"],
        done: false,
      },
    ],
  },
  {
    year: "Year 3",
    subtitle: "「経営パートナー」→「業界インフラ」",
    color: "#f59e0b",
    quarters: [
      {
        q: "Q1-Q2 (Month 25-30)",
        title: "業界データの力",
        items: ["匿名化した業界ベンチマーク提供", "食材価格トレンド分析", "成功パターンのAI学習"],
        done: false,
      },
      {
        q: "Q3-Q4 (Month 31-36)",
        title: "エコシステム",
        items: ["Linoa API公開", "Airレジ連携（交渉）", "デリバリー連携（Uber Eats / 出前館）", "目標: 1,000店舗超"],
        done: false,
      },
    ],
  },
];

const CATEGORY_COLORS: Record<Todo["category"], string> = {
  deploy: "#6366f1",
  feature: "#10b981",
  check: "#f59e0b",
  other: "#6b7280",
};

const CATEGORY_LABELS: Record<Todo["category"], string> = {
  deploy: "デプロイ",
  feature: "機能",
  check: "確認",
  other: "その他",
};

// ============================================================
// ユーティリティ
// ============================================================
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ============================================================
// メインApp
// ============================================================
export default function App() {
  const [tab, setTab] = useState<TabId>("sprints");
  const [todos, setTodos] = useState<Todo[]>(() =>
    loadFromStorage("linoa_todos", [
      { id: "1", text: "GA4プロパティ作成 → 計測IDをVPSの.env.localに追加", done: false, category: "deploy", createdAt: new Date().toISOString() },
      { id: "2", text: "Search Console で「確認」ボタンを押す → サイトマップ送信", done: false, category: "check", createdAt: new Date().toISOString() },
      { id: "3", text: "X / note でローンチ告知（docs/launch-posts.mdにドラフトあり）", done: false, category: "other", createdAt: new Date().toISOString() },
      { id: "4", text: "リッチメニュー動作確認（3ボタンが表示されているか）", done: false, category: "check", createdAt: new Date().toISOString() },
    ])
  );
  const [newTodoText, setNewTodoText] = useState("");
  const [newTodoCategory, setNewTodoCategory] = useState<Todo["category"]>("other");
  const [expandedSprint, setExpandedSprint] = useState<number | null>(8);
  const [expandedConfig, setExpandedConfig] = useState<string | null>("deploy");

  useEffect(() => {
    saveToStorage("linoa_todos", todos);
  }, [todos]);

  const completedSprints = INITIAL_SPRINTS.filter((s) => s.status === "completed").length;
  const totalSprints = INITIAL_SPRINTS.length;
  const pendingTodos = todos.filter((t) => !t.done).length;

  function addTodo() {
    if (!newTodoText.trim()) return;
    setTodos((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        done: false,
        category: newTodoCategory,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewTodoText("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const tabs: { id: TabId; label: string; badge?: number }[] = [
    { id: "sprints", label: "スプリント", badge: completedSprints },
    { id: "todo", label: "TODO", badge: pendingTodos > 0 ? pendingTodos : undefined },
    { id: "config", label: "設定メモ" },
    { id: "roadmap", label: "ロードマップ" },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <span className="header-logo">Linoa</span>
            <span className="header-subtitle">開発ボード</span>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-value">{completedSprints}</span>
              <span className="stat-label">Sprint完了</span>
            </div>
            <div className="stat">
              <span className="stat-value">{pendingTodos}</span>
              <span className="stat-label">TODO残り</span>
            </div>
            <div className="stat">
              <span className="stat-value">{Math.round((completedSprints / totalSprints) * 100)}%</span>
              <span className="stat-label">進捗</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="tab-badge">{t.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <main className="main">
        {tab === "sprints" && (
          <SprintsTab
            sprints={INITIAL_SPRINTS}
            expanded={expandedSprint}
            onToggle={(id) => setExpandedSprint((prev) => (prev === id ? null : id))}
          />
        )}
        {tab === "todo" && (
          <TodoTab
            todos={todos}
            newText={newTodoText}
            newCategory={newTodoCategory}
            onNewText={setNewTodoText}
            onNewCategory={setNewTodoCategory}
            onAdd={addTodo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        )}
        {tab === "config" && (
          <ConfigTab
            configs={INITIAL_CONFIGS}
            expanded={expandedConfig}
            onToggle={(id) => setExpandedConfig((prev) => (prev === id ? null : id))}
          />
        )}
        {tab === "roadmap" && <RoadmapTab />}
      </main>
    </div>
  );
}

// ============================================================
// スプリントタブ
// ============================================================
function SprintsTab({
  sprints,
  expanded,
  onToggle,
}: {
  sprints: Sprint[];
  expanded: number | null;
  onToggle: (id: number) => void;
}) {
  const completedCount = sprints.filter((s) => s.status === "completed").length;

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>スプリント一覧</h2>
        <span className="badge-completed">{completedCount} / {sprints.length} 完了</span>
      </div>

      <div className="progress-bar-wrap">
        <div
          className="progress-bar"
          style={{ width: `${(completedCount / sprints.length) * 100}%` }}
        />
      </div>

      <div className="sprint-list">
        {sprints.map((sprint) => (
          <div
            key={sprint.id}
            className={`sprint-card ${sprint.status}`}
            onClick={() => onToggle(sprint.id)}
          >
            <div className="sprint-card-header">
              <div className="sprint-card-left">
                <span className={`sprint-status-dot ${sprint.status}`} />
                <span className="sprint-num">Sprint {sprint.id}</span>
                <span className="sprint-name">{sprint.name}</span>
              </div>
              <div className="sprint-card-right">
                {sprint.migration && (
                  <code className="migration-tag">{sprint.migration}</code>
                )}
                <span className="sprint-date">{sprint.date}</span>
                <span className={`sprint-badge ${sprint.status}`}>
                  {sprint.status === "completed" ? "完了" : sprint.status === "in-progress" ? "進行中" : "予定"}
                </span>
                <span className="expand-icon">{expanded === sprint.id ? "▲" : "▼"}</span>
              </div>
            </div>
            {expanded === sprint.id && (
              <div className="sprint-features">
                {sprint.features.map((f, i) => (
                  <div key={i} className="feature-item">
                    <span className={`feature-check ${f.done ? "done" : ""}`}>
                      {f.done ? "✓" : "○"}
                    </span>
                    <span className="feature-text">{f.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TODOタブ
// ============================================================
function TodoTab({
  todos,
  newText,
  newCategory,
  onNewText,
  onNewCategory,
  onAdd,
  onToggle,
  onDelete,
}: {
  todos: Todo[];
  newText: string;
  newCategory: Todo["category"];
  onNewText: (v: string) => void;
  onNewCategory: (v: Todo["category"]) => void;
  onAdd: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const pending = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>TODO</h2>
        <span className="badge-pending">{pending.length}件 残り</span>
      </div>

      <div className="todo-input-row">
        <select
          className="todo-category-select"
          value={newCategory}
          onChange={(e) => onNewCategory(e.target.value as Todo["category"])}
        >
          {(Object.keys(CATEGORY_LABELS) as Todo["category"][]).map((k) => (
            <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
          ))}
        </select>
        <input
          className="todo-input"
          placeholder="新しいTODOを追加..."
          value={newText}
          onChange={(e) => onNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
        />
        <button className="todo-add-btn" onClick={onAdd}>追加</button>
      </div>

      <div className="todo-list">
        {pending.map((t) => (
          <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </div>

      {done.length > 0 && (
        <>
          <div className="done-separator">完了済み（{done.length}件）</div>
          <div className="todo-list done-list">
            {done.map((t) => (
              <TodoItem key={t.id} todo={t} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TodoItem({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`todo-item ${todo.done ? "done" : ""}`}>
      <button className="todo-check" onClick={() => onToggle(todo.id)}>
        {todo.done ? "✓" : ""}
      </button>
      <span
        className="todo-category-dot"
        style={{ background: CATEGORY_COLORS[todo.category] }}
        title={CATEGORY_LABELS[todo.category]}
      />
      <span className="todo-text">{todo.text}</span>
      <button className="todo-delete" onClick={() => onDelete(todo.id)}>×</button>
    </div>
  );
}

// ============================================================
// 設定メモタブ
// ============================================================
function ConfigTab({
  configs,
  expanded,
  onToggle,
}: {
  configs: ConfigSection[];
  expanded: string | null;
  onToggle: (id: string) => void;
}) {
  const categories = [...new Set(configs.map((c) => c.category))];

  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>設定メモ</h2>
        <span className="section-note">デプロイ方法・環境変数・各種設定リファレンス</span>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="config-group">
          <div className="config-group-title">{cat}</div>
          {configs.filter((c) => c.category === cat).map((config) => (
            <div key={config.id} className="config-card">
              <button
                className="config-card-header"
                onClick={() => onToggle(config.id)}
              >
                <span className="config-title">{config.title}</span>
                <span className="expand-icon">{expanded === config.id ? "▲" : "▼"}</span>
              </button>
              {expanded === config.id && (
                <pre className="config-content">{config.content}</pre>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// ロードマップタブ
// ============================================================
function RoadmapTab() {
  return (
    <div className="tab-content">
      <div className="section-header">
        <h2>3年ロードマップ</h2>
        <span className="section-note">業務効率化 → AI秘書 → 業界インフラ</span>
      </div>

      <div className="roadmap-concept">
        <div className="concept-item">
          <span className="concept-label">既存SaaS</span>
          <span className="concept-arrow">データ → 分析 → <strong>表示（ここで終わり）</strong></span>
        </div>
        <div className="concept-item">
          <span className="concept-label concept-linoa">Linoa</span>
          <span className="concept-arrow">データ → 分析 → 提案 → <strong>実行支援（ここまでやる）</strong></span>
        </div>
      </div>

      {ROADMAP_ITEMS.map((year) => (
        <div key={year.year} className="roadmap-year">
          <div className="roadmap-year-header" style={{ borderColor: year.color }}>
            <span className="roadmap-year-label" style={{ color: year.color }}>{year.year}</span>
            <span className="roadmap-year-subtitle">{year.subtitle}</span>
          </div>
          <div className="roadmap-quarters">
            {year.quarters.map((q) => (
              <div key={q.q} className={`roadmap-quarter ${q.done ? "done" : ""}`}>
                <div className="quarter-header">
                  <span className="quarter-period">{q.q}</span>
                  <span className="quarter-title">{q.title}</span>
                  {q.done && <span className="quarter-done-badge">完了</span>}
                </div>
                <ul className="quarter-items">
                  {q.items.map((item, i) => (
                    <li key={i} className="quarter-item">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="roadmap-targets">
        <div className="target-item">
          <span className="target-year">Year 1</span>
          <span className="target-text">テスト店舗 3〜5店 → 有料β → 30〜50店舗</span>
        </div>
        <div className="target-item">
          <span className="target-year">Year 2</span>
          <span className="target-text">200〜500店舗 / シリーズA水準</span>
        </div>
        <div className="target-item">
          <span className="target-year">Year 3</span>
          <span className="target-text">1,000店舗超 / 業界インフラ化</span>
        </div>
      </div>
    </div>
  );
}
