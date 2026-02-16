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

type GeoState = {
  ok: boolean;
  lat?: number;
  lng?: number;
  error?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function formatStamp(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export default function CheckInPage() {
  const r = useRouter();

  const [me, setMe] = useState<KioskSessionLS | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // shift & mode
  const [shiftCode, setShiftCode] = useState<string>("SHIFT_1");
  const [mode, setMode] = useState<"NORMAL" | "OFFSITE" | "WFH">("NORMAL");

  // geo
  const [geo, setGeo] = useState<GeoState>({ ok: false });

  // camera
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("kiosk_session");
    if (!raw) {
      r.replace("/kiosk/login");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.token) {
        r.replace("/kiosk/login");
        return;
      }
      setMe(parsed);
    } catch {
      r.replace("/kiosk/login");
    }
  }, [r]);

  const canSubmit = useMemo(() => {
    return !!me?.token && geo.ok && !!photoBase64 && !loading;
  }, [me?.token, geo.ok, photoBase64, loading]);

  async function getLocation() {
    setStatus("");
    setGeo({ ok: false });

    if (!navigator.geolocation) {
      setGeo({ ok: false, error: "Browser tidak support geolocation" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          ok: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setGeo({
          ok: false,
          error: err?.message || "Gagal ambil lokasi",
        });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  async function startCamera() {
    setStatus("");
    setPhotoBase64(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

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

  function stopCamera() {
    const stream = streamRef.current;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  function capturePhoto() {
    setStatus("");
    const video = videoRef.current;
    if (!video || !me) return;

    const w = video.videoWidth || 960;
    const h = video.videoHeight || 720;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // draw video
    ctx.drawImage(video, 0, 0, w, h);

    // watermark box
    const stamp = formatStamp(new Date());
    const latlng =
      geo.ok && geo.lat != null && geo.lng != null
        ? `${geo.lat.toFixed(6)}, ${geo.lng.toFixed(6)}`
        : "-";

    const lines = [
      `${me.empNo} • ${me.employeeName} • ${me.branchCode}`,
      stamp,
      `Lat/Lng: ${latlng}`,
    ];

    const padding = Math.round(w * 0.02);
    const boxW = Math.round(w * 0.55);
    const boxH = Math.round(h * 0.14);

    const x = padding;
    const y = h - boxH - padding;

    // background translucent
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(x, y, boxW, boxH);

    // text
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.font = `${Math.round(h * 0.03)}px ui-sans-serif, system-ui, -apple-system, Segoe UI`;
    ctx.textBaseline = "top";

    let ty = y + Math.round(boxH * 0.18);
    for (const line of lines) {
      ctx.fillText(line, x + Math.round(boxW * 0.05), ty);
      ty += Math.round(boxH * 0.28);
    }

    // JPG (lebih kecil)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
    setPhotoBase64(dataUrl);

    // stop camera biar ringan
    stopCamera();
  }

  async function submit() {
    if (!me) return;

    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/kiosk/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${me.token}`,
        },
        body: JSON.stringify({
          shiftCode,
          mode,
          lat: geo.lat,
          lng: geo.lng,
          photoBase64, // nanti bisa disimpan ke storage
        }),
      });

      const j = await res.json().catch(() => ({}));

      if (!res.ok || !j?.ok) {
        // pesan spesifik
        const msg = j?.message || "Gagal check-in";
        setStatus(msg);
        return;
      }

      // tampilkan hasil
      const late = j?.lateMinutes ?? 0;
      const dist = j?.distanceM != null ? Math.round(j.distanceM) : "-";
      const flags = Array.isArray(j?.flags) && j.flags.length ? ` (${j.flags.join(", ")})` : "";

      setStatus(`Check-in sukses ✅ Telat: ${late} menit • Jarak: ${dist}m${flags}`);

      // balik dashboard (biar flow enak)
      setTimeout(() => r.replace("/kiosk"), 700);
    } catch (e: any) {
      setStatus(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // auto prepare
    getLocation();
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!me) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="rounded-2xl border bg-white p-5">
          <div className="text-xl font-extrabold">Check-in</div>
          <div className="text-sm text-slate-600 mt-1">
            {me.employeeName} • {me.empNo} — {me.branchName} ({me.branchCode})
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border bg-white p-5 space-y-3">
            <div className="font-extrabold">Pengaturan</div>

            <div>
              <div className="text-sm font-bold">Shift</div>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-3"
                value={shiftCode}
                onChange={(e) => setShiftCode(e.target.value)}
              >
                <option value="SHIFT_1">SHIFT_1</option>
                <option value="SHIFT_2">SHIFT_2</option>
              </select>
            </div>

            <div>
              <div className="text-sm font-bold">Mode</div>
              <select
                className="mt-1 w-full rounded-xl border px-3 py-3"
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
              >
                <option value="NORMAL">NORMAL (radius)</option>
                <option value="OFFSITE">OFFSITE</option>
                <option value="WFH">WFH</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 space-y-3">
            <div className="font-extrabold">Lokasi</div>
            <div className="text-sm">
              {geo.ok ? (
                <div>
                  Lokasi OK ✅ <br />
                  Lat/Lng: {geo.lat}, {geo.lng}
                </div>
              ) : (
                <div>
                  Lokasi belum siap ❌ <br />
                  <span className="text-red-600">{geo.error || ""}</span>
                </div>
              )}
            </div>

            <button
              onClick={getLocation}
              disabled={loading}
              className="rounded-xl border px-4 py-2 font-semibold"
            >
              Ambil Lokasi
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <div className="font-extrabold mb-3">Kamera</div>

          {!photoBase64 ? (
            <div className="grid md:grid-cols-[420px_1fr] gap-4 items-start">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full rounded-xl bg-black"
              />
              <div className="space-y-2">
                <button
                  onClick={startCamera}
                  disabled={loading}
                  className="w-full rounded-xl border px-4 py-3 font-semibold"
                >
                  {cameraReady ? "Kamera aktif ✅" : "Nyalakan Kamera"}
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={loading || !cameraReady}
                  className="w-full rounded-xl bg-slate-900 text-white px-4 py-3 font-extrabold disabled:opacity-60"
                >
                  Ambil Foto (Watermark)
                </button>
                <button
                  onClick={stopCamera}
                  disabled={loading}
                  className="w-full rounded-xl border px-4 py-3 font-semibold"
                >
                  Matikan Kamera
                </button>
                <div className="text-xs text-slate-500">
                  Wajib ambil foto dulu sebelum absen.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-[420px_1fr] gap-4 items-start">
              <img src={photoBase64} alt="Preview" className="w-full rounded-xl border" />
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setPhotoBase64(null);
                    startCamera();
                  }}
                  disabled={loading}
                  className="w-full rounded-xl border px-4 py-3 font-semibold"
                >
                  Ulang Foto
                </button>
                <div className="text-xs text-slate-500">Foto siap ✅</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={submit}
            disabled={!canSubmit}
            className={`rounded-xl px-5 py-3 font-extrabold ${
              canSubmit ? "bg-violet-600 text-white" : "bg-slate-200 text-slate-500"
            }`}
          >
            {loading ? "Menyimpan..." : "Absen Masuk"}
          </button>

          <button
            onClick={() => r.push("/kiosk")}
            disabled={loading}
            className="rounded-xl border px-5 py-3 font-bold"
          >
            ← Kembali
          </button>
        </div>

        {status && (
          <div className="rounded-2xl border bg-white p-4 text-sm">{status}</div>
        )}
      </div>
    </div>
  );
}
