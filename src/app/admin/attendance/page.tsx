"use client";

import { useMemo, useState } from "react";
import AttendanceTable from "./AttendanceTable";
import { attendanceDummy, type AttendanceRow } from "./dummy";

import { shiftRuleDummy } from "../shift-rules/dummy";
import { detectShift, calcLateMinutes } from "./shiftDetect";

import { approvalDummy } from "../approvals/dummy";
import { mergeApprovalsToAttendance } from "./mergeApprovals";

import { branchDummy } from "../master/branches/dummy";
import { calcDistanceMeters, inRadius } from "./locationDetect";

import {
  applyFilters,
  downloadCSV,
  toCSV,
  uniqueBranches,
  type AttendanceFilters,
} from "./utils";

const PAGE_SIZE = 10;

type EnrichedRow = AttendanceRow & {
  shiftDetected?: string;

  inDistM?: number | null;
  outDistM?: number | null;
  inOk?: boolean | null;
  outOk?: boolean | null;
  radiusM?: number;
};

export default function AttendancePage() {
  const [filters, setFilters] = useState<AttendanceFilters>({
    q: "",
    branch: "ALL",
    status: "ALL",
    preset: "today",
    from: "",
    to: "",
  });

  const [page, setPage] = useState(1);

  const branchMap = useMemo(() => {
    const m = new Map<string, (typeof branchDummy)[number]>();
    branchDummy.forEach((b) => m.set(b.code, b));
    return m;
  }, []);

  // 1) merge approvals (approved only) -> jadi base
  const mergedBase = useMemo(() => {
    return mergeApprovalsToAttendance(attendanceDummy, approvalDummy);
  }, []);

  // 2) enrich shift + late + location
  const enriched = useMemo<EnrichedRow[]>(() => {
    return mergedBase.map((row) => {
      const rule = detectShift(row.checkIn, shiftRuleDummy);
      const late = calcLateMinutes(row.checkIn, rule);

      const b = branchMap.get(row.branchCode);

      const inDist =
        b && row.checkInLat != null && row.checkInLng != null
          ? calcDistanceMeters(row.checkInLat, row.checkInLng, b.lat, b.lng)
          : null;

      const outDist =
        b && row.checkOutLat != null && row.checkOutLng != null
          ? calcDistanceMeters(row.checkOutLat, row.checkOutLng, b.lat, b.lng)
          : null;

      const inOkVal = b && inDist != null ? inRadius(inDist, b.radiusM) : null;
      const outOkVal = b && outDist != null ? inRadius(outDist, b.radiusM) : null;

      return {
        ...row,
        shift: rule?.name ?? row.shift ?? "-",
        lateMinutes: late || undefined,
        shiftDetected: rule?.code ?? undefined,

        inDistM: inDist,
        outDistM: outDist,
        inOk: inOkVal,
        outOk: outOkVal,
        radiusM: b?.radiusM ?? 200,
      };
    });
  }, [mergedBase, branchMap]);

  const branches = useMemo(() => uniqueBranches(enriched), [enriched]);

  // 3) filter pake enriched
  const filtered = useMemo(() => {
    const out = applyFilters(enriched as any, filters);
    return out.sort((a: any, b: any) => (a.date < b.date ? 1 : -1));
  }, [enriched, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paged = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages]);

  const onChange = <K extends keyof AttendanceFilters>(key: K, val: AttendanceFilters[K]) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: val }));
  };

  const doExport = () => {
    const csv = toCSV(filtered as any);
    const name = `attendance_export_${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCSV(name, csv);
  };

  const reset = () => {
    setPage(1);
    setFilters({
      q: "",
      branch: "ALL",
      status: "ALL",
      preset: "today",
      from: "",
      to: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Absensi</h1>
          <p className="text-slate-600">Table absensi + lokasi + preview foto (MVP).</p>
        </div>

        <button
          onClick={doExport}
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Export CSV (filtered)
        </button>
      </div>

      {/* FILTER */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 min-w-[280px]">
            <input
              type="text"
              inputMode="search"
              autoComplete="off"
              value={filters.q}
              onChange={(e) => onChange("q", e.target.value)}
              placeholder="Cari nama / ID / cabang..."
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <select
            value={filters.branch}
            onChange={(e) => onChange("branch", e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm lg:w-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="ALL">Semua Cabang</option>
            {branches.map((b) => (
              <option key={b.code} value={b.code}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => onChange("status", e.target.value as any)}
            className="w-full rounded-xl border px-3 py-2 text-sm lg:w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="ALL">Semua Status</option>
            <option value="on_time">On time</option>
            <option value="late">Late</option>
            <option value="missing_in">Missing In</option>
            <option value="missing_out">Missing Out</option>
            <option value="leave">Leave</option>
          </select>

          <select
            value={filters.preset}
            onChange={(e) => {
              const val = e.target.value as any;
              setPage(1);
              setFilters((prev) => ({
                ...prev,
                preset: val,
                ...(val !== "custom" ? { from: "", to: "" } : {}),
              }));
            }}
            className="w-full rounded-xl border px-3 py-2 text-sm lg:w-[160px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="today">Today</option>
            <option value="7d">Last 7D</option>
            <option value="30d">Last 30D</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {filters.preset === "custom" && (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={filters.from}
              onChange={(e) => onChange("from", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-[220px]"
            />
            <input
              type="date"
              value={filters.to}
              onChange={(e) => onChange("to", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:w-[220px]"
            />
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span>
            Hasil: <b className="text-slate-900">{filtered.length}</b> baris
          </span>

          <button
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            onClick={reset}
          >
            Reset filter
          </button>
        </div>
      </div>

      <AttendanceTable data={paged as any} />

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page <b className="text-slate-900">{page}</b> / <b className="text-slate-900">{totalPages}</b>
        </p>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
