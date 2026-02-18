import { prisma } from "@/lib/db";

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

export type PayrollRow = {
  empNo: string;
  name: string;
  branch: string;
  present: number;
  absent: number;
  lateMinutes: number;
  gross: number;
  lateCut: number;
  absentCut: number;
  net: number;
};

export async function getPayrollPreview(params: {
  from: Date;
  to: Date;
  branchId?: string;
}) {
  const from = startOfDay(params.from);
  const to = endOfDay(params.to);

  const branchesRules = await prisma.shiftRule.findMany();
  const ruleMap = new Map(branchesRules.map((r) => [r.branchId, r]));

  const employees = await prisma.employee.findMany({
    where: params.branchId ? { branchId: params.branchId } : {},
    include: { branch: true },
    orderBy: [{ branch: { name: "asc" } }, { name: "asc" }],
  });

  const empIds = employees.map((e) => e.id);

  const attendances = await prisma.attendanceLog.findMany({
    where: {
      employeeId: { in: empIds },
      date: { gte: from, lte: to },
    },
    orderBy: [{ date: "asc" }],
  });

  const attByEmp = new Map<string, typeof attendances>();
  for (const a of attendances) {
    const arr = attByEmp.get(a.employeeId) ?? [];
    arr.push(a);
    attByEmp.set(a.employeeId, arr);
  }

  const rows: PayrollRow[] = employees.map((e) => {
    const rule = ruleMap.get(e.branchId);
    const dailyRate = rule?.dailyRate ?? 0;
    const latePenaltyPerMin = rule?.latePenaltyPerMin ?? 0;
    const absencePenalty = rule?.absencePenalty ?? 0;

    const list = attByEmp.get(e.id) ?? [];
    const present = list.filter((x) => x.status === "PRESENT").length;
    const absent = list.filter((x) => x.status === "ABSENT").length;
    const lateMinutes = list.reduce((acc, x) => acc + (x.lateMinutes ?? 0), 0);

    const gross = present * dailyRate;
    const lateCut = lateMinutes * latePenaltyPerMin;
    const absentCut = absent * absencePenalty;
    const net = Math.max(0, gross - lateCut - absentCut);

    return {
      empNo: e.empNo,
      name: e.name,
      branch: e.branch.name,
      present,
      absent,
      lateMinutes,
      gross,
      lateCut,
      absentCut,
      net,
    };
  });

  const summary = {
    employees: rows.length,
    totalGross: rows.reduce((a, r) => a + r.gross, 0),
    totalNet: rows.reduce((a, r) => a + r.net, 0),
    totalLateMinutes: rows.reduce((a, r) => a + r.lateMinutes, 0),
    totalAbsent: rows.reduce((a, r) => a + r.absent, 0),
  };

  return { rows, summary };
}
