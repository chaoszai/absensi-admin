export type RoleCode = "STAFF" | "ADMIN" | "SPV";
export type GradeCode = "G1" | "G2" | "G3";

export type PayGradeRow = {
  id: string;
  role: RoleCode;
  grade: GradeCode;
  baseSalary: number;
  allowance: number;
  isActive: boolean;
};

export const payGradeDummy: PayGradeRow[] = [
  { id: "PG-STAFF-G1", role: "STAFF", grade: "G1", baseSalary: 2200000, allowance: 200000, isActive: true },
  { id: "PG-STAFF-G2", role: "STAFF", grade: "G2", baseSalary: 2500000, allowance: 250000, isActive: true },
  { id: "PG-ADMIN-G1", role: "ADMIN", grade: "G1", baseSalary: 2600000, allowance: 300000, isActive: true },
  { id: "PG-SPV-G2", role: "SPV", grade: "G2", baseSalary: 3200000, allowance: 500000, isActive: true },
];
