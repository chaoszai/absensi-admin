"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = { token: string };

export default function RequestIzinPage() {
  const r = useRouter();
  const [token, setToken] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("kiosk_session");
    if (!raw) return r.replace("/kiosk/login");
    const s = JSON.parse(raw) as Session;
    if (!s?.token) return r.replace("/kiosk/login");
    setToken(s.token);
  }, [r]);

  async function submit() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/kiosk/requests", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: "IZIN", dateFrom, dateTo, reason }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.message || "Gagal kirim request");
      setStatus("Request izin terkirim ✅");
    } catch (e: any) {
      setStatus(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl border bg-white p-5 space-y-3">
        <div className="text-xl font-extrabold">Ajukan Izin</div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm font-bold">Dari tanggal</div>
            <input className="mt-1 w-full rounded-xl border px-3 py-3" type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <div className="text-sm font-bold">Sampai tanggal</div>
            <input className="mt-1 w-full rounded-xl border px-3 py-3" type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="text-sm font-bold">Alasan</div>
          <textarea className="mt-1 w-full rounded-xl border px-3 py-3" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={submit} disabled={loading} className="rounded-xl bg-violet-600 text-white px-5 py-3 font-extrabold">
            {loading ? "Mengirim..." : "Kirim"}
          </button>
          <button onClick={() => r.push("/kiosk")} disabled={loading} className="rounded-xl border px-5 py-3 font-bold">
            ← Kembali
          </button>
        </div>

        {status && <div className="rounded-xl border p-3">{status}</div>}
      </div>
    </div>
  );
}
