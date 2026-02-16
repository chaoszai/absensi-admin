import type { ApprovalRow } from "../approvals/dummy";
import type { AttendanceStatus } from "./dummy";

type AttendanceLike = {
  date: string; // YYYY-MM-DD
  employeeId: string;

  status?: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;

  distanceM?: number;
  radiusM?: number;
  locationFlag?: "ok" | "outside_radius";

  note?: string;
};

export function mergeApprovalsToAttendance<T extends AttendanceLike>(
  attendance: T[],
  approvals: ApprovalRow[]
): T[] {
  const approved = approvals.filter((a) => a.status === "approved");

  // index: employeeId|date
  const byKey = new Map<string, ApprovalRow[]>();
  for (const a of approved) {
    const k = `${a.employeeId}|${a.date}`;
    const arr = byKey.get(k) ?? [];
    arr.push(a);
    byKey.set(k, arr);
  }

  return attendance.map((row) => {
    const k = `${row.employeeId}|${row.date}`;
    const arr = byKey.get(k);
    if (!arr?.length) return row;

    const out: T = { ...row };

    // 1) LEAVE priority
    const leave = arr.find((x) => x.type === "leave");
    if (leave) {
      out.status = "leave";
      out.note = leave.reason ?? out.note;
      return out;
    }

    // 2) Manual correction
    const manual = arr.find((x) => x.type === "manual_correction");
    if (manual) {
      if (manual.checkIn) out.checkIn = manual.checkIn;
      if (manual.checkOut) out.checkOut = manual.checkOut;
      out.note = manual.reason ?? out.note;
      out.status = out.status ?? "on_time";
    }

    // 3) Outside radius flag
    const outRad = arr.find((x) => x.type === "outside_radius");
    if (outRad) {
      out.locationFlag = "outside_radius";
      if (typeof outRad.distanceM === "number") out.distanceM = outRad.distanceM;
      if (typeof outRad.radiusM === "number") out.radiusM = outRad.radiusM;
      out.note = outRad.reason ?? out.note;
    }

    // 4) Missing IN/OUT (jangan override kalau sudah ada jamnya)
    const missIn = arr.find((x) => x.type === "missing_in");
    if (missIn && !out.checkIn) {
      out.status = "missing_in";
      out.note = missIn.reason ?? out.note;
    }

    const missOut = arr.find((x) => x.type === "missing_out");
    if (missOut && !out.checkOut) {
      out.status = "missing_out";
      out.note = missOut.reason ?? out.note;
    }

    return out;
  });
}
