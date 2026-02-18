export type AttendanceStatus =
  | "on_time"
  | "late"
  | "missing_in"
  | "missing_out"
  | "leave";

export type AttendanceRow = {
  date: string; // YYYY-MM-DD
  employeeName: string;
  employeeId: string;

  branch: string;
  branchCode: string;

  shift?: string;

  checkIn?: string;
  checkInPhoto?: string;
  checkOut?: string;
  checkOutPhoto?: string;

  lateMinutes?: number;

  note?: string;

  // IMPORTANT: optional, bisa di-set dari merge approvals
  status?: AttendanceStatus;

  // lokasi (optional)
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
};

export const attendanceDummy: AttendanceRow[] = [
  {
    date: "2026-02-05",
    employeeName: "Aji",
    employeeId: "EMP_001",
    branch: "Klaten",
    branchCode: "CBG_002",
    shift: "SHIFT 1",
    checkIn: "07:03",
    checkInPhoto: "https://picsum.photos/100?1",
    checkOut: "15:01",
    checkOutPhoto: "https://picsum.photos/100?2",
    lateMinutes: 3,
    checkInLat: -7.7052,
    checkInLng: 110.6062,
    checkOutLat: -7.7052,
    checkOutLng: 110.6062,
  },
  {
    date: "2026-02-05",
    employeeName: "Raka",
    employeeId: "EMP_014",
    branch: "Yogya",
    branchCode: "CBG_030",
    shift: "SHIFT 2",
    note: "WFH — Laptop bermasalah",
    // kalau belum ada absen masuk, nanti status auto = missing_in
  },
  {
    date: "2026-02-04",
    employeeName: "Dina",
    employeeId: "EMP_009",
    branch: "Garut",
    branchCode: "CBG_001",
    shift: "SHIFT 1",
    note: "Izin — Sakit demam",
    // status nanti bisa jadi leave kalau ada approval approved
  },
];
