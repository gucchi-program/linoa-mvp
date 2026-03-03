import type { ReportStep, ReportSession } from "@/types";
import {
  getActiveSession,
  createSession,
  updateSession,
  cancelStaleSession,
} from "./db";

// ============================================
// 各ステップの質問テキスト
// ============================================
const STEP_QUESTIONS: Record<ReportStep, string> = {
  customer_count: "本日の客数を教えてください（数字のみ）",
  revenue: "売上はいくらでしたか？（数字のみ・円単位）",
  reservation_count: "予約件数は何件でしたか？（数字のみ）",
  memo: "今日の所感を自由に書いてください",
  completed: "", // 使われない
};

// ステップの順序
const STEP_ORDER: ReportStep[] = [
  "customer_count",
  "revenue",
  "reservation_count",
  "memo",
  "completed",
];

// ============================================
// 数値入力のパース
// 全角数字・カンマ・「円」「人」「件」等の単位を除去して数値化
// ============================================
export function parseNumber(input: string): number | null {
  // 全角→半角変換
  let normalized = input.replace(/[０-９]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
  );
  // カンマ・スペース除去
  normalized = normalized.replace(/[,、\s]/g, "");
  // 末尾の単位除去（円、人、件、名、組 等）
  normalized = normalized.replace(/[円人件名組個万]$/g, "");

  // 「万」が途中にある場合（例: "12万" → 120000）
  const manMatch = input.match(/(\d+)\s*万/);
  if (manMatch) {
    return parseInt(manMatch[1], 10) * 10000;
  }

  const num = parseInt(normalized, 10);
  if (isNaN(num) || num < 0) return null;
  return num;
}

// ============================================
// キャンセルワード判定
// ============================================
const CANCEL_WORDS = ["キャンセル", "やめる", "中止", "やめ"];

export function isCancelWord(text: string): boolean {
  return CANCEL_WORDS.some((w) => text.trim() === w);
}

// ============================================
// 日報トリガー判定
// ============================================
export function isReportTrigger(text: string): boolean {
  return text.trim() === "日報";
}

// ============================================
// 次のステップを取得
// ============================================
function getNextStep(currentStep: ReportStep): ReportStep {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return STEP_ORDER[currentIndex + 1] || "completed";
}

// ============================================
// セッション開始
// 既存のアクティブセッションがあればキャンセルしてから新規作成
// ============================================
export async function startReportSession(
  storeId: string
): Promise<{ session: ReportSession; question: string }> {
  // 24時間超過セッションの自動キャンセル
  await cancelStaleSession(storeId);

  // 既存のアクティブセッションがあればキャンセル
  const existing = await getActiveSession(storeId);
  if (existing) {
    await updateSession(existing.id, { status: "cancelled" });
  }

  // 新規セッション作成
  const session = await createSession(storeId);
  const question = STEP_QUESTIONS[session.current_step];

  return { session, question };
}

// ============================================
// セッションにユーザー入力を処理
// 返り値: { done: false, question } → 次の質問
//         { done: true, session }   → 全入力完了
// ============================================
export type ProcessResult =
  | { done: false; question: string }
  | { done: true; session: ReportSession };

export async function processReportInput(
  session: ReportSession,
  userInput: string
): Promise<ProcessResult> {
  const step = session.current_step;

  // 数値ステップのバリデーションと保存
  if (step === "customer_count" || step === "revenue" || step === "reservation_count") {
    const num = parseNumber(userInput);
    if (num === null) {
      return {
        done: false,
        question: `数字で入力してください。\n${STEP_QUESTIONS[step]}`,
      };
    }

    const nextStep = getNextStep(step);
    const updated = await updateSession(session.id, {
      [step]: num,
      current_step: nextStep,
    });

    if (nextStep === "completed") {
      return { done: true, session: updated };
    }
    return { done: false, question: STEP_QUESTIONS[nextStep] };
  }

  // 所感ステップ（自由入力）
  if (step === "memo") {
    const updated = await updateSession(session.id, {
      memo: userInput,
      current_step: "completed",
      status: "completed",
    });
    return { done: true, session: updated };
  }

  // ここには到達しないはず
  return { done: false, question: STEP_QUESTIONS.customer_count };
}

// ============================================
// セッションキャンセル
// ============================================
export async function cancelReportSession(
  session: ReportSession
): Promise<void> {
  await updateSession(session.id, { status: "cancelled" });
}
