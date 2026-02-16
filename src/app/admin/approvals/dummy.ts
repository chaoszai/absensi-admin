export type ApprovalType =
  | "missing_in"
  | "missing_out"
  | "outside_radius"
  | "leave"
  | "manual_correction";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRow = {
  id: string;
  date: string; // YYYY-MM-DD
  employeeName: string;
  employeeId: string;
  branch: string;
  branchCode: string;

  type: ApprovalType;
  reason?: string;

  checkIn?: string;
  checkOut?: string;

  distanceM?: number;
  radiusM?: number;

  evidencePhoto?: string;

  status: ApprovalStatus;

  createdAt: string; // ISO or readable
};

export const approvalDummy: ApprovalRow[] = [
  {
    id: "ap_001",
    date: "2026-02-05",
    employeeName: "Aji",
    employeeId: "EMP_001",
    branch: "Klaten",
    branchCode: "CBG_002",
    type: "outside_radius",
    distanceM: 280,
    radiusM: 200,
    reason: "Sinyal GPS ngaco, absen di depan toko",
    evidencePhoto: "https://picsum.photos/300?11",
    status: "pending",
    createdAt: "2026-02-05 07:10",
  },
  {
    id: "ap_002",
    date: "2026-02-05",
    employeeName: "Raka",
    employeeId: "EMP_014",
    branch: "Yogya",
    branchCode: "CBG_030",
    type: "missing_in",
    reason: "Lupa absen masuk",
    status: "pending",
    createdAt: "2026-02-05 10:22",
  },
  {
    id: "ap_003",
    date: "2026-02-04",
    employeeName: "Dina",
    employeeId: "EMP_009",
    branch: "Garut",
    branchCode: "CBG_001",
    type: "leave",
    reason: "Izin — sakit demam",
    evidencePhoto: "https://picsum.photos/300?12",
    status: "approved",
    createdAt: "2026-02-04 08:12",
  },
];
