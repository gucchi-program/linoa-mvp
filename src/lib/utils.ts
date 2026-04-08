// ============================================
// ユーティリティ関数
// ============================================

// 日本時間（JST）の今日の日付をYYYY-MM-DD形式で返す
// サーバーはUTCで動くため、+9時間して日本時間に変換する
export function getTodayJst(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().split("T")[0];
}

// YYYY-MM-DD形式の日付を「4月8日（火）」のような表示文字列に変換する
export function formatDateJa(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00+09:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
  const weekday = weekdays[date.getDay()];
  return `${month}月${day}日（${weekday}）`;
}

// 数値を「180,000円」のような日本語表示に変換する
export function formatCurrency(amount: number): string {
  return amount.toLocaleString("ja-JP") + "円";
}
