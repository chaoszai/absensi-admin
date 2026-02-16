"use client";

import { useEffect, useMemo, useState } from "react";
import type { BranchRow } from "./dummy";

type Mode = "create" | "edit";

export default function BranchFormModal({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: Mode;
  initial?: BranchRow | null;
  onClose: () => void;
  onSave: (payload: BranchRow) => void;
}) {
  const seed = useMemo<BranchRow>(() => {
    return (
      initial ?? {
        id: crypto.randomUUID(),
        code: "",
        name: "",
        address: "",
        lat: -7.0,
        lng: 110.0,
        radiusM: 200,
        isActive: true,
      }
    );
  }, [initial]);

  const [form, setForm] = useState<BranchRow>(seed);

  useEffect(() => {
    setForm(seed);
  }, [seed]);

  if (!open) return null;

  const set = <K extends keyof BranchRow>(k: K, v: BranchRow[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    if (!form.code.trim()) return "Kode cabang wajib diisi";
    if (!form.name.trim()) return "Nama cabang wajib diisi";
    if (!Number.isFinite(form.lat) || !Number.isFinite(form.lng)) return "Lat/Lng harus angka";
    if (!Number.isFinite(form.radiusM) || form.radiusM <= 0) return "Radius harus > 0";
    return null;
  };

  const submit = () => {
    const err = validate();
    if (err) return alert(err);
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              {mode === "create" ? "Tambah Cabang" : "Edit Cabang"}
            </p>
            <p className="text-xs text-slate-500">Isi data cabang + lokasi titik absensi.</p>
          </div>
          <button className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50" onClick={onClose}>
            Tutup
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Kode Cabang">
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="CBG_001"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Nama Cabang">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Klaten"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Latitude">
            <input
              value={String(form.lat)}
              onChange={(e) => set("lat", Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Longitude">
            <input
              value={String(form.lng)}
              onChange={(e) => set("lng", Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Radius (meter)">
            <input
              value={String(form.radiusM)}
              onChange={(e) => set("radiusM", Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <p className="mt-1 text-xs text-slate-500">Default 200m.</p>
          </Field>

          <Field label="Status">
            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => set("isActive", e.target.value === "active")}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </Field>

          <Field label="Alamat" className="sm:col-span-2">
            <textarea
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50" onClick={onClose}>
            Batal
          </button>
          <button
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            onClick={submit}
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-bold text-slate-700">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}
