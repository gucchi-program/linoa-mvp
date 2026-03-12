import { createStaff, getActiveStaff, createShift, getShifts, findStaffByName } from "./db";
import type { Staff } from "@/types";

// ============================================
// シフト管理セッション
// 「シフト」→ メニュー選択 → 各操作
// ============================================

type ShiftAction = "menu" | "add_staff" | "add_shift_staff" | "add_shift_date" | "add_shift_time" | "view";

interface ShiftSession {
  storeId: string;
  action: ShiftAction;
  staffName?: string;
  staffId?: string;
  shiftDate?: string;
  createdAt: number;
}

const sessions = new Map<string, ShiftSession>();
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// ============================================
// トリガー判定
// ============================================
export function isShiftTrigger(message: string): boolean {
  const triggers = ["シフト", "しふと"];
  return triggers.some((t) => message === t || message === t + "管理");
}

// ============================================
// セッション管理
// ============================================
export function getActiveShiftSession(storeId: string): ShiftSession | null {
  const session = sessions.get(storeId);
  if (!session) return null;
  if (Date.now() - session.createdAt > SESSION_TIMEOUT_MS) {
    sessions.delete(storeId);
    return null;
  }
  return session;
}

export function cancelShiftSession(storeId: string): void {
  sessions.delete(storeId);
}

// ============================================
// シフト管理メニュー表示
// ============================================
export function startShiftSession(storeId: string): string {
  sessions.set(storeId, {
    storeId,
    action: "menu",
    createdAt: Date.now(),
  });

  return [
    "シフト管理メニュー：",
    "",
    "1. スタッフ登録",
    "2. シフト登録",
    "3. 今週のシフト確認",
    "4. 来週のシフト確認",
    "",
    "番号を送ってください。",
  ].join("\n");
}

// ============================================
// 入力処理
// ============================================
export async function processShiftInput(
  storeId: string,
  userInput: string
): Promise<{ done: boolean; message: string }> {
  const session = sessions.get(storeId);
  if (!session) {
    return { done: true, message: "セッションが切れました。「シフト」と送って再度お試しください。" };
  }

  switch (session.action) {
    case "menu":
      return handleMenu(session, userInput);
    case "add_staff":
      return handleAddStaff(session, userInput);
    case "add_shift_staff":
      return handleAddShiftStaff(session, userInput);
    case "add_shift_date":
      return handleAddShiftDate(session, userInput);
    case "add_shift_time":
      return handleAddShiftTime(session, userInput);
    default:
      sessions.delete(storeId);
      return { done: true, message: "" };
  }
}

// メニュー選択
async function handleMenu(session: ShiftSession, input: string): Promise<{ done: boolean; message: string }> {
  const choice = input.trim();

  switch (choice) {
    case "1": {
      session.action = "add_staff";
      return {
        done: false,
        message: "スタッフの名前を入力してください（例: 田中さん）",
      };
    }
    case "2": {
      const staff = await getActiveStaff(session.storeId);
      if (staff.length === 0) {
        sessions.delete(session.storeId);
        return {
          done: true,
          message: "スタッフが登録されていません。\n先に「シフト」→「1. スタッフ登録」で登録してください。",
        };
      }
      session.action = "add_shift_staff";
      const staffList = staff.map((s, i) => `${i + 1}. ${s.name}`).join("\n");
      return {
        done: false,
        message: `シフトを登録するスタッフの番号を選んでください：\n\n${staffList}`,
      };
    }
    case "3": {
      // 今週のシフト
      const { start, end } = getWeekRange(0);
      const message = await formatShiftList(session.storeId, start, end, "今週");
      sessions.delete(session.storeId);
      return { done: true, message };
    }
    case "4": {
      // 来週のシフト
      const { start, end } = getWeekRange(1);
      const message = await formatShiftList(session.storeId, start, end, "来週");
      sessions.delete(session.storeId);
      return { done: true, message };
    }
    default:
      return { done: false, message: "1〜4の番号を送ってください。" };
  }
}

// スタッフ登録
async function handleAddStaff(session: ShiftSession, input: string): Promise<{ done: boolean; message: string }> {
  const name = input.trim();
  if (name.length === 0 || name.length > 20) {
    return { done: false, message: "名前を入力してください（20文字以内）。" };
  }

  await createStaff(session.storeId, name);
  sessions.delete(session.storeId);

  return {
    done: true,
    message: `「${name}」さんをスタッフとして登録しました。\n\n続けてシフトを登録する場合は「シフト」と送ってください。`,
  };
}

// シフト登録: スタッフ選択
async function handleAddShiftStaff(session: ShiftSession, input: string): Promise<{ done: boolean; message: string }> {
  const staff = await getActiveStaff(session.storeId);
  const index = parseInt(input.trim()) - 1;

  if (isNaN(index) || index < 0 || index >= staff.length) {
    // 名前で検索も試みる
    const found = await findStaffByName(session.storeId, input.trim());
    if (found) {
      session.staffId = found.id;
      session.staffName = found.name;
      session.action = "add_shift_date";
      return {
        done: false,
        message: `${found.name}さんのシフトを登録します。\n\n日付を入力してください（例: 3/15, 明日, 月曜）`,
      };
    }
    return { done: false, message: "番号またはスタッフ名を入力してください。" };
  }

  session.staffId = staff[index].id;
  session.staffName = staff[index].name;
  session.action = "add_shift_date";

  return {
    done: false,
    message: `${staff[index].name}さんのシフトを登録します。\n\n日付を入力してください（例: 3/15, 明日, 月曜）`,
  };
}

