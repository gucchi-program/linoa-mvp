// ============================================
// ハンドラールーティング
// 意図分類の結果（MessageIntent）を受け取り、対応するハンドラーに振り分ける。
// Step 3以降で各ハンドラーを実装していく。
// 未実装のintentは一時的に「準備中」メッセージを返す。
// ============================================

import { handleCasual } from "./casual";
import { handleSalesInput } from "./sales-input";
import type { Store, MessageIntent } from "@/types";

export async function routeToHandler(
  intent: MessageIntent,
  store: Store,
  message: string
): Promise<string> {
  switch (intent) {
    case "casual":
    case "question":
      // questionもcasualと同じハンドラーで処理（Step 5で専用ハンドラーに分離）
      return handleCasual(store, message);

    case "sales_input":
      return handleSalesInput(store, message);

    // Step 4以降で実装予定のハンドラー
    case "customer_note":
    case "customer_query":
    case "inventory":
    case "sns_post_request":
    case "review_reply_request":
    case "report_request":
      return `承りました（この機能は近日対応予定です）。`;

    default:
      return handleCasual(store, message);
  }
}
