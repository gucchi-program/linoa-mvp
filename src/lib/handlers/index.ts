// ============================================
// ハンドラールーティング
// 意図分類の結果（MessageIntent）を受け取り、対応するハンドラーに振り分ける。
//
// 戻り値はLineMessage[]（LINEメッセージの配列）。
// テキストのみのハンドラーはstringをLineMessage[]に変換して返す。
// Flex Messageを返すハンドラー（sns-post等）はそのまま返す。
// ============================================

import { handleCasual } from "./casual";
import { handleSalesInput } from "./sales-input";
import { handleSnsPost } from "./sns-post";
import type { Store, MessageIntent, LineMessage } from "@/types";

// text文字列をLINEメッセージ配列に変換するヘルパー
function text(content: string): LineMessage[] {
  return [{ type: "text", text: content }];
}

export async function routeToHandler(
  intent: MessageIntent,
  store: Store,
  message: string
): Promise<LineMessage[]> {
  switch (intent) {
    case "casual":
    case "question":
      return text(await handleCasual(store, message));

    case "sales_input":
      return text(await handleSalesInput(store, message));

    case "sns_post_request":
      return handleSnsPost(store, message);

    // Step 5で実装予定のハンドラー
    case "customer_note":
    case "customer_query":
    case "inventory":
    case "review_reply_request":
    case "report_request":
      return text("承りました（この機能は近日対応予定です）。");

    default:
      return text(await handleCasual(store, message));
  }
}
