// ============================================
// 共通ユーティリティ
// JST日付計算・日本語日付パーサー
// ============================================

export const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"] as const;

// 現在時刻をJST（UTC+9）に変換したDateを返す
export function getJstNow(): Date {
  return new Date(Date.now() + 9 * 60 * 60 * 1000);
}

// 現在のJST日付を "YYYY-MM-DD" 形式で返す
export function toJstDateString(): string {
  return getJstNow().toISOString().split("T")[0];
}

// 日本語日付表現を "YYYY-MM-DD" に変換する
// 対応形式: 「今日」「明日」「明後日」「N日後」「M/D」「M月D日」「YYYY-MM-DD」「月曜」〜「日曜」
export function parseJapaneseDate(input: string): string | null {
  const jstNow = getJstNow();

  if (input === "今日") return jstNow.toISOString().split("T")[0];
  if (input === "明日") {
    const t = new Date(jstNow); t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  }
  if (input === "明後日") {
    const t = new Date(jstNow); t.setDate(t.getDate() + 2);
    return t.toISOString().split("T")[0];
  }

  // 「N日後」
  const daysLaterMatch = input.match(/(\d+)\s*日\s*後/);
  if (daysLaterMatch) {
    const t = new Date(jstNow);
    t.setDate(t.getDate() + parseInt(daysLaterMatch[1]));
    return t.toISOString().split("T")[0];
  }

  // 「月曜」「火曜」等 → 次のその曜日
  const dowMatch = input.match(/^(月|火|水|木|金|土|日)曜?$/);
  if (dowMatch) {
    const targetDow = DAY_NAMES.indexOf(dowMatch[1] as typeof DAY_NAMES[number]);
    const currentDow = jstNow.getDay();
    let diff = targetDow - currentDow;
    if (diff <= 0) diff += 7;
    const t = new Date(jstNow);
    t.setDate(jstNow.getDate() + diff);
    return t.toISOString().split("T")[0];
  }

  // 「YYYY-MM-DD」
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  // 「M/D」「M月D日」（過去日付は来年扱い）
  const slashMatch = input.match(/^(\d{1,2})[/／](\d{1,2})$/);
  const jpMatch = input.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  const mdMatch = slashMatch ?? jpMatch;
  if (mdMatch) {
    const month = parseInt(mdMatch[1]);
    const day = parseInt(mdMatch[2]);
    let year = jstNow.getFullYear();
    const today = new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate());
    if (new Date(year, month - 1, day) < today) year += 1;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}
