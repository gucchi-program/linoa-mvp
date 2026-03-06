/**
 * LINEリッチメニュー設定スクリプト
 *
 * リッチメニューとは:
 * LINE公式アカウントのトーク画面下部に常時表示されるメニューボタン。
 * ユーザーがボタンをタップすると、設定したテキストが自動送信される。
 * これにより「日報」と手打ちする必要がなくなり、UXが大幅に向上する。
 *
 * 実行方法: npx tsx scripts/setup-rich-menu.ts
 *
 * API仕様:
 * 1. リッチメニューオブジェクトを作成（JSON定義）
 * 2. メニュー画像をアップロード（1つの画像を領域分割して各ボタンに割り当て）
 * 3. デフォルトメニューとして設定（全ユーザーに適用）
 *
 * 今回は画像なしで、テキストベースのリッチメニューを作成する。
 * 画像は2500x1686pxまたは2500x843pxが必要だが、
 * Canvasでプログラム生成する（node-canvasは不要、APIで直接PNG生成）
 */

const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!;
const API_BASE = "https://api.line.me/v2/bot";

async function lineApi(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE API error ${res.status}: ${text}`);
  }
  // 204 No Content の場合はnullを返す
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return null;
}

// リッチメニュー画像をプログラムで生成（2500x843px）
// 左半分: 「日報入力」、右半分: 「レポート」
function createMenuImage(): Buffer {
  // 最小限のPNG生成（ヘッダー情報のみ）は難しいので、
  // 代わりに1x1のPNGからスケーリングするアプローチを取る
  // → 実際にはLINE APIは最低限の画像が必要なので、
  //   BMP形式で簡易生成する

  const width = 2500;
  const height = 843;

  // PPM形式（非圧縮画像）で生成してからPNGに変換...
  // → 外部ライブラリなしでは困難なので、別アプローチを使う

  // 代替案: JPEG形式の最小画像を生成
  // 実際のデザインはLINE側のテキストラベルで表示するため、
  // 背景色のみの画像で十分

  // 2色の背景を持つBMP画像を生成
  return createBmpImage(width, height);
}

function createBmpImage(width: number, height: number): Buffer {
  // BMP形式: ヘッダー(54bytes) + ピクセルデータ
  // 各行は4バイト境界にパディング
  const bytesPerPixel = 3;
  const rowSize = Math.ceil((width * bytesPerPixel) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;

  const buffer = Buffer.alloc(fileSize);

  // BMP File Header (14 bytes)
  buffer.write("BM", 0);
  buffer.writeUInt32LE(fileSize, 2);
  buffer.writeUInt32LE(0, 6); // reserved
  buffer.writeUInt32LE(54, 10); // pixel data offset

  // DIB Header (40 bytes)
  buffer.writeUInt32LE(40, 14); // header size
  buffer.writeInt32LE(width, 18);
  buffer.writeInt32LE(height, 22); // positive = bottom-up
  buffer.writeUInt16LE(1, 26); // color planes
  buffer.writeUInt16LE(24, 28); // bits per pixel
  buffer.writeUInt32LE(0, 30); // no compression
  buffer.writeUInt32LE(pixelDataSize, 34);
  buffer.writeUInt32LE(2835, 38); // horizontal resolution
  buffer.writeUInt32LE(2835, 42); // vertical resolution
  buffer.writeUInt32LE(0, 46); // colors in palette
  buffer.writeUInt32LE(0, 50); // important colors

  // ピクセルデータ（BMPは下から上に格納）
  // 左半分: インディゴ (#4F46E5) → BGR: 0xE5, 0x46, 0x4F
  // 右半分: LINE緑 (#06C755) → BGR: 0x55, 0xC7, 0x06
  const halfWidth = Math.floor(width / 2);

  for (let y = 0; y < height; y++) {
    const rowOffset = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + x * 3;
      if (x < halfWidth) {
        // 左: インディゴ（BGR）
        buffer[pixelOffset] = 0xe5;
        buffer[pixelOffset + 1] = 0x46;
        buffer[pixelOffset + 2] = 0x4f;
      } else {
        // 右: LINE緑（BGR）
        buffer[pixelOffset] = 0x55;
        buffer[pixelOffset + 1] = 0xc7;
        buffer[pixelOffset + 2] = 0x06;
      }
    }
  }

  return buffer;
}

async function main() {
  console.log("リッチメニューを設定します...\n");

  // 1. 既存のデフォルトリッチメニューを確認・削除
  try {
    const defaultMenu = await lineApi("/user/all/richmenu");
    if (defaultMenu?.richMenuId) {
      console.log(`既存リッチメニューを削除: ${defaultMenu.richMenuId}`);
      await lineApi(`/richmenu/${defaultMenu.richMenuId}`, { method: "DELETE" });
    }
  } catch {
    // デフォルトが未設定の場合はエラーになるが無視
  }

  // 2. リッチメニュー作成
  // サイズは2500x843（コンパクト版）、左右2分割
  const menuData = {
    size: { width: 2500, height: 843 },
    selected: true, // デフォルトで開いた状態
    name: "Linoa メインメニュー",
    chatBarText: "メニュー",
    areas: [
      {
        // 左半分: 日報入力
        bounds: { x: 0, y: 0, width: 1250, height: 843 },
        action: { type: "message", text: "日報" },
      },
      {
        // 右半分: レポート表示
        bounds: { x: 1250, y: 0, width: 1250, height: 843 },
        action: { type: "message", text: "レポート" },
      },
    ],
  };

  const createResult = await lineApi("/richmenu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(menuData),
  });

  const richMenuId = createResult.richMenuId;
  console.log(`リッチメニュー作成: ${richMenuId}`);

  // 3. メニュー画像をアップロード
  // LINE APIはJPEG/PNGを受け付ける。BMPは非対応なので、
  // 最小限のPNG画像を手動で生成する
  const imageBuffer = createSimplePng(2500, 843);

  const uploadRes = await fetch(
    `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        "Content-Type": "image/png",
      },
      body: imageBuffer,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    throw new Error(`画像アップロード失敗: ${err}`);
  }
  console.log("メニュー画像アップロード完了");

  // 4. デフォルトリッチメニューに設定（全ユーザーに適用）
  await lineApi(`/user/all/richmenu/${richMenuId}`, { method: "POST" });
  console.log("デフォルトリッチメニューに設定完了");

  console.log("\nリッチメニュー設定が完了しました！");
  console.log("LINEトーク画面の下部にメニューが表示されます。");
}

