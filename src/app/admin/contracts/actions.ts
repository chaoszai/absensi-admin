"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";
import path from "node:path";

async function readMasterTemplate() {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "kontrak-karyawan.html"
  );
  return await fs.readFile(templatePath, "utf-8");
}

async function nextContractNo() {
  const year = new Date().getFullYear();
  const prefix = `CTR-${year}-`;

  const last = await prisma.employeeContract.findFirst({
    where: { contractNo: { startsWith: prefix } },
    orderBy: { contractNo: "desc" },
    select: { contractNo: true },
  });

  const lastNum = last?.contractNo?.slice(prefix.length) || "0000";
  const n = Math.max(0, parseInt(lastNum, 10)) + 1;

  return `${prefix}${String(n).padStart(4, "0")}`;
}

export async function createContract(formData: FormData) {
  const employeeId = String(formData.get("employeeId") || "").trim();
  const startDateRaw = String(formData.get("startDate") || "").trim();
  const endDateRaw = String(formData.get("endDate") || "").trim();
  const status = String(formData.get("status") || "ACTIVE").trim();
  const templateInput = String(formData.get("template") || "").trim();

  if (!employeeId) throw new Error("Karyawan belum dipilih");
  if (!startDateRaw || !endDateRaw) throw new Error("Tanggal mulai/selesai kosong");

  // ✅ PAKSA AUTO CONTRACT NO (anti duplikat)
  const contractNo = await nextContractNo();

  // ✅ template fallback ke master file jika kosong
  const masterTemplate = await readMasterTemplate();
  const safeTemplate = templateInput || masterTemplate;

  try {
    await prisma.employeeContract.create({
      data: {
        employeeId,
        contractNo,
        startDate: new Date(startDateRaw),
        endDate: new Date(endDateRaw),
        template: safeTemplate,
        status,
      },
    });
  } catch (e: any) {
    console.error("CREATE CONTRACT ERROR:", e);
    throw new Error(String(e?.message || e));
  }

  revalidatePath("/admin/contracts");
}

export async function deleteContract(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  if (!id) throw new Error("Missing id");

  await prisma.employeeContract.delete({ where: { id } });
  revalidatePath("/admin/contracts");
}
