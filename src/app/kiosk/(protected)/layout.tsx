"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KioskProtectedLayout({ children }: { children: React.ReactNode }) {
  const r = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("kiosk_session");
    if (!raw) {
      r.replace("/kiosk/login");
      return;
    }
    try {
      const s = JSON.parse(raw);
      if (!s?.token) r.replace("/kiosk/login");
    } catch {
      r.replace("/kiosk/login");
    }
  }, [r]);

  return <>{children}</>;
}
