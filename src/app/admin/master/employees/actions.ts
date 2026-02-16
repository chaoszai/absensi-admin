"use server";

import { prisma } from "@/lib/db";

/* ============================================================
   UTILITIES
============================================================ */

const ROLE_ALLOWED = ["STAFF", "ADMIN", "SPV"] as const;
type Role = (typeof ROLE_ALLOWED)[number];

function mustString(fd: FormData, key: string, label: string) {
  const v = String(fd.get(key) ?? "").trim();
  if (!v) throw new Error(`${label} wajib diisi`);
  return v;
}

function optString(fd: FormData, key: string) {
  const v = String(fd.get(key) ?? "").trim();
  return v ? v : null;
}

function upper(v: string | null) {
  return v ? v.trim().toUpperCase() : v;
}

function parseBool(fd: FormData, key: string, def = false) {
  const raw = fd.get(key);
  if (raw === null) return def;
  return String(raw) === "true";
}

function parseNumberOrNull(fd: FormData, key: string) {
  const raw = String(fd.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseDateOrNull(fd: FormData, key: string) {
  const raw = String(fd.get(key) ?? "").trim();
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/* ============================================================
   NORMALIZERS
============================================================ */

function normalizeRole(val: string): Role {
  const v = (val ?? "").trim().toUpperCase();

  if (v === "STAFF" || v === "STAF") return "STAFF";
  if (v === "SPV" || v === "SUPERVISOR") return "SPV";
  if (v === "ADMIN") return "ADMIN";

  if (!ROLE_ALLOWED.includes(v as Role)) {
    throw new Error("Role tidak valid");
  }

  return v as Role;
}

function normalizeGrade(val: string) {
  const v = String(val ?? "").trim().toUpperCase();
  return v || "A";
}

/* ============================================================
   CRUD
============================================================ */

export async function createEmployee(fd: FormData) {
  const empNo = mustString(fd, "empNo", "EMP No").toUpperCase();
  const name = mustString(fd, "name", "Nama");
  const branchId = mustString(fd, "branchId", "Cabang");

  const role = normalizeRole(String(fd.get("role") ?? "STAFF"));
  const grade = normalizeGrade(String(fd.get("grade") ?? "A"));

  return prisma.employee.create({
    data: {
      empNo,
      name,
      branchId,
      role,
      grade,
      isActive: parseBool(fd, "isActive", true),
      salaryOverride: parseNumberOrNull(fd, "salaryOverride"),
      gender: upper(optString(fd, "gender")),
      birthPlace: optString(fd, "birthPlace"),
      birthDate: parseDateOrNull(fd, "birthDate"),
      religion: upper(optString(fd, "religion")),
      education: upper(optString(fd, "education")),
      maritalStatus: upper(optString(fd, "maritalStatus")),
      address: optString(fd, "address"),
      ktpNo: optString(fd, "ktpNo"),
    },
  });
}

export async function updateEmployee(fd: FormData) {
  const id = mustString(fd, "id", "ID");
  const empNo = mustString(fd, "empNo", "EMP No").toUpperCase();
  const name = mustString(fd, "name", "Nama");
  const branchId = mustString(fd, "branchId", "Cabang");

  const role = normalizeRole(String(fd.get("role") ?? "STAFF"));
  const grade = normalizeGrade(String(fd.get("grade") ?? "A"));

  return prisma.employee.update({
    where: { id },
    data: {
      empNo,
      name,
      branchId,
      role,
      grade,
      isActive: parseBool(fd, "isActive", true),
      salaryOverride: parseNumberOrNull(fd, "salaryOverride"),
      gender: upper(optString(fd, "gender")),
      birthPlace: optString(fd, "birthPlace"),
      birthDate: parseDateOrNull(fd, "birthDate"),
      religion: upper(optString(fd, "religion")),
      education: upper(optString(fd, "education")),
      maritalStatus: upper(optString(fd, "maritalStatus")),
      address: optString(fd, "address"),
      ktpNo: optString(fd, "ktpNo"),
    },
  });
}

export async function deleteEmployee(fd: FormData) {
  const id = mustString(fd, "id", "ID");
  return prisma.employee.delete({ where: { id } });
}

/* ============================================================
   IMPORT CSV FILE
============================================================ */

export async function importEmployeesFile(fd: FormData) {
  const file = fd.get("file") as File | null;
  if (!file) throw new Error("File belum dipilih");

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("File harus format .csv");
  }

  const text = await file.text();
  const rows = csvToObjects(text);

  if (!rows.length) throw new Error("CSV kosong");

  const branches = await prisma.branch.findMany();
  const byName = new Map(branches.map((b) => [b.name.toLowerCase(), b]));
  const byCode = new Map(
    branches.map((b) => [String((b as any).code ?? "").toLowerCase(), b])
  );

  let imported = 0;

  for (const r of rows) {
    const empNo = String(r.empNo ?? "").trim().toUpperCase();
    const name = String(r.name ?? "").trim();

    if (!empNo || !name) continue;

    const branchName = String(r.branchName ?? "").trim();
    const branchCode = String(r.branchCode ?? "").trim();

    const b =
      (branchCode ? byCode.get(branchCode.toLowerCase()) : null) ||
      (branchName ? byName.get(branchName.toLowerCase()) : null) ||
      branches[0];

    if (!b) throw new Error("Cabang tidak ditemukan");

    await prisma.employee.upsert({
      where: { empNo },
      create: {
        empNo,
        name,
        branchId: b.id,
        role: normalizeRole(String(r.role ?? "STAFF")),
        grade: normalizeGrade(String(r.grade ?? "A")),
        isActive: String(r.isActive ?? "true") !== "false",
      },
      update: {
        name,
        branchId: b.id,
        role: normalizeRole(String(r.role ?? "STAFF")),
        grade: normalizeGrade(String(r.grade ?? "A")),
        isActive: String(r.isActive ?? "true") !== "false",
      },
    });

    imported++;
  }

  return { imported };
}

/* ============================================================
   SIMPLE CSV PARSER
============================================================ */

function csvToObjects(csv: string) {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const obj: Record<string, any> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i]?.trim() ?? "";
    });
    return obj;
  });
}
