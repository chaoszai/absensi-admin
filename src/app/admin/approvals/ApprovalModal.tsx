"use client";

import { useMemo } from "react";
import type { ApprovalRow, ApprovalStatus } from "./dummy";

export default function ApprovalModal({
  open,
  row,
  onClose,
  onDecide,
}: {
  open: boolean;
  row: ApprovalRow | null;
  onClose: () => void;
  onDecide: (id: string, status: ApprovalStatus, note?: string) => void;
}) {
  const title = useMemo(() => {
    if (!row) return "Approval";
    const map: Record<string, string> = {
      missing_in: "Missing IN",
      missing_out: "Missing OUT",
      outside_radius: "Di luar radius",
      leave: "Izin / Leave",
      manual_correction: "Koreksi manual",
    };
    return map[row.type] ?? "Approval";
  }, [row]);

  if (!open || !row) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-extrabold text-slate-900">{title}</p>
            <p className="text-xs text-slate-500">
              {row.employeeName} ({row.employeeId}) • {row.branch} ({row.branchCode}) • {row.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          >
            Tutup
          </button>
        </div>

        <div className="p-5 space-y-3">
          {row.reason && (
            <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
              <div className="text-xs font-bold text-slate-600">Alasan</div>
              <div className="mt-1">{row.reason}</div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info label="Check-in" value={row.checkIn ?? "-"} />
            <Info label="Check-out" value={row.checkOut ?? "-"} />
            <Info
              label="Jarak"
              value={
                row.distanceM != null
                  ? `${row.distanceM}m (radius ${row.radiusM ?? "-"}m)`
                  : "-"
              }
            />
            <Info label="Status" value={row.status.toUpperCase()} />
          </div>

          {row.evidencePhoto && (
            <div className="flex justify-center pt-2">
              <div className="rounded-xl bg-white p-2 shadow ring-1 ring-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={row.evidencePhoto}
                  alt="evidence"
                  className="h-40 w-40 rounded-lg object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => onDecide(row.id, "rejected")}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Reject
            </button>
            <button
              onClick={() => onDecide(row.id, "approved")}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs font-bold text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}
