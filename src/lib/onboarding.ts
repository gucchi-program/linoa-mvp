import type { OnboardingStep, Store } from "@/types";
import { updateStore } from "./db";
import { parseNumber } from "./report-session";

// ============================================
// 各ステップの質問テキスト
// ============================================
const STEP_QUESTIONS: Record<OnboardingStep, string> = {
  store_name: "お店の名前を教えてください",
  owner_name: "オーナー様のお名前を教えてください",
  genre: "業態・ジャンルを教えてください（例: 居酒屋、カフェ、ラーメン）",
  seat_count: "座席数は何席ですか？（数字のみ）",
  opening_hours: "営業時間を教えてください（例: 17:00〜23:00）",
  completed: "", // 使われない
};

// ステップの順序
const STEP_ORDER: OnboardingStep[] = [
  "store_name",
  "owner_name",
  "genre",
  "seat_count",
  "opening_hours",
  "completed",
];

// 各ステップで更新するstoresのカラム名
// OnboardingStepとStoreのカラム名が一致しているのでそのまま使える
const STEP_TO_COLUMN: Record<Exclude<OnboardingStep, "completed">, keyof Store> = {
  store_name: "store_name",
  owner_name: "owner_name",
  genre: "genre",
  seat_count: "seat_count",
  opening_hours: "opening_hours",
};

// ============================================
// 次のステップを取得
// ============================================
function getNextStep(currentStep: OnboardingStep): OnboardingStep {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  return STEP_ORDER[currentIndex + 1] || "completed";
}

// ============================================
// 現在のステップの質問テキストを返す
// ============================================
export function getOnboardingQuestion(step: OnboardingStep): string {
  return STEP_QUESTIONS[step];
}

// ============================================
// オンボーディング入力処理
// ユーザー入力を受けて、storesの該当カラムを更新し次のステップへ遷移
//
// 返り値:
//   done: false → 次の質問テキスト付き
//   done: true  → 完了メッセージ付き
// ============================================
export type OnboardingResult =
  | { done: false; message: string }
  | { done: true; message: string };

export async function processOnboardingInput(
  store: Store,
  userInput: string
): Promise<OnboardingResult> {
  const step = store.onboarding_step;

  // completedの場合は来ないはずだが念のため
  if (step === "completed") {
    return { done: true, message: "" };
  }

  // seat_countは数値バリデーション
  if (step === "seat_count") {
    const num = parseNumber(userInput);
    if (num === null) {
      return {
        done: false,
        message: `数字で入力してください。\n${STEP_QUESTIONS[step]}`,
      };
    }

    const nextStep = getNextStep(step);
    await updateStore(store.id, {
      seat_count: num,
      onboarding_step: nextStep,
    });

    if (nextStep === "completed") {
      return buildCompletionResult(store.store_name);
    }
    return { done: false, message: STEP_QUESTIONS[nextStep] };
  }

  // その他のステップは自由入力（バリデーション不要）
  const column = STEP_TO_COLUMN[step];
  const nextStep = getNextStep(step);

  // storesの該当カラムを更新 + 次のステップへ遷移
  const updates: Record<string, unknown> = {
    [column]: userInput.trim(),
    onboarding_step: nextStep,
  };

  // 最終ステップ完了時はonboarding_completedもtrueに
  if (nextStep === "completed") {
    updates.onboarding_completed = true;
  }

  await updateStore(store.id, updates as Parameters<typeof updateStore>[1]);

  if (nextStep === "completed") {
    // store_nameは最初のステップで保存済み。
    // 現在のステップがstore_nameでなければ既に保存されている値を使う。
    // store_nameステップの場合は今回の入力値を使う。
    const storeName = step === "store_name" ? userInput.trim() : store.store_name;
    return buildCompletionResult(storeName);
  }

  return { done: false, message: STEP_QUESTIONS[nextStep] };
}

// ============================================
// 完了メッセージ生成
// ============================================
function buildCompletionResult(storeName: string | null): OnboardingResult {
  const name = storeName || "お店";
  const message = [
    `ありがとうございます！「${name}」の登録が完了しました。`,
    "",
    "Linoaでできることをご紹介します：",
    "",
    "「日報」→ 今日の売上・客数・所感を記録",
    "「SNS」→ Instagram/X用の投稿文を自動生成",
    "「POP」→ 店頭POP画像を自動生成",
    "「レポート」→ 売上ダッシュボードを表示",
    "「賞味期限」→ 食材の期限を登録・アラート通知",
    "",
    "画面下のメニューからもお選びいただけます。",
    "さっそく「日報」と送って、今日の記録を始めましょう！",
  ].join("\n");

  return { done: true, message };
}
