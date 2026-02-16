export type AttendanceRow = {
  id: string;
  date: string; // YYYY-MM-DD
  employeeName: string;
  employeeId: string;
  branchName: string;
  branchCode: string;
  shift: string;
  clockIn?: string; // HH:mm
  clockOut?: string; // HH:mm
  lateMinutes?: number;
  note?: string;
  status: "on_time" | "late" | "missing_in" | "missing_out" | "leave";
};

export const attendanceSample: AttendanceRow[] = [
  {
    id: "1",
    date: "2026-02-05",
    employeeName: "Aji",
    employeeId: "EMP_001",
    branchName: "Klaten",
    branchCode: "CBG_002",
    shift: "SHIFT 1",
    clockIn: "07:03",
    clockOut: "15:01",
    lateMinutes: 3,
    note: "-",
    status: "late",
  },
  {
    id: "2",
    date: "2026-02-05",
    employeeName: "Raka",
    employeeId: "EMP_014",
    branchName: "Yogya",
    branchCode: "CBG_030",
    shift: "SHIFT 2",
    status: "missing_in",
    note: "WFH — Laptop bermasalah",
  },
  {
    id: "3",
    date: "2026-02-04",
    employeeName: "Dina",
    employeeId: "EMP_009",
    branchName: "Garut",
    branchCode: "CBG_001",
    shift: "SHIFT 1",
    status: "leave",
    note: "Izin — Sakit demam",
  },
];

export type ApprovalItem = {
  id: string;
  type: "izin" | "cuti" | "lembur";
  employeeName: string;
  branchName: string;
  date: string;
  reason: string;
};

export const approvalsSample: ApprovalItem[] = [
  {
    id: "ap1",
    type: "izin",
    employeeName: "Dina",
    branchName: "Garut",
    date: "2026-02-04",
    reason: "Sakit demam",
  },
];