// 非圧縮PNG画像を生成する関数
// zlib不要で、2色の背景（左:インディゴ、右:LINE緑）のPNGを生成
function createSimplePng(width: number, height: number): Buffer {
  // PNGは圧縮が必須だが、store(無圧縮)モードのdeflateブロックを使える
  // 各行: フィルタバイト(0x00) + RGB*width = 1 + 3*width bytes
  const rowBytes = 1 + width * 3;
  const rawData = Buffer.alloc(rowBytes * height);

  const halfWidth = Math.floor(width / 2);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // フィルタなし

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      if (x < halfWidth) {
        // 左: インディゴ (#4F46E5)
        rawData[pixelOffset] = 0x4f;
        rawData[pixelOffset + 1] = 0x46;
        rawData[pixelOffset + 2] = 0xe5;
      } else {
        // 右: LINE緑 (#06C755)
        rawData[pixelOffset] = 0x06;
        rawData[pixelOffset + 1] = 0xc7;
        rawData[pixelOffset + 2] = 0x55;
      }
    }
  }

  // zlibのstoreモードで圧縮（実質無圧縮）
  const zlib = require("zlib");
  const compressed = zlib.deflateSync(rawData, { level: 0 });

  // PNGファイル構築
  const chunks: Buffer[] = [];

  // PNGシグネチャ
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR チャンク
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(createPngChunk("IHDR", ihdr));

  // IDAT チャンク（圧縮済みピクセルデータ）
  chunks.push(createPngChunk("IDAT", compressed));

  // IEND チャンク
  chunks.push(createPngChunk("IEND", Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function createPngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuffer, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([length, typeBuffer, data, crc]);
}

// CRC32計算（PNG仕様準拠）
function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crc ^ data[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

main().catch(console.error);
