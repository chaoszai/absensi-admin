-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lat" REAL NOT NULL DEFAULT 0,
    "lng" REAL NOT NULL DEFAULT 0,
    "radiusMeter" INTEGER NOT NULL DEFAULT 200,
    "pinHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "empNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "grade" TEXT NOT NULL DEFAULT 'A',
    "salaryOverride" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "gender" TEXT,
    "birthPlace" TEXT,
    "birthDate" DATETIME,
    "religion" TEXT,
    "education" TEXT,
    "maritalStatus" TEXT,
    "address" TEXT,
    "ktpNo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShiftRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workStart" TEXT NOT NULL DEFAULT '08:00',
    "workEnd" TEXT NOT NULL DEFAULT '17:00',
    "windowStart" TEXT NOT NULL DEFAULT '07:30',
    "windowEnd" TEXT NOT NULL DEFAULT '09:30',
    "lateToleranceMin" INTEGER NOT NULL DEFAULT 0,
    "latePenaltyPerMin" INTEGER NOT NULL DEFAULT 0,
    "dailyRate" INTEGER NOT NULL DEFAULT 100000,
    "absencePenalty" INTEGER NOT NULL DEFAULT 50000,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShiftRule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KioskSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KioskSession_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KioskSession_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "shiftCode" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'NORMAL',
    "lat" REAL,
    "lng" REAL,
    "distanceM" REAL,
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "flags" TEXT,
    "note" TEXT,
    "finalStatus" TEXT NOT NULL DEFAULT 'VALID',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AttendanceLog_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AttendanceLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dateFrom" DATETIME NOT NULL,
    "dateTo" DATETIME NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Request_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmployeeContract" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "contractNo" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "template" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeContract_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_empNo_key" ON "Employee"("empNo");

-- CreateIndex
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");

-- CreateIndex
CREATE INDEX "ShiftRule_branchId_idx" ON "ShiftRule"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftRule_branchId_code_key" ON "ShiftRule"("branchId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "KioskSession_token_key" ON "KioskSession"("token");

-- CreateIndex
CREATE INDEX "KioskSession_branchId_idx" ON "KioskSession"("branchId");

-- CreateIndex
CREATE INDEX "KioskSession_employeeId_idx" ON "KioskSession"("employeeId");

-- CreateIndex
CREATE INDEX "KioskSession_expiresAt_idx" ON "KioskSession"("expiresAt");

-- CreateIndex
CREATE INDEX "AttendanceLog_employeeId_date_idx" ON "AttendanceLog"("employeeId", "date");

-- CreateIndex
CREATE INDEX "AttendanceLog_branchId_date_idx" ON "AttendanceLog"("branchId", "date");

-- CreateIndex
CREATE INDEX "Request_employeeId_idx" ON "Request"("employeeId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_type_idx" ON "Request"("type");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeContract_contractNo_key" ON "EmployeeContract"("contractNo");

-- CreateIndex
CREATE INDEX "EmployeeContract_employeeId_idx" ON "EmployeeContract"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeContract_status_idx" ON "EmployeeContract"("status");
