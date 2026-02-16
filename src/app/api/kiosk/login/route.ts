import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const branchId = String(body.branchId || "");
  const employeeId = String(body.employeeId || "");
  const pin = String(body.pin || "");

  if (!branchId || !employeeId || !pin) {
    return Response.json({ ok: false, message: "Data login belum lengkap." }, { status: 400 });
  }

  // Dummy PIN sementara (nanti bisa pakai pinHash per cabang)
  if (pin !== "1234") {
    return Response.json({ ok: false, message: "PIN salah." }, { status: 401 });
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch || !branch.isActive) {
    return Response.json({ ok: false, message: "Cabang tidak valid." }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || !employee.isActive || employee.branchId !== branchId) {
    return Response.json({ ok: false, message: "Karyawan tidak valid." }, { status: 400 });
  }

  // create session token
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12); // 12 jam

  await prisma.kioskSession.create({
    data: {
      branchId,
      employeeId,
      token,
      expiresAt,
    },
  });

  return Response.json({
    ok: true,
    token,
    branch: { id: branch.id, code: branch.code, name: branch.name, lat: branch.lat, lng: branch.lng, radiusMeter: branch.radiusMeter },
    employee: { id: employee.id, empNo: employee.empNo, name: employee.name, branchId: employee.branchId },
  });
}
