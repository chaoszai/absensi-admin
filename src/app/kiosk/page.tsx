"use client";

import { useEffect, useState } from "react";
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

export default function KioskDashboardPage() {
  const r = useRouter();
  const [me, setMe] = useState<KioskSessionLS | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("kiosk_session");
    if (!raw) {
      r.replace("/kiosk/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.token) return r.replace("/kiosk/login");
      setMe(parsed);
    } catch {
      r.replace("/kiosk/login");
    }
  }, [r]);

  function logout() {
    localStorage.removeItem("kiosk_session");
    r.replace("/kiosk/login");
  }

  if (!me) return null;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ border: "1px solid rgba(0,0,0,.12)", borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Dashboard Absensi (Kiosk)</div>
          <div style={{ opacity: 0.7, marginTop: 4 }}>
            {me.employeeName} • {me.empNo} — {me.branchName} ({me.branchCode})
          </div>
        </div>
        <button onClick={logout} style={{ height: 36, padding: "0 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,.12)" }}>
          Logout
        </button>
      </div>

      <div style={{ height: 14 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button
          onClick={() => r.push("/kiosk/check-in")}
          style={{
            width: "100%",
            borderRadius: 16,
            padding: 18,
            border: "1px solid rgba(0,0,0,.12)",
            background: "#6d28d9",
            color: "white",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900 }}>Check-in</div>
          <div style={{ opacity: 0.9, marginTop: 4 }}>Masuk kerja (IN)</div>
        </button>

        <button
          onClick={() => r.push("/kiosk/check-out")}
          style={{
            width: "100%",
            borderRadius: 16,
            padding: 18,
            border: "1px solid rgba(0,0,0,.12)",
            background: "white",
            textAlign: "left",
            cursor: "pointer",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900 }}>Check-out</div>
          <div style={{ opacity: 0.8, marginTop: 4 }}>Pulang (OUT)</div>
        </button>
      </div>
    </div>
  );
}