// シフト登録: 日付入力
async function handleAddShiftDate(session: ShiftSession, input: string): Promise<{ done: boolean; message: string }> {
  const date = parseShiftDate(input.trim());
  if (!date) {
    return {
      done: false,
      message: "日付を認識できませんでした。\n「3/15」「明日」「月曜」などの形式で入力してください。",
    };
  }

  session.shiftDate = date;
  session.action = "add_shift_time";

  return {
    done: false,
    message: `日付: ${date}\n\n勤務時間を入力してください（例: 17:00-23:00）`,
  };
}

// シフト登録: 時間入力 → 保存
async function handleAddShiftTime(session: ShiftSession, input: string): Promise<{ done: boolean; message: string }> {
  const timeMatch = input.trim().match(/(\d{1,2}):?(\d{2})?\s*[-〜～]\s*(\d{1,2}):?(\d{2})?/);
  if (!timeMatch) {
    return {
      done: false,
      message: "時間を認識できませんでした。\n「17:00-23:00」「17-23」などの形式で入力してください。",
    };
  }

  const startHour = timeMatch[1].padStart(2, "0");
  const startMin = timeMatch[2] ?? "00";
  const endHour = timeMatch[3].padStart(2, "0");
  const endMin = timeMatch[4] ?? "00";
  const startTime = `${startHour}:${startMin}`;
  const endTime = `${endHour}:${endMin}`;

  await createShift({
    storeId: session.storeId,
    staffId: session.staffId!,
    shiftDate: session.shiftDate!,
    startTime,
    endTime,
  });

  const dow = getDayOfWeek(session.shiftDate!);
  sessions.delete(session.storeId);

  return {
    done: true,
    message: [
      `シフトを登録しました。`,
      "",
      `${session.staffName}さん`,
      `${session.shiftDate}（${dow}） ${startTime}〜${endTime}`,
      "",
      `続けて登録する場合は「シフト」と送ってください。`,
    ].join("\n"),
  };
}

// ============================================
// シフト一覧フォーマット
// ============================================
async function formatShiftList(storeId: string, startDate: string, endDate: string, label: string): Promise<string> {
  const shifts = await getShifts(storeId, startDate, endDate);

  if (shifts.length === 0) {
    return `${label}のシフト（${startDate}〜${endDate}）\n\n登録されているシフトはありません。`;
  }

  // 日付ごとにグループ化
  const grouped = new Map<string, { name: string; start: string; end: string }[]>();
  for (const s of shifts) {
    const staffData = s.staff as unknown as { name: string };
    const existing = grouped.get(s.shift_date) ?? [];
    existing.push({ name: staffData.name, start: s.start_time, end: s.end_time });
    grouped.set(s.shift_date, existing);
  }

  const lines: string[] = [`${label}のシフト（${startDate}〜${endDate}）`, ""];
  for (const [date, entries] of grouped) {
    const dow = getDayOfWeek(date);
    lines.push(`■ ${date}（${dow}）`);
    for (const e of entries) {
      lines.push(`  ${e.name} ${e.start}〜${e.end}`);
    }
  }

  return lines.join("\n");
}

// ============================================
// ユーティリティ
// ============================================
const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

function getDayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return DAY_NAMES[d.getDay()];
}

function getWeekRange(weeksAhead: number): { start: string; end: string } {
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffset);

  // 今週の月曜日を起点に
  const dayOfWeek = jstNow.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(jstNow);
  monday.setDate(jstNow.getDate() + diffToMonday + weeksAhead * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split("T")[0],
    end: sunday.toISOString().split("T")[0],
  };
}

// 日付パーサー（賞味期限と共通ロジック）
function parseShiftDate(input: string): string | null {
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffset);

  // 「今日」「明日」「明後日」
  if (input === "今日") return jstNow.toISOString().split("T")[0];
  if (input === "明日") {
    const t = new Date(jstNow); t.setDate(t.getDate() + 1);
    return t.toISOString().split("T")[0];
  }
  if (input === "明後日") {
    const t = new Date(jstNow); t.setDate(t.getDate() + 2);
    return t.toISOString().split("T")[0];
  }

  // 「月曜」「火曜」等 → 次のその曜日
  const dowMatch = input.match(/^(月|火|水|木|金|土|日)曜?$/);
  if (dowMatch) {
    const targetDow = DAY_NAMES.indexOf(dowMatch[1]);
    const currentDow = jstNow.getDay();
    let diff = targetDow - currentDow;
    if (diff <= 0) diff += 7;
    const target = new Date(jstNow);
    target.setDate(jstNow.getDate() + diff);
    return target.toISOString().split("T")[0];
  }

  // 「N日後」
  const daysLaterMatch = input.match(/(\d+)\s*日\s*後/);
  if (daysLaterMatch) {
    const days = parseInt(daysLaterMatch[1]);
    const t = new Date(jstNow); t.setDate(t.getDate() + days);
    return t.toISOString().split("T")[0];
  }

  // 「YYYY-MM-DD」
  const isoMatch = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2].padStart(2, "0")}-${isoMatch[3].padStart(2, "0")}`;
  }

  // 「M/D」
  const slashMatch = input.match(/^(\d{1,2})[/／](\d{1,2})$/);
  if (slashMatch) {
    const month = parseInt(slashMatch[1]);
    const day = parseInt(slashMatch[2]);
    let year = jstNow.getFullYear();
    const candidate = new Date(year, month - 1, day);
    if (candidate < new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())) {
      year += 1;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  // 「M月D日」
  const jpMatch = input.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
  if (jpMatch) {
    const month = parseInt(jpMatch[1]);
    const day = parseInt(jpMatch[2]);
    let year = jstNow.getFullYear();
    const candidate = new Date(year, month - 1, day);
    if (candidate < new Date(jstNow.getFullYear(), jstNow.getMonth(), jstNow.getDate())) {
      year += 1;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return null;
}
