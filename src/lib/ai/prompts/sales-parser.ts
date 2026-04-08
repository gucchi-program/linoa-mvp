// ============================================
// 売上パーサープロンプト
// 「今日18万52人」のような自然言語を構造化JSONに変換する。
// Claudeに max_tokens: 200 で返させ、JSON.parseする。
// パース失敗時はハンドラー側でエラーメッセージを返す。
// ============================================

export function buildSalesParserPrompt(today: string): string {
  return `以下のメッセージから売上情報を抽出し、JSON形式のみで返してください。

抽出フィールド:
- revenue: 売上金額（円、整数）。「18万」→180000、「1.5万」→15000
- customer_count: 客数（整数）。不明ならnull
- date: 日付（YYYY-MM-DD形式）。「今日」→${today}、「昨日」→前日、日付が明記されていれば変換
- memo: 売上以外のメモ（あれば文字列、なければnull）

今日の日付: ${today}

返答例:
「今日18万52人」→ {"revenue":180000,"customer_count":52,"date":"${today}","memo":null}
「昨日の売上15万、雨で少なかった」→ {"revenue":150000,"customer_count":null,"date":"前日のYYYY-MM-DD","memo":"雨で少なかった"}
「売上20万円、客数35人、常連多かった」→ {"revenue":200000,"customer_count":35,"date":"${today}","memo":"常連多かった"}

JSONのみ返してください。コードブロックや説明文は不要です。`;
}
