"use client";

import { useState } from "react";
import { AttendanceRow } from "./dummy";
import PhotoModal from "./PhotoModal";

type RowWithLoc = AttendanceRow & {
  inDistM?: number | null;
  outDistM?: number | null;
  inOk?: boolean | null;
  outOk?: boolean | null;
  radiusM?: number;
};

export default function AttendanceTable({ data }: { data: RowWithLoc[] }) {
  const [preview, setPreview] = useState<{ open: boolean; src?: string; title?: string }>({
    open: false,
  });

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Tanggal</th>
              <th className="px-4 py-3 text-left">Karyawan</th>
              <th className="px-4 py-3 text-left">Cabang</th>
              <th className="px-4 py-3">Shift</th>
              <th className="px-4 py-3">Masuk</th>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Pulang</th>
              <th className="px-4 py-3">Foto</th>
              <th className="px-4 py-3">Telat</th>
              <th className="px-4 py-3 text-center">Lokasi</th>
              <th className="px-4 py-3 text-left">Catatan</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="px-4 py-3">{row.date}</td>

                <td className="px-4 py-3">
                  <div className="font-medium">{row.employeeName}</div>
                  <div className="text-xs text-slate-500">{row.employeeId}</div>
                </td>

                <td className="px-4 py-3">
                  <div>{row.branch}</div>
                  <div className="text-xs text-slate-500">{row.branchCode}</div>
                </td>

                <td className="px-4 py-3 text-center">{row.shift ?? "-"}</td>

                <td className="px-4 py-3 text-center">
                  {row.checkIn ? (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      {row.checkIn}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                {/* FOTO IN */}
                <td className="px-4 py-3 text-center">
                  {row.checkInPhoto ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreview({
                          open: true,
                          src: row.checkInPhoto,
                          title: `Foto Masuk — ${row.employeeName} (${row.employeeId})`,
                        })
                      }
                      className="inline-flex items-center justify-center rounded-lg ring-1 ring-slate-200 hover:ring-indigo-300"
                      title="Klik untuk preview"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.checkInPhoto}
                        alt="IN"
                        width={36}
                        height={36}
                        className="rounded-lg object-cover"
                      />
                    </button>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  {row.checkOut ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                      {row.checkOut}
                    </span>
                  ) : (
                    "-"
                  )}
                </td>

                {/* FOTO OUT */}
                <td className="px-4 py-3 text-center">
                  {row.checkOutPhoto ? (
                    <button
                      type="button"
                      onClick={() =>
                        setPreview({
                          open: true,
                          src: row.checkOutPhoto,
                          title: `Foto Pulang — ${row.employeeName} (${row.employeeId})`,
                        })
                      }
                      className="inline-flex items-center justify-center rounded-lg ring-1 ring-slate-200 hover:ring-indigo-300"
                      title="Klik untuk preview"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.checkOutPhoto}
                        alt="OUT"
                        width={36}
                        height={36}
                        className="rounded-lg object-cover"
                      />
                    </button>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  {row.lateMinutes ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                      Telat {row.lateMinutes}m
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">On time</span>
                  )}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <LocationPill label="IN" ok={row.inOk} distM={row.inDistM} radiusM={row.radiusM} />
                    <LocationPill label="OUT" ok={row.outOk} distM={row.outDistM} radiusM={row.radiusM} />
                  </div>
                </td>

                <td className="px-4 py-3 text-slate-600">{row.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PhotoModal
        open={preview.open}
        src={preview.src}
        title={preview.title}
        onClose={() => setPreview({ open: false })}
      />
    </>
  );
}

function LocationPill({
  label,
  ok,
  distM,
  radiusM,
}: {
  label: "IN" | "OUT";
  ok?: boolean | null;
  distM?: number | null;
  radiusM?: number;
}) {
  if (distM == null || ok == null) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
        {label}: -
      </span>
    );
  }

  const cls = ok
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-red-200 bg-red-50 text-red-700";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
      {label}: {Math.round(distM)}m / {radiusM ?? 200}m
    </span>
  );
}
