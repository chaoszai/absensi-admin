"use client";

import { useMemo, useState } from "react";
import type { PayGradeRow, RoleCode, GradeCode } from "./dummy";
import { payGradeDummy } from "./dummy";

const ROLE_LABEL: Record<RoleCode, string> = {
  STAFF: "Staff",
  ADMIN: "Admin",
  SPV: "SPV",
};

const GRADE_LABEL: Record<GradeCode, string> = {
  G1: "G1",
  G2: "G2",
  G3: "G3",
};

const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);

export default function PayGradesPage() {
  const [rows, setRows] = useState<PayGradeRow[]>(payGradeDummy);
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (activeOnly ? r.isActive : true))
      .filter((r) => {
        if (!qq) return true;
        const hay = `${r.role} ${r.grade} ${r.baseSalary} ${r.allowance}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => `${a.role}${a.grade}`.localeCompare(`${b.role}${b.grade}`));
  }, [rows, q, activeOnly]);

  const upsert = (payload: PayGradeRow) => {
    setRows((prev) => {
      const idx = prev.findIndex((x) => x.id === payload.id);
      if (idx === -1) return [payload, ...prev];
      const copy = [...prev];
      copy[idx] = payload;
      return copy;
    });
  };

  // MVP: edit inline sederhana via prompt (biar cepat jadi)
  const edit = (r: PayGradeRow) => {
    const base = Number(prompt("Gaji pokok (angka)", String(r.baseSalary)) ?? r.baseSalary);
    const allowance = Number(prompt("Tunjangan (angka)", String(r.allowance)) ?? r.allowance);
    if (!Number.isFinite(base) || base < 0) return alert("Base salary harus angka >= 0");
    if (!Number.isFinite(allowance) || allowance < 0) return alert("Allowance harus angka >= 0");
    upsert({ ...r, baseSalary: base, allowance });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pay Grades</h1>
          <p className="text-slate-600">Mapping Jabatan + Grade → Gaji Pokok + Tunjangan.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 min-w-[260px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari role / grade / angka..."
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4"
            />
            Hanya aktif
          </label>

          <div className="text-sm text-slate-600">
            Total: <b className="text-slate-900">{filtered.length}</b>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-right">Gaji Pokok</th>
              <th className="px-4 py-3 text-right">Tunjangan</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-semibold text-slate-900">{ROLE_LABEL[r.role]}</td>
                <td className="px-4 py-3">{GRADE_LABEL[r.grade]}</td>
                <td className="px-4 py-3 text-right">Rp {fmt(r.baseSalary)}</td>
                <td className="px-4 py-3 text-right">Rp {fmt(r.allowance)}</td>
                <td className="px-4 py-3 text-center">
                  {r.isActive ? (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">
                      Aktif
                    </span>
                  ) : (
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700">
                      Nonaktif
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => edit(r)}
                    className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                  >
                    Edit Nominal
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-600">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
