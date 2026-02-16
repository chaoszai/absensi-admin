"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Branch = { id: string; code: string; name: string; lat: number; lng: number; radiusMeter: number };
type Employee = { id: string; empNo: string; name: string; branchId: string };

export default function KioskLoginPage() {
  const r = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branchId, setBranchId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/kiosk/meta")
      .then((x) => x.json())
      .then((d) => {
        setBranches(d.branches ?? []);
        setEmployees(d.employees ?? []);
      })
      .catch(() => setErr("Gagal load data kiosk"));
  }, []);

  const filteredEmployees = useMemo(() => employees.filter((e) => e.branchId === branchId), [employees, branchId]);

  async function onSubmit() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/kiosk/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ branchId, employeeId, pin }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.message || "Login gagal");

      localStorage.setItem("kiosk_session", JSON.stringify(j.session));
      r.replace("/kiosk");
    } catch (e: any) {
      setErr(e?.message || "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-white shadow-sm p-6">
        <div className="text-xl font-extrabold">Absensi Online (Kiosk)</div>
        <div className="text-sm text-slate-500 mt-1">Login per cabang → pilih karyawan (PIN dummy: 1234)</div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-semibold">Cabang</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-3"
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setEmployeeId("");
              }}
            >
              <option value="">Pilih cabang...</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} • {b.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">Karyawan</label>
            <select
              className="mt-1 w-full rounded-xl border px-3 py-3"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              disabled={!branchId}
            >
              <option value="">{branchId ? "Pilih karyawan..." : "Pilih cabang dulu"}</option>
              {filteredEmployees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} • {e.empNo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold">PIN Cabang</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-3"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="dummy: 1234"
            />
          </div>

          {err && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

          <button
            className="w-full rounded-xl bg-violet-600 text-white py-3 font-semibold disabled:opacity-60"
            disabled={loading}
            onClick={onSubmit}
          >
            {loading ? "Loading..." : "Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
