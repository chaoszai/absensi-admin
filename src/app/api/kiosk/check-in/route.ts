import { prisma } from "@/lib/db";
import {
  json,
  requireKioskSession,
  distanceMeters,
  minutesFromHHMM,
  minutesSinceStartOfDay,
} from "@/lib/kioskAuth";

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
  const { shiftCode, mode, lat, lng } = body || {};

  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  // sudah IN hari ini?
  const existing = await prisma.attendanceLog.findFirst({
    where: {
      employeeId: auth.employeeId,
      type: "IN",
      date: { gte: dayStart, lte: dayEnd },
    },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return json(
      {
        ok: false,
        code: "ALREADY_CHECKED_IN",
        message: "Kamu sudah check-in hari ini.",
        details: { checkedInAt: existing.createdAt },
      },
      { status: 400 }
    );
  }

  // shift rule
  const rule = shiftCode
    ? await prisma.shiftRule.findFirst({
        where: { branchId: auth.branchId, code: String(shiftCode), isActive: true },
      })
    : null;

  const workStartMin = rule ? minutesFromHHMM(rule.workStart) : minutesFromHHMM("08:00");
  const tol = rule?.lateToleranceMin ?? 0;
  const nowMin = minutesSinceStartOfDay(now);
  const lateMinutes = Math.max(0, nowMin - (workStartMin + tol));

  const modeStr = String(mode || "NORMAL").toUpperCase();

  let distanceM: number | null = null;
  let flags: string[] = [];
  let finalStatus: "VALID" | "NEED_REVIEW" = "VALID";

  if (typeof lat === "number" && typeof lng === "number") {
    // ambil titik cabang
    const branch = await prisma.branch.findUnique({ where: { id: auth.branchId } });
    if (branch) {
      distanceM = distanceMeters(lat, lng, branch.lat, branch.lng);

      if (modeStr === "NORMAL") {
        if (distanceM > branch.radiusMeter) {
          flags.push("OUT_OF_RADIUS");
          finalStatus = "NEED_REVIEW";
        }
      } else {
        flags.push("MODE_" + modeStr);
        // OFFSITE/WFH -> biarkan VALID, tapi tetap tandai
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
      type: "IN",
      shiftCode: rule?.code ?? (shiftCode ? String(shiftCode) : null),
      mode: modeStr,
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      distanceM: distanceM ?? null,
      lateMinutes,
      flags: flags.length ? JSON.stringify(flags) : null,
      finalStatus,
    },
  });

  return json({
    ok: true,
    message:
      finalStatus === "VALID"
        ? "Check-in berhasil ✅"
        : "Check-in berhasil, tapi butuh review (cek lokasi / data).",
    lateMinutes,
    distanceM,
    flags,
    finalStatus,
    id: created.id,
  });
}
