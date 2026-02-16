import type { RoleCode, GradeCode } from "../pay-grades/dummy";

export type EmployeeRow = {
  id: string;
  employeeId: string;  // EMP_001
  name: string;
  branchCode: string;  // CBG_002
  role: RoleCode;      // STAFF/ADMIN/SPV
  grade: GradeCode;    // G1/G2/G3
  salaryOverride?: number | null; // kalau ada kasus khusus
  isActive: boolean;
};

export const employeeDummy: EmployeeRow[] = [
  { id: "e1", employeeId: "EMP_001", name: "Aji",  branchCode: "CBG_002", role: "STAFF", grade: "G2", salaryOverride: null, isActive: true },
  { id: "e2", employeeId: "EMP_014", name: "Raka", branchCode: "CBG_030", role: "STAFF", grade: "G1", salaryOverride: null, isActive: true },
  { id: "e3", employeeId: "EMP_009", name: "Dina", branchCode: "CBG_001", role: "ADMIN", grade: "G1", salaryOverride: null, isActive: false },
];
