export type AttendanceRow = {
  date: string;
  employeeName: string;
  employeeId: string;

  branch: string;
  branchCode: string;

  shift?: string;

  checkIn?: string;
  checkInPhoto?: string;
  checkOut?: string;
  checkOutPhoto?: string;

  // lokasi dari app absensi (mobile)
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;

  lateMinutes?: number;
  note?: string;
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
    checkInLat: -7.7052,
    checkInLng: 110.6061,
    checkOut: "15:01",
    checkOutPhoto: "https://picsum.photos/100?2",
    checkOutLat: -7.7052,
    checkOutLng: 110.6061,
    lateMinutes: 3,
  },
  {
    date: "2026-02-05",
    employeeName: "Raka",
    employeeId: "EMP_014",
    branch: "Yogya",
    branchCode: "CBG_030",
    shift: "SHIFT 2",
    note: "WFH — Laptop bermasalah",
    // contoh: gak ada lokasi karena belum absen masuk
  },
  {
    date: "2026-02-04",
    employeeName: "Dina",
    employeeId: "EMP_009",
    branch: "Garut",
    branchCode: "CBG_001",
    shift: "SHIFT 1",
    note: "Izin — Sakit demam",
  },
];
