// ============================================
// ハンドラールーティング
// 意図分類の結果（MessageIntent）を受け取り、対応するハンドラーに振り分ける。
// ============================================

import { handleCasual } from "./casual";
import { handleSalesInput } from "./sales-input";
import { handleSnsPost } from "./sns-post";
import { handleCustomerNote } from "./customer-note";
import { handleCustomerQuery } from "./customer-query";
import { handleInventory } from "./inventory";
import { handleReviewReply } from "./review-reply";
import { handleReportRequest } from "./report-request";
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

    case "customer_note":
      return text(await handleCustomerNote(store, message));

    case "customer_query":
      return text(await handleCustomerQuery(store, message));

    case "inventory":
      return text(await handleInventory(store, message));

    case "review_reply_request":
      return text(await handleReviewReply(store, message));

    case "report_request":
      return handleReportRequest(store, message);

    default:
      return text(await handleCasual(store, message));
  }
}
