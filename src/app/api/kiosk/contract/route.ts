import { prisma } from "@/lib/db";
import { json, requireKioskSession } from "@/lib/kioskAuth";

export async function GET(req: Request) {
  const auth = await requireKioskSession(req);
  if (!auth.ok) return json(auth, { status: 401 });

  const today = new Date();

  const contract = await prisma.employeeContract.findFirst({
    where: {
      employeeId: auth.employeeId,
      status: "ACTIVE",
      startDate: { lte: today },
      endDate: { gte: today },
    },
    orderBy: { endDate: "asc" },
    select: { id: true, contractNo: true, startDate: true, endDate: true, status: true },
  });

  return json({ ok: true, contract });
}
