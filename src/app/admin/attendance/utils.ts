import type { AttendanceRow, AttendanceStatus } from "./dummy";

export type DatePreset = "today" | "7d" | "30d" | "custom";

export type AttendanceFilters = {
  q: string;
  branch: string; // branchCode or "ALL"
  status: AttendanceStatus | "ALL";
  preset: DatePreset;
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
};

export function uniqueBranches(rows: AttendanceRow[]) {
  const map = new Map<string, { code: string; name: string }>();
  for (const r of rows) {
    map.set(r.branchCode, { code: r.branchCode, name: r.branch });
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function toDateOnly(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function resolveDateRange(preset: DatePreset, from?: string, to?: string) {
  const now = new Date();
  const today = toDateOnly(now);

  if (preset === "today") return { from: today, to: today };

  if (preset === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return { from: toDateOnly(start), to: today };
  }

  if (preset === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { from: toDateOnly(start), to: today };
  }

  // custom
  return { from: from || "", to: to || "" };
}

/**
 * STATUS LOGIC (IMPORTANT)
 * - Jika row.status sudah ada (misal dari merge approvals): pakai itu.
 * - Kalau belum ada:
 *    - no checkIn => missing_in
 *    - no checkOut => missing_out
 *    - lateMinutes > 0 => late
 *    - else => on_time
 */
export function effectiveStatus(r: AttendanceRow): AttendanceStatus {
  if (r.status) return r.status;

  // optional: kalau kamu suka, ini bantu “izin” kebaca walau belum merge approvals
  // tapi idealnya leave berasal dari approval approved
  // if (r.note?.toLowerCase().includes("izin")) return "leave";

  if (!r.checkIn) return "missing_in";
  if (!r.checkOut) return "missing_out";
  if (typeof r.lateMinutes === "number" && r.lateMinutes > 0) return "late";
  return "on_time";
}

export function applyFilters(rows: AttendanceRow[], filters: AttendanceFilters) {
  const q = filters.q.trim().toLowerCase();
  const { from, to } = resolveDateRange(filters.preset, filters.from, filters.to);

  return rows.filter((r) => {
    // search
    if (q) {
      const hay = `${r.employeeName} ${r.employeeId} ${r.branch} ${r.branchCode} ${r.shift ?? ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    // branch
    if (filters.branch !== "ALL" && r.branchCode !== filters.branch) return false;

    // status (pakai effectiveStatus)
    const s = effectiveStatus(r);
    if (filters.status !== "ALL" && s !== filters.status) return false;

    // date range
    if (filters.preset !== "custom") {
      if (r.date < from || r.date > to) return false;
    } else {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
    }

    return true;
  });
}

export function toCSV(rows: AttendanceRow[]) {
  const header = [
    "date",
    "employeeName",
    "employeeId",
    "branch",
    "branchCode",
    "shift",
    "checkIn",
    "checkOut",
    "lateMinutes",
    "status",
    "note",
  ];

  const escape = (v: unknown) => {
    const s = String(v ?? "");
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replaceAll('"', '""')}"`;
    return s;
  };

  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        r.date,
        r.employeeName,
        r.employeeId,
        r.branch,
        r.branchCode,
        r.shift ?? "",
        r.checkIn ?? "",
        r.checkOut ?? "",
        r.lateMinutes ?? "",
        effectiveStatus(r),
        r.note ?? "",
      ]
        .map(escape)
        .join(",")
    ),
  ];

  return lines.join("\n");
}

export function downloadCSV(filename: string, csvText: string) {
  const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
