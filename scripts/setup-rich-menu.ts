/**
 * LINEリッチメニュー設定スクリプト
 *
 * リッチメニューとは:
 * LINE公式アカウントのトーク画面下部に常時表示されるメニューボタン。
 * ユーザーがボタンをタップすると、設定したテキストが自動送信される。
 *
 * 画像は Next.js の API ルート `/api/richmenu/image` で動的生成する。
 * ローカル(dev) または 本番URLから画像を取得して LINE API にアップロードする。
 *
 * 実行方法:
 *   1) ローカルから:    npm run dev を起動 → npx tsx scripts/setup-rich-menu.ts
 *   2) 本番URLから:     RICHMENU_IMAGE_URL=https://app.li-noa.jp/api/richmenu/image npx tsx scripts/setup-rich-menu.ts
 *
 * 必要な環境変数:
 *   - LINE_CHANNEL_ACCESS_TOKEN
 *   - RICHMENU_IMAGE_URL（任意。未指定なら http://localhost:3000/api/richmenu/image）
 */

// Next.js の env loader を使って .env.local 等を自動読み込みする
// （npx tsx は通常 .env.local を読まないため明示的にロードする）
import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
if (!CHANNEL_ACCESS_TOKEN) {
  console.error("LINE_CHANNEL_ACCESS_TOKEN が設定されていません。.env.local を確認してください。");
  process.exit(1);
}

const IMAGE_URL = process.env.RICHMENU_IMAGE_URL ?? "http://localhost:3000/api/richmenu/image";
const API_BASE = "https://api.line.me/v2/bot";
const DATA_API_BASE = "https://api-data.line.me/v2/bot";

// LINE API共通ラッパー（JSON / 204対応）
async function lineApi(path: string, options: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API error ${res.status} (${path}): ${text}`);
  }
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return null;
}

async function fetchMenuImage(): Promise<Buffer> {
  console.log(`画像を取得中: ${IMAGE_URL}`);
  const res = await fetch(IMAGE_URL);
  if (!res.ok) {
    throw new Error(`画像取得失敗 ${res.status}: ${IMAGE_URL}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  console.log("リッチメニューを設定します...\n");

  // 1. 既存のデフォルトリッチメニューがあれば削除
  try {
    const existing = (await lineApi("/user/all/richmenu")) as { richMenuId?: string } | null;
    if (existing?.richMenuId) {
      console.log(`既存リッチメニューを削除: ${existing.richMenuId}`);
      await lineApi(`/richmenu/${existing.richMenuId}`, { method: "DELETE" });
    }
  } catch {
    // デフォルトが未設定の場合はエラーになるが想定内なので無視
  }

  // 2. リッチメニュー定義を作成
  // サイズは2500x843（コンパクト版）、3分割
  const sectionWidth = Math.floor(2500 / 3); // 833px ずつ
  const lastSectionWidth = 2500 - sectionWidth * 2; // 端数を最後のセクションに寄せる

  const menuData = {
    size: { width: 2500, height: 843 },
    selected: true, // 友だち追加直後にメニューが開いた状態にする
    name: "Linoa メインメニュー v3",
    chatBarText: "メニュー",
    areas: [
      {
        // 左: SNS投稿
        bounds: { x: 0, y: 0, width: sectionWidth, height: 843 },
        action: { type: "message", text: "Instagram投稿を作って" },
      },
      {
        // 中央: レポート
        bounds: { x: sectionWidth, y: 0, width: sectionWidth, height: 843 },
        action: { type: "message", text: "今月の売上どうだった？" },
      },
      {
        // 右: ヘルプ
        bounds: { x: sectionWidth * 2, y: 0, width: lastSectionWidth, height: 843 },
        action: { type: "message", text: "Linoaで何ができる？" },
      },
    ],
  };

  const createResult = (await lineApi("/richmenu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menuData),
  })) as { richMenuId: string };

  const richMenuId = createResult.richMenuId;
  console.log(`リッチメニュー作成: ${richMenuId}`);

  // 3. メニュー画像をアップロード
  const imageBuffer = await fetchMenuImage();

  const uploadRes = await fetch(`${DATA_API_BASE}/richmenu/${richMenuId}/content`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      "Content-Type": "image/png",
    },
    body: imageBuffer as unknown as BodyInit,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`画像アップロード失敗 ${uploadRes.status}: ${err}`);
  }
  console.log("メニュー画像アップロード完了");

  // 4. デフォルトメニューに設定（全ユーザー対象）
  await lineApi(`/user/all/richmenu/${richMenuId}`, { method: "POST" });
  console.log("デフォルトリッチメニューに設定完了");

  console.log("\nリッチメニュー設定が完了しました！");
  console.log("LINEトーク画面の下部にメニューが表示されます。");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
