import { prisma } from "@/lib/db";
import { json, requireKioskSession } from "@/lib/kioskAuth";

export async function POST(req: Request) {
  const auth = await requireKioskSession(req);
  if (!auth.ok) return json(auth, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { type, dateFrom, dateTo, reason } = body || {};

  const t = String(type || "").toUpperCase(); // IZIN | LEMBUR | TELAT
  if (!["IZIN", "LEMBUR", "TELAT"].includes(t)) {
    return json({ ok: false, message: "Type request tidak valid." }, { status: 400 });
  }
  if (!dateFrom || !dateTo) return json({ ok: false, message: "Tanggal wajib diisi." }, { status: 400 });

  const created = await prisma.request.create({
    data: {
      employeeId: auth.employeeId,
      type: t,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      reason: reason ? String(reason) : null,
      status: "PENDING",
    },
  });

  return json({ ok: true, message: "Request terkirim ✅", id: created.id });
}
