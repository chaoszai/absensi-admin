import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // reset biar gak dobel
  await prisma.attendance.deleteMany();
  await prisma.shiftRule.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.branch.deleteMany();

  const solo = await prisma.branch.create({ data: { name: "Cabang Solo" } });
  const klaten = await prisma.branch.create({ data: { name: "Cabang Klaten" } });

  const budi = await prisma.employee.create({
    data: { empNo: "EMP001", name: "Budi", branchId: solo.id },
  });

  const siti = await prisma.employee.create({
    data: { empNo: "EMP002", name: "Siti", branchId: klaten.id },
  });

  await prisma.shiftRule.create({
    data: {
      branchId: solo.id,
      dailyRate: 100000,
      latePenaltyPerMin: 1000,
      absencePenalty: 50000,
    },
  });

  await prisma.shiftRule.create({
    data: {
      branchId: klaten.id,
      dailyRate: 120000,
      latePenaltyPerMin: 1500,
      absencePenalty: 60000,
    },
  });

  await prisma.attendance.createMany({
    data: [
      // Budi
      { employeeId: budi.id, date: new Date("2026-01-31"), lateMinutes: 0, status: "PRESENT" },
      { employeeId: budi.id, date: new Date("2026-02-01"), lateMinutes: 7, status: "PRESENT" },
      { employeeId: budi.id, date: new Date("2026-02-02"), lateMinutes: 0, status: "ABSENT" },

      // Siti
      { employeeId: siti.id, date: new Date("2026-02-01"), lateMinutes: 2, status: "PRESENT" },
      { employeeId: siti.id, date: new Date("2026-02-02"), lateMinutes: 0, status: "PRESENT" },
    ],
  });

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

