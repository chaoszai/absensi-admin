"use client";

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
  branch?: Branch;
};

export function EmployeeDetailModal({
  open,
  onClose,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  employee: Employee | null;
}) {
  if (!open || !employee) return null;

  const fmtDate = (d: any) => {
    if (!d) return "-";
    const dd = typeof d === "string" ? new Date(d) : new Date(d);
    if (isNaN(dd.getTime())) return String(d);
    return dd.toISOString().slice(0, 10);
  };

  const money = (v: number | null) =>
    v == null ? "-" : `Rp ${new Intl.NumberFormat("id-ID").format(v)}`;

  const Item = ({ label, value }: { label: string; value: any }) => (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="text-[11px] font-bold text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {value || value === 0 ? String(value) : "-"}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="mt-6 w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <div className="text-sm font-extrabold text-slate-900">Detail Karyawan</div>
            <div className="text-xs text-slate-500">{employee.empNo} • {employee.name}</div>
          </div>
          <button
            className="rounded-xl border px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Item label="EMP No" value={employee.empNo} />
            <Item label="Nama" value={employee.name} />
            <Item label="Cabang" value={employee.branch?.name ?? employee.branchId} />
            <Item label="Role" value={employee.role} />
            <Item label="Grade" value={employee.grade} />
            <Item label="Override Gaji" value={money(employee.salaryOverride)} />
            <Item label="Status" value={employee.isActive ? "Aktif" : "Nonaktif"} />
            <Item label="Jenis Kelamin" value={employee.gender} />
            <Item label="Tempat Lahir" value={employee.birthPlace} />
            <Item label="Tanggal Lahir" value={fmtDate(employee.birthDate)} />
            <Item label="Agama" value={employee.religion} />
            <Item label="Pendidikan" value={employee.education} />
            <Item label="Status Nikah" value={employee.maritalStatus} />
            <Item label="No KTP" value={employee.ktpNo} />
            <div className="sm:col-span-2 rounded-xl border border-slate-200 p-3">
              <div className="text-[11px] font-bold text-slate-600">Alamat</div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {employee.address || "-"}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-5">
          <div className="flex justify-end">
            <button
              className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              onClick={onClose}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
