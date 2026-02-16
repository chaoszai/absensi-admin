const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // ===== Branches =====
  const jog = await prisma.branch.upsert({
    where: { code: "CBG_JOG" },
    update: {},
    create: {
      code: "CBG_JOG",
      name: "Cabang Jogja",
      lat: 0,
      lng: 0,
      radiusMeter: 200,
      isActive: true,
    },
  });

  const slo = await prisma.branch.upsert({
    where: { code: "CBG_SLO" },
    update: {},
    create: {
      code: "CBG_SLO",
      name: "Cabang Solo",
      lat: 0,
      lng: 0,
      radiusMeter: 200,
      isActive: true,
    },
  });

  // ===== Employees =====
  await prisma.employee.upsert({
    where: { empNo: "EMP003" },
    update: {},
    create: {
      empNo: "EMP003",
      name: "Andi",
      branchId: jog.id,
      role: "STAFF",
      grade: "A",
      isActive: true,
    },
  });

  await prisma.employee.upsert({
    where: { empNo: "EMP001" },
    update: {},
    create: {
      empNo: "EMP001",
      name: "Aji",
      branchId: slo.id,
      role: "STAFF",
      grade: "A",
      isActive: true,
    },
  });

  // ===== Shift Rules (basic) =====
  const shiftDefaults = [
    {
      code: "SHIFT_1",
      name: "Shift 1",
      workStart: "08:00",
      workEnd: "17:00",
      windowStart: "07:30",
      windowEnd: "09:30",
    },
    {
      code: "SHIFT_2",
      name: "Shift 2",
      workStart: "10:00",
      workEnd: "19:00",
      windowStart: "09:30",
      windowEnd: "11:30",
    },
  ];

  for (const s of shiftDefaults) {
    await prisma.shiftRule.upsert({
      where: {
        branchId_code: {
          branchId: jog.id,
          code: s.code,
        },
      },
      update: {
        name: s.name,
        workStart: s.workStart,
        workEnd: s.workEnd,
        windowStart: s.windowStart,
        windowEnd: s.windowEnd,
        isActive: true,
      },
      create: {
        branchId: jog.id,
        ...s,
        lateToleranceMin: 0,
        latePenaltyPerMin: 0,
        dailyRate: 100000,
        absencePenalty: 50000,
        isActive: true,
      },
    });
  }

  console.log("✅ Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
