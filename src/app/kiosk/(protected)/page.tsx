"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type KioskSessionLS = {
  token: string;
  employeeId: string;
  employeeName: string;
  empNo: string;
  branchId: string;
  branchCode: string;
  branchName: string;
};

type Contract = {
  id: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  status: string;
};

export default function KioskDashboard() {
  const r = useRouter();
  const [me, setMe] = useState<KioskSessionLS | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("kiosk_session");
    if (!raw) {
      r.replace("/kiosk/login");
      return;
    }
    try {
      const s = JSON.parse(raw);
      if (!s?.token) {
        r.replace("/kiosk/login");
        return;
      }
      setMe(s);
    } catch {
      r.replace("/kiosk/login");
    }
  }, [r]);

  async function refreshContract() {
    if (!me?.token) return;
    setInfo("");
    const res = await fetch("/api/kiosk/contract", {
      headers: { Authorization: `Bearer ${me.token}` },
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j?.ok) {
      setContract(null);
      setInfo(j?.message || "Gagal load kontrak");
      return;
    }
    setContract(j.contract ?? null);
  }

  useEffect(() => {
    if (me?.token) refreshContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.token]);

  const contractText = useMemo(() => {
    if (!contract) return "Belum ada kontrak aktif.";
    const end = new Date(contract.endDate);
    const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return `Kontrak ${contract.contractNo} • sisa ${days} hari (s/d ${end.toLocaleDateString()})`;
  }, [contract]);

  function logout() {
    localStorage.removeItem("kiosk_session");
    r.replace("/kiosk/login");
  }

  if (!me) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="rounded-2xl border bg-white p-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-extrabold">Dashboard Absensi (Kiosk)</div>
            <div className="text-sm text-slate-600 mt-1">
              {me.employeeName} • {me.empNo} — {me.branchName} ({me.branchCode})
            </div>
            {info && <div className="text-sm text-red-600 mt-2">{info}</div>}
          </div>
          <button onClick={logout} className="rounded-xl border px-4 py-2 font-semibold">
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-5">
            <div className="font-extrabold">Menu Absensi</div>
            <div className="text-sm text-slate-600 mt-1">Check-in / Check-out + validasi lokasi & keterlambatan.</div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => r.push("/kiosk/check-in")}
                className="rounded-xl bg-violet-600 text-white py-3 font-extrabold"
              >
                Check-in
              </button>
              <button
                onClick={() => r.push("/kiosk/check-out")}
                className="rounded-xl border py-3 font-extrabold"
              >
                Check-out
              </button>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="font-extrabold">Kontrak Karyawan</div>
            <div className="text-sm text-slate-700 mt-2">{contractText}</div>
            <button onClick={refreshContract} className="mt-3 rounded-xl border px-4 py-2 font-semibold">
              Refresh kontrak
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="font-extrabold">Menu Request</div>
          <div className="text-sm text-slate-600 mt-1">
            Ajukan Izin / Lembur / Telat (koreksi) → masuk approvals SPV/Admin.
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-3">
            <button onClick={() => r.push("/kiosk/requests/izin")} className="rounded-xl border py-3 font-bold">
              Ajukan Izin
            </button>
            <button onClick={() => r.push("/kiosk/requests/lembur")} className="rounded-xl border py-3 font-bold">
              Ajukan Lembur
            </button>
            <button onClick={() => r.push("/kiosk/requests/telat")} className="rounded-xl border py-3 font-bold">
              Koreksi Telat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
