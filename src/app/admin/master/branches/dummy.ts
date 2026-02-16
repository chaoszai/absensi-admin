export type BranchRow = {
  id: string;
  code: string;      // CBG_001
  name: string;      // Klaten
  address: string;
  lat: number;
  lng: number;
  radiusM: number;   // default 200
  isActive: boolean;
};

export const branchDummy: BranchRow[] = [
  {
    id: "b1",
    code: "CBG_002",
    name: "Klaten",
    address: "Jl. Raya Klaten ...",
    lat: -7.705,
    lng: 110.606,
    radiusM: 200,
    isActive: true,
  },
  {
    id: "b2",
    code: "CBG_030",
    name: "Yogya",
    address: "Jl. Magelang ...",
    lat: -7.7956,
    lng: 110.3695,
    radiusM: 200,
    isActive: true,
  },
  {
    id: "b3",
    code: "CBG_001",
    name: "Garut",
    address: "Jl. Ahmad Yani ...",
    lat: -7.214,
    lng: 107.908,
    radiusM: 200,
    isActive: false,
  },
];
