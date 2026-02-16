const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // BRANCHES
  const branches = [
    { code: "CBG_001", name: "Garut", lat: -7.214, lng: 107.908, radiusMeter: 200, isActive: true },
    { code: "CBG_002", name: "Klaten", lat: -7.705, lng: 110.606, radiusMeter: 200, isActive: true },
    { code: "CBG_030", name: "Yogya",  lat: -7.7956, lng: 110.3695, radiusMeter: 200, isActive: true },
  ];

  for (const b of branches) {
    await prisma.branch.upsert({ where: { code: b.code }, update: b, create: b });
  }

  const garut = await prisma.branch.findUnique({ where: { code: "CBG_001" } });
  const klaten = await prisma.branch.findUnique({ where: { code: "CBG_002" } });
  const yogya = await prisma.branch.findUnique({ where: { code: "CBG_030" } });
  if (!garut || !klaten || !yogya) throw new Error("Branch seed gagal");

  // SHIFT RULES
  const baseShifts = [
    { code: "SHIFT_1", name: "SHIFT 1 (Pagi)",  windowStart: "05:00", windowEnd: "10:59", workStart: "08:00", lateToleranceMin: 10, isActive: true },
    { code: "SHIFT_2", name: "SHIFT 2 (Siang)", windowStart: "11:00", windowEnd: "15:59", workStart: "13:00", lateToleranceMin: 10, isActive: true },
    { code: "SHIFT_3", name: "SHIFT 3 (Sore)",  windowStart: "16:00", windowEnd: "22:59", workStart: "17:00", lateToleranceMin: 10, isActive: true },
    { code: "SHIFT_4", name: "SHIFT 4 (Night)", windowStart: "23:00", windowEnd: "04:59", workStart: "23:00", lateToleranceMin: 10, isActive: false },
  ];

  for (const branchId of [garut.id, klaten.id, yogya.id]) {
    for (const s of baseShifts) {
      await prisma.shiftRule.upsert({
        where: { branchId_code: { branchId, code: s.code } },
        update: s,
        create: { branchId, ...s },
      });
    }
  }

  // EMPLOYEES
  await prisma.employee.upsert({
    where: { empNo: "EMP027" },
    update: {},
    create: { empNo: "EMP027", name: "Aji Fajar Permana", branchId: klaten.id, role: "SPV", grade: "A", isActive: true },
  });

  await prisma.employee.upsert({
    where: { empNo: "EMP001" },
    update: {},
    create: { empNo: "EMP001", name: "Budi", branchId: yogya.id, role: "STAFF", grade: "G1", isActive: true },
  });

  await prisma.employee.upsert({
    where: { empNo: "EMP002" },
    update: {},
    create: { empNo: "EMP002", name: "Siti", branchId: klaten.id, role: "STAFF", grade: "G1", isActive: true },
  });

  console.log("✅ Seed OK");
}

main()
  .catch((e) => (console.error(e), process.exit(1)))
  .finally(async () => prisma.$disconnect());
