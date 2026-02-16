import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1400px] px-4 py-5">
        <div className="grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-4 lg:col-span-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white shadow-[0_25px_60px_-35px_rgba(2,6,23,0.55)] overflow-hidden">
              <div className="p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-500/20 grid place-items-center">
                    <span className="text-indigo-200 font-black">HR</span>
                  </div>
                  <div>
                    <div className="font-extrabold leading-tight">
                      Absensi Admin
                    </div>
                    <div className="text-xs text-white/60">
                      HR & SPV Area Dashboard
                    </div>
                  </div>
                </div>
              </div>

              <nav className="p-3 space-y-2">
                <NavItem href="/admin" label="Dashboard" />
                <NavItem href="/admin/attendance" label="Absensi" />
                <NavItem href="/admin/approvals" label="Approvals" />

                <div className="h-px bg-white/10 my-3" />

                <NavItem href="/admin/master/branches" label="Master Cabang" />
                <NavItem href="/admin/master/employees" label="Master Karyawan" />
                <NavItem href="/admin/contracts" label="Kontrak Karyawan" />

                <NavItem href="/admin/shift-rules" label="Shift Rules" />

                <div className="h-px bg-white/10 my-3" />

                <NavItem href="/admin/payroll-preview" label="Payroll Preview" />
              </nav>

              <div className="p-4 border-t border-white/10">
                <Link
                  href="/"
                  className="block w-full rounded-2xl bg-white/10 hover:bg-white/15 transition px-4 py-3 text-center text-sm font-semibold"
                >
                  Kembali ke Home
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="col-span-12 md:col-span-8 lg:col-span-9">
            <div className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-[0_25px_60px_-35px_rgba(2,6,23,0.25)] p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl px-4 py-3 text-sm text-white/85 hover:text-white hover:bg-white/10 transition"
    >
      {label}
    </Link>
  );
}
