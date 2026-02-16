"use client";

import { useEffect, useMemo, useState } from "react";
import type { ShiftRuleRow } from "./dummy";

type Mode = "create" | "edit";

export function ShiftRuleFormModal({
  open,
  mode,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: Mode;
  initial?: ShiftRuleRow | null;
  onClose: () => void;
  onSave: (payload: ShiftRuleRow) => void;
}) {
  const seed = useMemo<ShiftRuleRow>(() => {
    return (
      initial ?? {
        id: crypto.randomUUID(),
        code: "",
        name: "",
        checkInStart: "08:00",
        checkInEnd: "08:59",
        workStart: "08:00",
        lateToleranceMin: 10,
        isActive: true,
        note: "",
      }
    );
  }, [initial]);

  const [form, setForm] = useState<ShiftRuleRow>(seed);

  useEffect(() => setForm(seed), [seed]);

  if (!open) return null;

  const set = <K extends keyof ShiftRuleRow>(k: K, v: ShiftRuleRow[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const isHHMM = (s: string) => /^\d{2}:\d{2}$/.test(s);
  const validate = () => {
    if (!form.code.trim()) return "Kode shift wajib diisi (contoh: SHIFT_1)";
    if (!form.name.trim()) return "Nama shift wajib diisi (contoh: SHIFT 1)";
    if (!isHHMM(form.checkInStart) || !isHHMM(form.checkInEnd))
      return "Jam window check-in harus format HH:mm";
    if (!isHHMM(form.workStart)) return "Work start harus format HH:mm";
    if (!Number.isFinite(form.lateToleranceMin) || form.lateToleranceMin < 0)
      return "Toleransi telat harus angka >= 0";
    return null;
  };

  const submit = () => {
    const err = validate();
    if (err) return alert(err);
    onSave({
      ...form,
      code: form.code.trim().toUpperCase().replace(/\s+/g, "_"),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              {mode === "create" ? "Tambah Shift Rule" : "Edit Shift Rule"}
            </p>
            <p className="text-xs text-slate-500">
              Window check-in buat deteksi shift + jam kerja referensi buat hitung telat.
            </p>
          </div>
          <button
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Kode (SHIFT_1)">
            <input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="SHIFT_1"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Nama (SHIFT 1)">
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="SHIFT 1"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Check-in window start (HH:mm)">
            <input
              value={form.checkInStart}
              onChange={(e) => set("checkInStart", e.target.value)}
              placeholder="05:00"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Check-in window end (HH:mm)">
            <input
              value={form.checkInEnd}
              onChange={(e) => set("checkInEnd", e.target.value)}
              placeholder="10:59"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Work start (buat hitung telat)">
            <input
              value={form.workStart}
              onChange={(e) => set("workStart", e.target.value)}
              placeholder="08:00"
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="Toleransi telat (menit)">
            <input
              value={String(form.lateToleranceMin)}
              onChange={(e) => set("lateToleranceMin", Number(e.target.value))}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
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

          <Field label="Catatan" className="sm:col-span-2">
            <textarea
              rows={3}
              value={form.note ?? ""}
              onChange={(e) => set("note", e.target.value)}
              className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              placeholder="Opsional..."
            />
          </Field>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
            onClick={onClose}
          >
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
