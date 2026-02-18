import { prisma } from "@/lib/db";
import { json } from "@/lib/kioskAuth";

function randToken() {
  return "kiosk_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { branchId, employeeId, pin } = body || {};

    if (!branchId || !employeeId || !pin) {
      return json({ ok: false, message: "Cabang, karyawan, dan PIN wajib diisi." }, { status: 400 });
    }

    // dummy pin dulu
    if (String(pin) !== "1234") {
      return json({ ok: false, message: "PIN salah." }, { status: 401 });
    }

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });

    if (!branch || !employee) return json({ ok: false, message: "Data tidak ditemukan." }, { status: 404 });
    if (employee.branchId !== branchId)
      return json({ ok: false, message: "Karyawan tidak terdaftar di cabang ini." }, { status: 400 });

    // hapus session lama karyawan ini biar bersih (opsional)
    await prisma.kioskSession.deleteMany({ where: { employeeId } });

    const token = randToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 jam

    await prisma.kioskSession.create({
      data: { branchId, employeeId, token, expiresAt },
    });

    return json({
      ok: true,
      token,
      session: {
        token,
        employeeId: employee.id,
        employeeName: employee.name,
        empNo: employee.empNo,
        branchId: branch.id,
        branchCode: branch.code,
        branchName: branch.name,
      },
    });
  } catch (e: any) {
    return json({ ok: false, message: e?.message || "Login error" }, { status: 500 });
  }
}
