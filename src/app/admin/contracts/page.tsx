export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { createContract, deleteContract } from "./actions";
import fs from "node:fs/promises";
import path from "node:path";


async function readMasterTemplate() {
  const templatePath = path.join(process.cwd(), "src", "templates", "kontrak-karyawan.html");
  try {
    return await fs.readFile(templatePath, "utf-8");
  } catch {
    return "";
  }
}

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fmtRange(a: Date, b: Date) {
  return `${fmtDate(a)} → ${fmtDate(b)}`;
}

export default async function ContractsPage() {
  const [employees, contracts, masterTemplate] = await Promise.all([
    prisma.employee.findMany({
      include: { branch: true },
      orderBy: { name: "asc" },
    }),
    prisma.employeeContract.findMany({
      include: { employee: { include: { branch: true } } },
      orderBy: { createdAt: "desc" },
    }),
    readMasterTemplate(),
  ]);

  const today = new Date();
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const masterLen = masterTemplate.trim().length;

  return (
    <div className="p-6">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
        <div className="text-xl font-bold">Kontrak Karyawan</div>
        <div className="text-sm text-white/60 mt-1">
          Buat kontrak karyawan + generate PDF dari template HTML.
        </div>

        {masterLen === 0 && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm">
            <div className="font-semibold text-red-200">⚠️ Master template kosong / tidak terbaca</div>
            <div className="text-red-200/80 mt-1">
              Pastikan file ini ada dan berisi HTML:
              <span className="font-mono"> src/templates/kontrak-karyawan.html</span>
            </div>
            <div className="text-red-200/80 mt-1">
              Cek cepat di terminal:
              <span className="font-mono"> wc -c src/templates/kontrak-karyawan.html</span>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm font-semibold">Tambah Kontrak</div>

        <form action={createContract} className="mt-3 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              name="employeeId"
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
              defaultValue=""
              required
            >
              <option value="" disabled>
                Pilih karyawan
              </option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.empNo}) — {e.branch?.name || "-"}
                </option>
              ))}
            </select>

            {/* contractNo tidak perlu input karena auto-generated di action */}
            <input
              disabled
              value="Auto: CTR-YYYY-0001"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              name="startDate"
              defaultValue={fmtDate(today)}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
              required
            />
            <input
              type="date"
              name="endDate"
              defaultValue={fmtDate(nextYear)}
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              name="status"
              defaultValue="ACTIVE"
              className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ENDED">ENDED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/60">
              Template default otomatis dari file master (biar gak pernah kosong).
            </div>
          </div>

          <textarea
            name="template"
            defaultValue={masterTemplate}
            placeholder="Template HTML kontrak…"
            className="w-full min-h-[220px] rounded-xl bg-white/10 border border-white/10 px-4 py-3 font-mono text-xs outline-none"
          />

          <button
            type="submit"
            className="rounded-xl bg-indigo-500/80 hover:bg-indigo-500 px-5 py-3 text-sm font-semibold"
          >
            Simpan Kontrak
          </button>
        </form>

        <div className="mt-8 h-px bg-white/10" />

        <div className="mt-6 text-sm font-semibold">Daftar Kontrak</div>

        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="px-4 py-3 text-left">Nomor</th>
                <th className="px-4 py-3 text-left">Karyawan</th>
                <th className="px-4 py-3 text-left">Cabang</th>
                <th className="px-4 py-3 text-left">Periode</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/60">
                    Belum ada kontrak.
                  </td>
                </tr>
              )}

              {contracts.map((c) => (
                <tr key={c.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold">{c.contractNo}</td>
                  <td className="px-4 py-3">
                    {c.employee.name} <span className="text-white/60">({c.employee.empNo})</span>
                  </td>
                  <td className="px-4 py-3">{c.employee.branch?.name || "-"}</td>
                  <td className="px-4 py-3 text-white/80">{fmtRange(c.startDate, c.endDate)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{c.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <a
                        href={`/admin/contracts/${c.id}/pdf`}
                        className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        PDF
                      </a>

                      <a
                        href={`/admin/contracts/${c.id}/pdf?debug=html`}
                        className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Debug HTML
                      </a>

                      <a
                        href={`/admin/contracts/${c.id}/pdf?debug=png`}
                        className="rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-xs"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Debug PNG
                      </a>

                      <form action={deleteContract}>
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-red-500/20 hover:bg-red-500/30 px-3 py-2 text-xs text-red-100"
                        >
                          Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-white/50">
          Tips: kalau PDF blank, klik <b>Debug HTML</b> dan pastikan HTML-nya ada isi di body. Kalau
          body kosong → template kosong.
        </div>
      </div>
    </div>
  );
}
