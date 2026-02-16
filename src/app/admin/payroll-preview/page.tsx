import { prisma } from "@/lib/db";
import { getPayrollPreview } from "@/lib/payroll";

function parseDate(s?: string) {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export default async function PayrollPreviewPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string; branchId?: string };
}) {
  const now = new Date();
  const from =
    parseDate(searchParams.from) ??
    new Date(now.getFullYear(), now.getMonth(), 1);
  const to = parseDate(searchParams.to) ?? now;

  const branchId = searchParams.branchId || "";

  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
  });

  const { rows, summary } = await getPayrollPreview({
    from,
    to,
    branchId: branchId || undefined,
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="text-2xl font-bold">Payroll Preview</div>
        <div className="text-sm text-white/60">
          Simulasi gaji berdasarkan absensi & rules
        </div>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white/5 border border-white/10 p-3 rounded-2xl">
        <div>
          <div className="text-xs text-white/60 mb-1">Dari</div>
          <input
            name="from"
            type="date"
            defaultValue={from.toISOString().slice(0, 10)}
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
          />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Sampai</div>
          <input
            name="to"
            type="date"
            defaultValue={to.toISOString().slice(0, 10)}
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
          />
        </div>
        <div>
          <div className="text-xs text-white/60 mb-1">Cabang</div>
          <select
            name="branchId"
            defaultValue={branchId}
            className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2"
          >
            <option value="">Semua cabang</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full rounded-xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-white/10 px-3 py-2 font-semibold">
            Terapkan
          </button>
        </div>
      </form>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat title="Karyawan" value={summary.employees} />
        <Stat title="Total Gross" value={rupiah(summary.totalGross)} />
        <Stat title="Total Net" value={rupiah(summary.totalNet)} />
        <Stat title="Total Telat (menit)" value={summary.totalLateMinutes} />
      </div>

      <div className="overflow-auto rounded-2xl border border-white/10">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <Th>EmpNo</Th>
              <Th>Nama</Th>
              <Th>Cabang</Th>
              <Th className="text-right">Hadir</Th>
              <Th className="text-right">Alfa</Th>
              <Th className="text-right">Telat</Th>
              <Th className="text-right">Gross</Th>
              <Th className="text-right">Pot. Telat</Th>
              <Th className="text-right">Pot. Alfa</Th>
              <Th className="text-right">Net</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.empNo} className="border-t border-white/10">
                <Td>{r.empNo}</Td>
                <Td className="font-semibold">{r.name}</Td>
                <Td className="text-white/70">{r.branch}</Td>
                <Td className="text-right">{r.present}</Td>
                <Td className="text-right">{r.absent}</Td>
                <Td className="text-right">{r.lateMinutes}</Td>
                <Td className="text-right">{rupiah(r.gross)}</Td>
                <Td className="text-right">{rupiah(r.lateCut)}</Td>
                <Td className="text-right">{rupiah(r.absentCut)}</Td>
                <Td className="text-right font-bold">{rupiah(r.net)}</Td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="p-6 text-center text-white/60">
                  Belum ada data untuk range ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: any }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="text-xs text-white/60">{title}</div>
      <div className="text-xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function Th({ children, className = "" }: any) {
  return <th className={`px-3 py-2 ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: any) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
