"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type GeoState = { ok: boolean; lat?: number; lng?: number; error?: string };

export default function CheckOutPage() {
  const r = useRouter();
  const [me, setMe] = useState<KioskSessionLS | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<"NORMAL" | "OFFSITE" | "WFH">("NORMAL");
  const [geo, setGeo] = useState<GeoState>({ ok: false });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("kiosk_session");
    if (!raw) return r.replace("/kiosk/login");
    try {
      const s = JSON.parse(raw);
      if (!s?.token) return r.replace("/kiosk/login");
      setMe(s);
    } catch {
      r.replace("/kiosk/login");
    }
  }, [r]);

  const canSubmit = useMemo(() => !!me?.token && geo.ok && !!photoBase64 && !loading, [me?.token, geo.ok, photoBase64, loading]);

  function stopCamera() {
    const stream = streamRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  async function getLocation() {
    setStatus("");
    setGeo({ ok: false });
    navigator.geolocation.getCurrentPosition(
      (pos) => setGeo({ ok: true, lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGeo({ ok: false, error: err?.message || "Gagal ambil lokasi" }),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function startCamera() {
    setStatus("");
    setPhotoBase64(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (e: any) {
      setCameraReady(false);
      setStatus(e?.message || "Gagal akses kamera");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
    setPhotoBase64(dataUrl);
    stopCamera();
  }

  async function submit() {
    if (!me) return;
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/kiosk/check-out", {
        method: "POST",
        headers: { "content-type": "application/json", Authorization: `Bearer ${me.token}` },
        body: JSON.stringify({ mode, lat: geo.lat, lng: geo.lng, photoBase64 }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) throw new Error(j?.message || "Gagal check-out");
      setStatus("Check-out sukses ✅");
    } catch (e: any) {
      setStatus(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getLocation();
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!me) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xl font-extrabold">Check-out</div>
          <div className="text-sm text-slate-600 mt-1">
            {me.employeeName} • {me.empNo} — {me.branchName} ({me.branchCode})
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 grid md:grid-cols-2 gap-4">
          <div>
            <div className="font-bold">Mode</div>
            <select className="mt-2 w-full rounded-xl border px-3 py-3" value={mode} onChange={(e) => setMode(e.target.value as any)}>
              <option value="NORMAL">NORMAL (radius)</option>
              <option value="OFFSITE">OFFSITE</option>
              <option value="WFH">WFH</option>
            </select>

            <div className="mt-4 font-bold">Lokasi</div>
            <div className="text-sm mt-2">
              {geo.ok ? `OK ✅ ${geo.lat}, ${geo.lng}` : <span className="text-red-600">{geo.error || "Belum siap"}</span>}
            </div>
            <button className="mt-3 rounded-xl border px-4 py-2 font-semibold" onClick={getLocation} disabled={loading}>
              Ambil Lokasi
            </button>
          </div>

          <div>
            <div className="font-bold">Kamera</div>
            {!photoBase64 ? (
              <div className="mt-2">
                <video ref={videoRef} playsInline muted className="w-full rounded-xl bg-black" />
                <div className="mt-3 flex gap-2 flex-wrap">
                  <button className="rounded-xl border px-4 py-2 font-semibold" onClick={startCamera} disabled={loading}>
                    {cameraReady ? "Kamera aktif ✅" : "Nyalakan Kamera"}
                  </button>
                  <button className="rounded-xl bg-slate-900 text-white px-4 py-2 font-bold" onClick={capturePhoto} disabled={loading || !cameraReady}>
                    Ambil Foto
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <img src={photoBase64} alt="Preview" className="w-full rounded-xl border" />
                <button className="mt-3 rounded-xl border px-4 py-2 font-semibold" onClick={() => { setPhotoBase64(null); startCamera(); }} disabled={loading}>
                  Ulang Foto
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`rounded-xl px-5 py-3 font-extrabold ${canSubmit ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500"}`}
          >
            {loading ? "Menyimpan..." : "Absen Pulang"}
          </button>
          <button onClick={() => r.push("/kiosk")} className="rounded-xl border px-5 py-3 font-bold" disabled={loading}>
            ← Kembali
          </button>
        </div>

        {status && <div className="rounded-2xl border bg-white p-4">{status}</div>}
      </div>
    </div>
  );
}
