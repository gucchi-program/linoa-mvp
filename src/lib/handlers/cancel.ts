// ============================================
// キャンセルハンドラー
// 「キャンセル」と送ると、直近のpending投稿を取り消す。
// ============================================

import { cancelLatestPendingContent } from "@/lib/db";
import type { Store } from "@/types";

export async function handleCancel(store: Store): Promise<string> {
  const cancelled = await cancelLatestPendingContent(store.id);

  if (cancelled) {
    return "投稿をキャンセルしました。\n投稿内容を変えたい場合は、もう一度写真を送ってください。";
  }

  return "キャンセルできる投稿が見つかりませんでした。\nすでに投稿済みか、時間が過ぎてしまったかもしれません。";
}
