import { attendanceSample, approvalsSample } from "./dummy";

export default function DashboardHR() {
  const today = "2026-02-05"; // nanti ganti ke hari ini beneran (server) saat backend udah siap

  const todayRows = attendanceSample.filter((r) => r.date === today);

  const hadir = todayRows.filter(
    (r) => r.status === "on_time" || r.status === "late" || r.status === "missing_out"
  ).length;

  const telat = todayRows.filter((r) => r.status === "late").length;

  const pending = approvalsSample.length;

  const lembur = approvalsSample.filter((a) => a.type === "lembur").length;

  const needAction = todayRows
    .filter((r) => r.status === "late" || r.status === "missing_in" || r.status === "missing_out")
    .slice(0, 5);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Dashboard HR
          </h1>
          <p className="mt-1 text-slate-600">
            Ringkasan absensi, telat (tanpa toleransi), lembur, cuti, izin.
          </p>
        </div>

        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
          Status: <b className="text-indigo-600">MVP</b>
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard title="Hadir Hari Ini" value={String(hadir)} />
        <StatCard title="Telat Hari Ini" value={String(telat)} tone="danger" />
        <StatCard title="Request Pending" value={String(pending)} tone="warning" />
        <StatCard title="Lembur Hari Ini" value={String(lembur)} tone="success" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-extrabold text-slate-900">Need Action (Hari Ini)</p>
            <a
              href="/admin/attendance"
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              Lihat semua →
            </a>
          </div>

          {needAction.length === 0 ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Aman. Tidak ada telat / missing hari ini.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {needAction.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {r.employeeName} <span className="text-slate-500">({r.employeeId})</span>
                    </p>
                    <p className="text-xs text-slate-600">
                      {r.branchName} • {r.shift} •{" "}
                      {r.status === "late"
                        ? `Telat ${r.lateMinutes ?? 0}m`
                        : r.status === "missing_in"
                        ? "Belum absen masuk"
                        : "Belum absen pulang"}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-1 text-xs font-bold ${
                      r.status === "late"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {r.status === "late" ? "Late" : "Missing"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-extrabold text-slate-900">Pending Approvals</p>

          {approvalsSample.length === 0 ? (
            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Tidak ada request pending.
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {approvalsSample.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                >
                  <p className="text-sm font-bold text-slate-900">{a.employeeName}</p>
                  <p className="text-xs text-slate-600">
                    {a.branchName} • {a.type.toUpperCase()} • {a.date}
                  </p>
                  <p className="mt-1 text-xs text-slate-700">{a.reason}</p>
                </div>
              ))}
              <a
                href="/admin/approvals"
                className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
              >
                Buka approvals →
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
        Next step: rapihin filter & export di <b>/admin/attendance</b> lalu sambungin ke API.
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  tone = "normal",
}: {
  title: string;
  value: string;
  tone?: "normal" | "danger" | "warning" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : tone === "warning"
      ? "border-amber-200 bg-amber-50"
      : tone === "success"
      ? "border-emerald-200 bg-emerald-50"
      : "border-slate-200 bg-white";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200">
        <div className="h-1.5 w-1/3 rounded-full bg-indigo-600" />
      </div>
    </div>
  );
}
