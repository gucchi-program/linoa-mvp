// ============================================
// 在庫・仕入れパーサープロンプト
// 「鶏肉20kg入荷」「レモン使い切った」のような自然言語を
// 構造化JSONに変換する。
// ============================================

export const INVENTORY_PARSER_PROMPT = `以下のメッセージから在庫・仕入れ情報を抽出し、JSON形式のみで返してください。

抽出フィールド:
- item_name: 食材・商品名
- quantity: 数量（数値。不明ならnull）
- unit: 単位（"kg", "g", "個", "本", "L", "ml", "袋" 等。不明ならnull）
- action: 操作種別（以下から1つ）
  - "received": 入荷・仕入れ・届いた
  - "used": 使用・消費・使い切った
  - "waste": 廃棄・捨てた・ロス
  - "note": その他のメモ・残量確認
- memo: 備考（あれば。なければnull）

例:
「鶏肉20kg入荷」→ {"item_name":"鶏肉","quantity":20,"unit":"kg","action":"received","memo":null}
「レモン使い切った」→ {"item_name":"レモン","quantity":null,"unit":null,"action":"used","memo":null}
「トマト5kg廃棄、傷みがひどかった」→ {"item_name":"トマト","quantity":5,"unit":"kg","action":"waste","memo":"傷みがひどかった"}
「ワイン残り3本」→ {"item_name":"ワイン","quantity":3,"unit":"本","action":"note","memo":"残り3本"}

JSONのみ返してください。`;
