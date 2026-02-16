"use client";

import { useMemo, useState } from "react";
import type { ApprovalRow, ApprovalStatus, ApprovalType } from "./dummy";
import { approvalDummy } from "./dummy";
import ApprovalModal from "./ApprovalModal";

export default function ApprovalsPage() {
  const [rows, setRows] = useState<ApprovalRow[]>(approvalDummy);

  const [q, setQ] = useState("");
  const [type, setType] = useState<ApprovalType | "ALL">("ALL");
  const [status, setStatus] = useState<ApprovalStatus | "ALL">("pending");

  // ✅ filter pertanggal
  const [date, setDate] = useState<string>(""); // YYYY-MM-DD

  const [modal, setModal] = useState<{ open: boolean; row: ApprovalRow | null }>({
    open: false,
    row: null,
  });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return rows
      .filter((r) => (type === "ALL" ? true : r.type === type))
      .filter((r) => (status === "ALL" ? true : r.status === status))
      .filter((r) => (!date ? true : r.date === date)) // ✅ pertanggal
      .filter((r) => {
        if (!qq) return true;
        const hay = `${r.employeeName} ${r.employeeId} ${r.branch} ${r.branchCode} ${r.type}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [rows, q, type, status, date]);

  const open = (row: ApprovalRow) => setModal({ open: true, row });
  const close = () => setModal({ open: false, row: null });

  const decide = (id: string, next: ApprovalStatus) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    close();
  };

  const badge = (r: ApprovalRow) => {
    const map: Record<ApprovalStatus, { text: string; cls: string }> = {
      pending: { text: "PENDING", cls: "border-amber-200 bg-amber-50 text-amber-700" },
      approved: { text: "APPROVED", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
      rejected: { text: "REJECTED", cls: "border-red-200 bg-red-50 text-red-700" },
    };
    const b = map[r.status];
    return (
      <span className={`rounded-full border px-2 py-1 text-xs font-bold ${b.cls}`}>
        {b.text}
      </span>
    );
  };

  const typeLabel = (t: ApprovalRow["type"]) => {
    const map: Record<ApprovalType, string> = {
      missing_in: "Missing IN",
      missing_out: "Missing OUT",
      outside_radius: "Di luar radius",
      leave: "Leave",
      manual_correction: "Koreksi",
    };
    return map[t] ?? t;
  };

  const reset = () => {
    setQ("");
    setType("ALL");
    setStatus("pending");
    setDate("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approvals</h1>
          <p className="text-slate-600">
            Validasi data absensi yang “nyangkut” sebelum masuk payroll.
          </p>
        </div>

        <button
          onClick={reset}
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Reset filter
        </button>
      </div>

      {/* FILTER */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 min-w-[260px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / ID / cabang / tipe..."
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          {/* ✅ Filter tanggal */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm lg:w-[190px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full rounded-xl border px-3 py-2 text-sm lg:w-[220px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="missing_in">Missing IN</option>
            <option value="missing_out">Missing OUT</option>
            <option value="outside_radius">Di luar radius</option>
            <option value="leave">Leave</option>
            <option value="manual_correction">Koreksi</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded-xl border px-3 py-2 text-sm lg:w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="ALL">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <div className="text-sm text-slate-600">
            Total: <b className="text-slate-900">{filtered.length}</b>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Karyawan</th>
              <th className="px-4 py-3 text-left">Cabang</th>
              <th className="px-4 py-3 text-left">Tipe</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">{r.date}</td>

                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{r.employeeName}</div>
                  <div className="text-xs text-slate-500">{r.employeeId}</div>
                </td>

                <td className="px-4 py-3">
                  <div>{r.branch}</div>
                  <div className="text-xs text-slate-500">{r.branchCode}</div>
                </td>

                <td className="px-4 py-3">
                  <span className="rounded-full border bg-white px-2 py-1 text-xs font-bold text-slate-700">
                    {typeLabel(r.type)}
                  </span>
                </td>

                <td className="px-4 py-3 text-center">{badge(r)}</td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => open(r)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-600">
                  Tidak ada data approvals.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ApprovalModal open={modal.open} row={modal.row} onClose={close} onDecide={decide} />
    </div>
  );
}
