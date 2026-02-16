import { prisma } from "./db";

export type KioskAuthResult = {
  ok: true;
  sessionId: string;
  token: string;
  branchId: string;
  branchCode: string;
  branchName: string;
  radiusMeter: number;
  employeeId: string;
  empNo: string;
  employeeName: string;
};

export function json(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers || {}) },
  });
}

export function minutesSinceStartOfDay(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

export function minutesFromHHMM(hhmm: string) {
  // "08:30" => 510
  const [h, m] = hhmm.split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

export function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function requireKioskSession(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

  if (!token) return { ok: false as const, code: "NO_TOKEN", message: "Token kiosk tidak ada." };

  const sess = await prisma.kioskSession.findUnique({
    where: { token },
    include: {
      branch: true,
      employee: true,
    },
  });

  if (!sess) return { ok: false as const, code: "INVALID_TOKEN", message: "Token kiosk tidak valid." };
  if (sess.expiresAt.getTime() < Date.now())
    return { ok: false as const, code: "EXPIRED", message: "Session kiosk sudah expired." };

  return {
    ok: true as const,
    sessionId: sess.id,
    token,
    branchId: sess.branchId,
    branchCode: sess.branch.code,
    branchName: sess.branch.name,
    radiusMeter: sess.branch.radiusMeter,
    employeeId: sess.employeeId,
    empNo: sess.employee.empNo,
    employeeName: sess.employee.name,
  } satisfies KioskAuthResult;
}
