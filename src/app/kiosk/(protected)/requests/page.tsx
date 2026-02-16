"use client";
import { useRouter } from "next/navigation";

export default function RequestsMenu() {
  const r = useRouter();
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto rounded-2xl border bg-white p-5 space-y-3">
        <div className="text-xl font-extrabold">Menu Request</div>
        <button className="w-full rounded-xl border py-3 font-bold" onClick={() => r.push("/kiosk/requests/izin")}>Ajukan Izin</button>
        <button className="w-full rounded-xl border py-3 font-bold" onClick={() => r.push("/kiosk/requests/lembur")}>Ajukan Lembur</button>
        <button className="w-full rounded-xl border py-3 font-bold" onClick={() => r.push("/kiosk/requests/telat")}>Koreksi Telat</button>
        <button className="w-full rounded-xl border py-3 font-bold" onClick={() => r.push("/kiosk")}>← Kembali</button>
      </div>
    </div>
  );
}
