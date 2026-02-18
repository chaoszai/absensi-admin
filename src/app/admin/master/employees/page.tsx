import { prisma } from "@/lib/db";
import EmployeesClient from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function MasterKaryawanPage() {
  const [employees, branches] = await Promise.all([
    prisma.employee.findMany({
      include: { branch: true }, // ✅ pastikan branch kebawa
      orderBy: [{ name: "asc" }],
    }),
    prisma.branch.findMany({ orderBy: [{ name: "asc" }] }),
  ]);

  return <EmployeesClient initialEmployees={employees as any} branches={branches as any} />;
}
