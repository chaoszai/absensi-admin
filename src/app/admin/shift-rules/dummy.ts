export type ShiftRuleRow = {
  id: string;
  code: string; // SHIFT_1
  name: string; // SHIFT 1
  checkInStart: string; // "05:00"
  checkInEnd: string;   // "10:59"
  workStart: string;    // "08:00" (buat hitung telat)
  lateToleranceMin: number; // 10
  isActive: boolean;
  note?: string;
};

export const shiftRuleDummy: ShiftRuleRow[] = [
  {
    id: "s1",
    code: "SHIFT_1",
    name: "SHIFT 1",
    checkInStart: "05:00",
    checkInEnd: "10:59",
    workStart: "08:00",
    lateToleranceMin: 10,
    isActive: true,
    note: "Pagi",
  },
  {
    id: "s2",
    code: "SHIFT_2",
    name: "SHIFT 2",
    checkInStart: "11:00",
    checkInEnd: "15:59",
    workStart: "13:00",
    lateToleranceMin: 10,
    isActive: true,
    note: "Siang",
  },
  {
    id: "s3",
    code: "SHIFT_3",
    name: "SHIFT 3",
    checkInStart: "16:00",
    checkInEnd: "22:59",
    workStart: "17:00",
    lateToleranceMin: 10,
    isActive: true,
    note: "Sore",
  },
  {
    id: "s4",
    code: "SHIFT_4",
    name: "SHIFT 4",
    checkInStart: "23:00",
    checkInEnd: "04:59",
    workStart: "23:00",
    lateToleranceMin: 10,
    isActive: false,
    note: "Night (opsional)",
  },
];
