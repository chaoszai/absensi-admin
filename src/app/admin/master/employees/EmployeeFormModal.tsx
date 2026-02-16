"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Branch = { id: string; name: string; code?: string | null };

type Employee = {
  id: string;
  empNo: string;
  name: string;
  role: string;
  grade: string;
  salaryOverride: number | null;
  isActive: boolean;

  gender: string | null;
  birthPlace: string | null;
  birthDate: string | Date | null;
  religion: string | null;
  education: string | null;
  maritalStatus: string | null;
  address: string | null;
  ktpNo: string | null;

  branchId: string;
};

const GENDER_OPTIONS = [
  { value: "", label: "- pilih -" },
  { value: "LAKI-LAKI", label: "LAKI-LAKI" },
  { value: "PEREMPUAN", label: "PEREMPUAN" },
];

const RELIGION_OPTIONS = [
  { value: "", label: "- pilih -" },
  { value: "ISLAM", label: "ISLAM" },
  { value: "KRISTEN", label: "KRISTEN" },
  { value: "KATOLIK", label: "KATOLIK" },
  { value: "HINDU", label: "HINDU" },
  { value: "BUDDHA", label: "BUDDHA" },
  { value: "KONGHUCU", label: "KONGHUCU" },
  { value: "LAINNYA", label: "LAINNYA" },
];

const EDUCATION_OPTIONS = [
  { value: "", label: "- pilih -" },
  { value: "SMK", label: "SMK" },
  { value: "SMA", label: "SMA" },
  { value: "AKADEMI", label: "AKADEMI" },
  { value: "D3", label: "D3" },
  { value: "S1", label: "S1" },
  { value: "S2", label: "S2" },
];

const MARITAL_OPTIONS = [
  { value: "", label: "- pilih -" },
  { value: "BELUM MENIKAH", label: "BELUM MENIKAH" },
  { value: "MENIKAH", label: "MENIKAH" },
  { value: "CERAI HIDUP", label: "CERAI HIDUP" },
  { value: "CERAI MATI", label: "CERAI MATI" },
];

