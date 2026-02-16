import { prisma } from "@/lib/db";
import { json } from "@/lib/kioskAuth";

export async function GET() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, lat: true, lng: true, radiusMeter: true },
  });

  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, empNo: true, name: true, branchId: true },
  });

  return json({ ok: true, branches, employees });
}
