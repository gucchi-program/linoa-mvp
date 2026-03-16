// ============================================
// マニュアル登録セッション管理
// report-session.tsと同パターンでDBベースのセッション管理
// Webhookはステートレスなため、入力途中のデータをSupabaseで保持する
// ============================================

import {
  getActiveManualSession,
  createManualSession,
  updateManualSession,
  createManualPage,
  getManualPages,
  deleteManualPage,
} from "./db";
import type { ManualSession } from "@/types";

// 「マニュアル」を含むメッセージがトリガー
export function isManualTrigger(message: string): boolean {
  return message.includes("マニュアル");
}

// 「マニュアル登録」の開始
export async function startManualSession(storeId: string): Promise<string> {
  await createManualSession(storeId);
  return "マニュアルを登録します。\n\nまずタイトルを入力してください。\n例:「ホールの接客手順」「開店準備チェックリスト」";
}

// 「マニュアル一覧」の表示
export async function getManualListMessage(storeId: string): Promise<string> {
  const pages = await getManualPages(storeId);
  if (pages.length === 0) {
    return "まだマニュアルが登録されていません。\n「マニュアル登録」と送ると登録できます。";
  }

  const lines = pages.map((p, i) => `${i + 1}. ${p.title}`);
  return [
    `【登録済みマニュアル】`,
    ...lines,
    ``,
    `削除は「マニュアル削除 番号」で（例:「マニュアル削除 1」）`,
  ].join("\n");
}

// 「マニュアル削除 N」の処理
export async function deleteManualByIndex(storeId: string, indexStr: string): Promise<string> {
  const index = parseInt(indexStr, 10) - 1; // 1始まり → 0始まり
  if (isNaN(index) || index < 0) {
    return "削除する番号が正しくありません。「マニュアル削除 1」のように番号を指定してください。";
  }

  const pages = await getManualPages(storeId);
  if (index >= pages.length) {
    return `${index + 1}番のマニュアルは存在しません。\n「マニュアル一覧」で番号を確認してください。`;
  }

  const page = pages[index];
  await deleteManualPage(page.id);
  return `「${page.title}」を削除しました。`;
}

// アクティブなマニュアルセッションへの入力を処理
// セッションのstepに応じてタイトル → 内容の順に収集する
export async function processManualInput(
  session: ManualSession,
  userMessage: string
): Promise<{ message: string; done: boolean }> {
  if (session.step === "title") {
    // タイトルを保存 → 次は内容を聞く
    await updateManualSession(session.id, {
      title: userMessage,
      step: "content",
    });
    return {
      message: `タイトル「${userMessage}」を受け付けました。\n\n次に内容を入力してください。\n（手順、注意点、チェックリストなど、自由に書いてください）`,
      done: false,
    };
  }

  if (session.step === "content") {
    // 内容を保存 → マニュアルページ作成 → セッション完了
    const title = session.title ?? "（タイトルなし）";
    await createManualPage(session.store_id, title, userMessage);
    await updateManualSession(session.id, { status: "completed" });
    return {
      message: [
        `マニュアルを登録しました！`,
        ``,
        `📋 ${title}`,
        ``,
        `スタッフが「${title}はどうやるの？」と質問すると、Linoaが案内します。`,
        `「マニュアル一覧」で登録内容を確認できます。`,
      ].join("\n"),
      done: true,
    };
  }

  return { message: "エラーが発生しました。もう一度「マニュアル登録」から始めてください。", done: true };
}

// マニュアルセッションのキャンセル
export async function cancelManualSession(session: ManualSession): Promise<void> {
  await updateManualSession(session.id, { status: "cancelled" });
}

// アクティブセッションを取得（外部から参照用）
export { getActiveManualSession };