export function EmployeeFormModal({
  open,
  onClose,
  branches,
  editing,
  createAction,
  updateAction,
}: {
  open: boolean;
  onClose: () => void;
  branches: Branch[];
  editing: Employee | null;
  createAction: (fd: FormData) => Promise<any>;
  updateAction: (fd: FormData) => Promise<any>;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const seed = useMemo(() => {
    const d = editing;

    const birthDate =
      d?.birthDate
        ? typeof d.birthDate === "string"
          ? d.birthDate.slice(0, 10)
          : new Date(d.birthDate).toISOString().slice(0, 10)
        : "";

    return {
      id: d?.id ?? "",
      empNo: (d as any)?.empNo ?? (d as any)?.employeeId ?? "",
      name: d?.name ?? "",
      branchId: d?.branchId ?? (branches?.[0]?.id ?? ""),
      role: (d?.role ?? "STAFF").toUpperCase(), // ✅ pastikan uppercase enum
      grade: (d?.grade ?? "A").toUpperCase(),
      salaryOverride: d?.salaryOverride ?? null,
      isActive: d?.isActive ?? true,

      gender: d?.gender ?? "",
      birthPlace: d?.birthPlace ?? "",
      birthDate,
      religion: d?.religion ?? "",
      education: d?.education ?? "",
      maritalStatus: d?.maritalStatus ?? "",
      address: d?.address ?? "",
      ktpNo: d?.ktpNo ?? "",
    };
  }, [editing, branches]);

  const [form, setForm] = useState(seed);
  useEffect(() => setForm(seed), [seed]);

  if (!open) return null;

  const set = (k: keyof typeof form, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200";
  const labelCls = "text-xs font-bold text-slate-700";

  const validate = () => {
    if (!form.empNo.trim()) return "EMP No wajib diisi";
    if (!form.name.trim()) return "Nama wajib diisi";
    if (!form.branchId) return "Cabang wajib dipilih";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) return alert(err);

    setSaving(true);
    try {
      const fd = new FormData();
      if (editing?.id) fd.set("id", editing.id);

      fd.set("empNo", form.empNo.trim().toUpperCase());
      fd.set("name", form.name.trim());
      fd.set("branchId", form.branchId);

      // ✅ nilai enum yang dikirim harus uppercase
      fd.set("role", String(form.role ?? "STAFF").toUpperCase());
      fd.set("grade", String(form.grade ?? "A").toUpperCase());

      fd.set("isActive", form.isActive ? "true" : "false");
      fd.set(
        "salaryOverride",
        form.salaryOverride === null || form.salaryOverride === ""
          ? ""
          : String(form.salaryOverride)
      );

      fd.set("gender", form.gender || "");
      fd.set("birthPlace", form.birthPlace || "");
      fd.set("birthDate", form.birthDate || "");
      fd.set("religion", form.religion || "");
      fd.set("education", form.education || "");
      fd.set("maritalStatus", form.maritalStatus || "");
      fd.set("address", form.address || "");
      fd.set("ktpNo", form.ktpNo || "");

      if (editing) await updateAction(fd);
      else await createAction(fd);

      onClose();
      router.refresh();
    } catch (e: any) {
      alert(e?.message ?? "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
      onClick={saving ? undefined : onClose}
    >
      <div
        className="mt-6 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <p className="text-sm font-extrabold text-slate-900">
              {editing ? "Edit Karyawan" : "Tambah Karyawan"}
            </p>
            <p className="text-xs text-slate-500">Master data karyawan.</p>
          </div>

          <button
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 disabled:opacity-60"
            onClick={onClose}
            disabled={saving}
          >
            Tutup
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-5">
          {/* ✅ Sticky section biar EMP No & Nama gak pernah kepotong */}
          <div className="sticky top-0 z-10 -mx-5 mb-4 border-b border-slate-100 bg-white px-5 pb-4 pt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className={labelCls}>EMP No</p>
                <div className="mt-1">
                  <input
                    value={form.empNo}
                    onChange={(e) => set("empNo", e.target.value)}
                    placeholder="EMP001 / EMP_001"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <p className={labelCls}>Nama</p>
                <div className="mt-1">
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Nama karyawan"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <p className={labelCls}>Cabang</p>
                <div className="mt-1">
                  <select
                    value={form.branchId}
                    onChange={(e) => set("branchId", e.target.value)}
                    className={inputCls}
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                        {b.code ? ` (${b.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className={labelCls}>Role</p>
                <div className="mt-1">
                  <select
                    value={form.role}
                    onChange={(e) => set("role", e.target.value.toUpperCase())}
                    className={inputCls}
                  >
                    <option value="STAFF">Staff</option>
                    <option value="SPV">SPV</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sisanya */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className={labelCls}>Grade</p>
              <div className="mt-1">
                <input
                  value={form.grade}
                  onChange={(e) => set("grade", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className={labelCls}>Override Gaji (opsional)</p>
              <div className="mt-1">
                <input
                  type="number"
                  value={form.salaryOverride ?? ""}
                  onChange={(e) =>
                    set(
                      "salaryOverride",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className={labelCls}>Status</p>
              <div className="mt-1">
                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) => set("isActive", e.target.value === "active")}
                  className={inputCls}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            <div>
              <p className={labelCls}>Jenis Kelamin</p>
              <div className="mt-1">
                <select
                  value={form.gender ?? ""}
                  onChange={(e) => set("gender", e.target.value)}
                  className={inputCls}
                >
                  {GENDER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className={labelCls}>Tempat Lahir</p>
              <div className="mt-1">
                <input
                  value={form.birthPlace ?? ""}
                  onChange={(e) => set("birthPlace", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className={labelCls}>Tanggal Lahir</p>
              <div className="mt-1">
                <input
                  type="date"
                  value={form.birthDate ?? ""}
                  onChange={(e) => set("birthDate", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <p className={labelCls}>Agama</p>
              <div className="mt-1">
                <select
                  value={form.religion ?? ""}
                  onChange={(e) => set("religion", e.target.value)}
                  className={inputCls}
                >
                  {RELIGION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className={labelCls}>Pendidikan</p>
              <div className="mt-1">
                <select
                  value={form.education ?? ""}
                  onChange={(e) => set("education", e.target.value)}
                  className={inputCls}
                >
                  {EDUCATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className={labelCls}>Status Nikah</p>
              <div className="mt-1">
                <select
                  value={form.maritalStatus ?? ""}
                  onChange={(e) => set("maritalStatus", e.target.value)}
                  className={inputCls}
                >
                  {MARITAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className={labelCls}>No KTP</p>
              <div className="mt-1">
                <input
                  value={form.ktpNo ?? ""}
                  onChange={(e) => set("ktpNo", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className={labelCls}>Alamat</p>
              <div className="mt-1">
                <textarea
                  rows={3}
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 border-t border-slate-100 p-5">
          <button
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </button>
          <button
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            onClick={submit}
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
