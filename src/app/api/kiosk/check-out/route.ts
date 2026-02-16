import { prisma } from "@/lib/db";
import { json, requireKioskSession, distanceMeters } from "@/lib/kioskAuth";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export async function POST(req: Request) {
  const auth = await requireKioskSession(req);
  if (!auth.ok) return json(auth, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { mode, lat, lng } = body || {};

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const inLog = await prisma.attendanceLog.findFirst({
    where: { employeeId: auth.employeeId, type: "IN", date: { gte: dayStart, lte: dayEnd } },
    orderBy: { createdAt: "desc" },
  });
  if (!inLog) {
    return json({ ok: false, code: "NO_CHECKIN", message: "Kamu belum check-in hari ini." }, { status: 400 });
  }

  const outLog = await prisma.attendanceLog.findFirst({
    where: { employeeId: auth.employeeId, type: "OUT", date: { gte: dayStart, lte: dayEnd } },
  });
  if (outLog) {
    return json({ ok: false, code: "ALREADY_CHECKED_OUT", message: "Kamu sudah check-out hari ini." }, { status: 400 });
  }

  const modeStr = String(mode || inLog.mode || "NORMAL").toUpperCase();
  let distanceM: number | null = null;
  let flags: string[] = [];
  let finalStatus: "VALID" | "NEED_REVIEW" = "VALID";

  if (typeof lat === "number" && typeof lng === "number") {
    const branch = await prisma.branch.findUnique({ where: { id: auth.branchId } });
    if (branch) {
      distanceM = distanceMeters(lat, lng, branch.lat, branch.lng);
      if (modeStr === "NORMAL" && distanceM > branch.radiusMeter) {
        flags.push("OUT_OF_RADIUS");
        finalStatus = "NEED_REVIEW";
      } else if (modeStr !== "NORMAL") {
        flags.push("MODE_" + modeStr);
      }
    }
  } else {
    flags.push("NO_GEO");
    finalStatus = "NEED_REVIEW";
  }

  const created = await prisma.attendanceLog.create({
    data: {
      employeeId: auth.employeeId,
      branchId: auth.branchId,
      date: now,
      type: "OUT",
      shiftCode: inLog.shiftCode,
      mode: modeStr,
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      distanceM: distanceM ?? null,
      lateMinutes: 0,
      flags: flags.length ? JSON.stringify(flags) : null,
      finalStatus,
    },
  });

  return json({ ok: true, message: "Check-out berhasil ✅", distanceM, flags, finalStatus, id: created.id });
}
