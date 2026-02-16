"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EmployeeFormModal } from "./EmployeeFormModal";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  importEmployeesFile,
} from "./actions";

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
  branch: Branch;
};

const ROLE_LABEL: Record<string, string> = {
  STAFF: "Staff",
  ADMIN: "Admin",
  SPV: "SPV",
};

export default function EmployeesClient({
  initialEmployees,
  branches,
}: {
  initialEmployees: Employee[];
  branches: Branch[];
}) {
  const router = useRouter();

  const [q, setQ] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const [detailData, setDetailData] = useState<Employee | null>(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return initialEmployees
      .filter((r) => (activeOnly ? r.isActive : true))
      .filter((r) => {
        if (!qq) return true;
        const hay = `${r.empNo} ${r.name} ${r.branch?.name} ${r.role} ${r.grade}`.toLowerCase();
        return hay.includes(qq);
      });
  }, [initialEmployees, q, activeOnly]);

  const money = (v: number | null) =>
    v ? `Rp ${new Intl.NumberFormat("id-ID").format(v)}` : "-";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Master Karyawan</h1>
          <p className="text-slate-600">
            Role + Grade dipakai untuk hitung payroll.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setImportOpen(true)}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Import
          </button>

          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Tambah Karyawan
          </button>
        </div>
      </div>

      {/* FILTER */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1 min-w-[260px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / EMP / cabang..."
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
            Total:{" "}
            <b className="text-slate-900">{filtered.length}</b>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-left">Karyawan</th>
              <th className="px-4 py-3 text-left">Cabang</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-right">Override</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">
                    {r.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {r.empNo}
                  </div>
                </td>

                <td className="px-4 py-3">{r.branch?.name}</td>
                <td className="px-4 py-3">
                  {ROLE_LABEL[r.role] ?? r.role}
                </td>
                <td className="px-4 py-3">{r.grade}</td>
                <td className="px-4 py-3 text-right">
                  {money(r.salaryOverride)}
                </td>

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
                      onClick={() => setDetailData(r)}
                      className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                      Detail
                    </button>

                    <button
                      onClick={() => {
                        setEditing(r);
                        setOpen(true);
                      }}
                      className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <form
                      action={async (fd) => {
                        if (!confirm(`Hapus ${r.name}?`)) return;
                        fd.set("id", r.id);
                        await deleteEmployee(fd);
                        router.refresh();
                      }}
                    >
                      <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100">
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-slate-600"
                >
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL */}
      <EmployeeFormModal
        open={open}
        onClose={() => setOpen(false)}
        branches={branches}
        editing={editing}
        createAction={createEmployee}
        updateAction={updateEmployee}
      />

      {/* IMPORT MODAL */}
     {/* IMPORT MODAL (CSV ONLY) */}
{importOpen && (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
    onClick={() => setImportOpen(false)}
  >
    <div
      className="mt-6 w-full max-w-xl rounded-2xl border bg-white p-5 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold">Import Karyawan (CSV)</div>
          <div className="text-xs text-slate-500">
            Upload file <b>.csv</b> (minimal kolom: <b>empNo</b>, <b>name</b>, <b>branchName</b>)
          </div>
        </div>
        <button
          className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
          onClick={() => setImportOpen(false)}
        >
          Tutup
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {/* Button-style file picker */}
        <div className="flex items-center gap-3">
          <label
            htmlFor="csv-file"
            className="cursor-pointer rounded-xl border bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Pilih File CSV
          </label>

          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />

          <div className="text-sm text-slate-700">
            {importFile ? (
              <span>
                <b>{importFile.name}</b>{" "}
                <span className="text-slate-500">
                  ({Math.round(importFile.size / 1024)} KB)
                </span>
              </span>
            ) : (
              <span className="text-slate-500">Belum ada file dipilih</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-slate-50 p-3 text-xs text-slate-600">
          Contoh header:
          <div className="mt-1 font-mono text-[11px] text-slate-700">
            empNo,name,branchName,role,grade,isActive
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
          onClick={() => setImportOpen(false)}
        >
          Batal
        </button>

        <button
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          disabled={!importFile}
          onClick={async () => {
            try {
              if (!importFile) return alert("Pilih file CSV dulu bro");
              const fd = new FormData();
              fd.set("file", importFile);
              const res = await importEmployeesFile(fd);
              alert(`Import sukses: ${(res as any)?.imported ?? 0} baris`);
              setImportOpen(false);
              setImportFile(null);
              router.refresh();
            } catch (e: any) {
              alert(e?.message ?? "Gagal import");
            }
          }}
        >
          Import
        </button>
      </div>
    </div>
  </div>
)}


      {/* DETAIL MODAL */}
      {detailData && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
          onClick={() => setDetailData(null)}
        >
          <div
            className="mt-6 w-full max-w-2xl rounded-2xl border bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-lg font-bold mb-4">
              Detail Karyawan
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="EMP No" value={detailData.empNo} />
              <Field label="Nama" value={detailData.name} />
              <Field label="Cabang" value={detailData.branch?.name} />
              <Field label="Role" value={detailData.role} />
              <Field label="Grade" value={detailData.grade} />
              <Field
                label="Status"
                value={detailData.isActive ? "Aktif" : "Nonaktif"}
              />
              <Field label="Gender" value={detailData.gender} />
              <Field label="Agama" value={detailData.religion} />
              <Field label="Pendidikan" value={detailData.education} />
              <Field label="Status Nikah" value={detailData.maritalStatus} />
              <Field label="No KTP" value={detailData.ktpNo} />
              <Field
                label="Tempat Lahir"
                value={detailData.birthPlace}
              />
            </div>

            <div className="mt-4 text-sm">
              <div className="font-semibold mb-1">Alamat</div>
              <div className="rounded-lg border p-3 bg-slate-50">
                {detailData.address}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="rounded-xl border px-4 py-2 text-sm"
                onClick={() => setDetailData(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: any;
}) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium">
        {value ?? "-"}
      </div>
    </div>
  );
}
