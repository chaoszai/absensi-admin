import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-[0_25px_60px_-30px_rgba(2,6,23,0.35)] p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Absensi System
            </h1>
            <p className="text-slate-500 mt-1">
              Portal Admin HR & SPV Area. Dashboard ada di <b>/admin</b>.
            </p>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 grid place-items-center">
            <span className="text-indigo-600 font-black">A</span>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-white font-semibold shadow hover:bg-indigo-700 transition"
          >
            Masuk Admin
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Buka /admin
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Next: kita sambung ke API (Postgres) + role HR/SPV + approvals.
        </div>
      </div>
    </main>
  );
}
