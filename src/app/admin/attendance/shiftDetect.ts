type ShiftRule = {
  code: string;
  name: string;
  checkInStart: string; // "23:00"
  checkInEnd: string;   // "04:59"
  workStart: string;    // "23:00"
  lateToleranceMin: number;
  isActive: boolean;
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// true kalau time ada di range start-end, support wrap midnight
const inRange = (t: number, start: number, end: number) => {
  if (start <= end) return t >= start && t <= end;
  // wrap midnight: contoh 23:00 - 04:59
  return t >= start || t <= end;
};

export function detectShift(checkInHHmm: string | undefined, rules: ShiftRule[]) {
  if (!checkInHHmm) return null;
  const t = toMin(checkInHHmm);

  const active = rules.filter((r) => r.isActive);
  for (const r of active) {
    const start = toMin(r.checkInStart);
    const end = toMin(r.checkInEnd);
    if (inRange(t, start, end)) return r;
  }
  return null;
}

export function calcLateMinutes(
  checkInHHmm: string | undefined,
  rule: ShiftRule | null
) {
  if (!checkInHHmm || !rule) return 0;
  const t = toMin(checkInHHmm);
  const ws = toMin(rule.workStart);

  // kalau shift wrap midnight, workStart juga bisa wrap -> tetap aman
  // untuk telat, kita bandingin dalam “hari yang sama”:
  // jika workStart > t dan range wrap, berarti checkIn masih di after-midnight, workStart ada di prev-day,
  // maka workStart dianggap -1440 biar comparable
  let tAdj = t;
  let wsAdj = ws;

  const start = toMin(rule.checkInStart);
  const end = toMin(rule.checkInEnd);
  const wrap = start > end;

  if (wrap) {
    // contoh: checkIn 02:00 (120), workStart 23:00 (1380)
    // workStart itu sebenarnya "kemarin", jadi 1380 -> -60
    if (t < start) tAdj = t + 1440;       // 02:00 -> 1560
    if (ws <= end) wsAdj = ws + 1440;     // kalau workStart after midnight
  }

  const late = tAdj - wsAdj - (rule.lateToleranceMin ?? 0);
  return late > 0 ? late : 0;
}
