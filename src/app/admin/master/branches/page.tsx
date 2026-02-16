"use client";

import { useMemo, useState } from "react";
import type { BranchRow } from "./dummy";
import { branchDummy } from "./dummy";
import dynamic from "next/dynamic";
const BranchFormModal = dynamic(
  () => import("./BranchFormModal").then((m) => m.default),
  { ssr: false }
);



export default function MasterCabangPage() {
  const [rows, setRows] = useState<BranchRow[]>(branchDummy);
  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [modal, setModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    initial?: BranchRow | null;
  }>({ open: false, mode: "create", initial: null });

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows
      .filter((r) => (activeOnly ? r.isActive : true))
      .filter((r) => {
        if (!qq) return true;
        const hay = `${r.code} ${r.name} ${r.address}`.toLowerCase();
        return hay.includes(qq);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [rows, q, activeOnly]);

  const openCreate = () => setModal({ open: true, mode: "create", initial: null });
  const openEdit = (r: BranchRow) => setModal({ open: true, mode: "edit", initial: r });
  const close = () => setModal((m) => ({ ...m, open: false }));

  const save = (payload: BranchRow) => {
    setRows((prev) => {
      const idx = prev.findIndex((x) => x.id === payload.id);
      if (idx === -1) return [payload, ...prev];
      const copy = [...prev];
      copy[idx] = payload;
      return copy;
    });
  };

  const remove = (id: string) => {
    if (!confirm("Hapus cabang ini?")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Cabang</h1>
          <p className="text-slate-600">
            Kelola cabang + titik lokasi absensi (radius default 200m).
          </p>
        </div>

        <button
          onClick={openCreate}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Tambah Cabang
        </button>
      </div>

      {/* FILTER */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 min-w-[260px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari kode / nama / alamat..."
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

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Kode</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Alamat</th>
              <th className="px-4 py-3 text-center">Radius</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3 font-semibold text-slate-900">{r.code}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="max-w-[520px] truncate">{r.address || "-"}</div>
                  <div className="text-xs text-slate-500">
                    {r.lat}, {r.lng}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{r.radiusM}m</td>
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
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(r)}
                      className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => remove(r.id)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-600">
                  Tidak ada cabang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <BranchFormModal
        open={modal.open}
        mode={modal.mode}
        initial={modal.initial}
        onClose={close}
        onSave={save}
      />
    </div>
  );
}
