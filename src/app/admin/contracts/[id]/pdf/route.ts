import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import puppeteer from "puppeteer";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** =========================
 *  CONFIG PERUSAHAAN (sementara hardcode)
 *  nanti bisa dipindah ke table CompanySettings
 *  ========================= */
const COMPANY = {
  companyName: "ALF SPAREPART DAN ACCESSORIES HP",
  companyLegalName: "PT ALF Distributor Spare Part dan ACC HP",
  companyAddress: "Jalan Veteran No 75 Sangkal Putung, Bareng Lor, Klaten Utara",
  companyBusinessType: "Ritail",
  docCode: "",

  // Pihak 1 (yang tanda tangan)
  pihak1Name: "Bpk H. Purwanto",
  pihak1Address: "Toprayan, Cawas, Kec Cawas, Klaten",
  pihak1Role: "Pemilik Perusahaan (Owner)",

  // yang mewakili
  pihak1Representative: "Bp. Moh. Haryanto",
  pihak1RepRole: "General Manager",

  // bagian ttd
  pihak1SignTitle: "Manager ALF GROUP",
  pihak1SignName: "Moh. Haryanto",

  signCity: "Klaten",
};

// ketentuan default (kamu bisa ubah bebas)
const DEFAULT_TERMS = {
  contractDurationText: "1 (satu) tahun",
  paydayText: "1",
  workHoursText: "9 (sembilan) jam sehari (09:00–18:00)",
  breakText: "1 jam (12:00–13:00) / terjadwal",
  workDaysText: "6 (enam) hari",
  offDayText: "1 hari libur menyesuaikan unit",
  resignPenaltyText: "3 kali take home pay",
  resignNoticeText: "3 bulan",
};

async function readMasterTemplate() {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "templates",
    "kontrak-karyawan.html"
  );
  return await fs.readFile(templatePath, "utf-8");
}

/** replace {{key}} */
function fillTemplate(tpl: string, vars: Record<string, string>) {
  let html = tpl;
  for (const [k, v] of Object.entries(vars)) {
    html = html.replaceAll(`{{${k}}}`, v);
  }
  return html;
}

function escapeHtml(input: string) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safe(v: any, fallback = "-") {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

function fmtISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function fmtLongID(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = MONTHS_ID[d.getMonth()] ?? "";
  const yy = d.getFullYear();
  return `${dd} ${mm} ${yy}`;
}

const DAYS_ID = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
function dayNameId(d: Date) {
  return DAYS_ID[d.getDay()] ?? "-";
}

/** kalau template cuma body (tanpa <html>), bungkus */
function wrapHtml(body: string) {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <style>
    @page { size: A4; margin: 30mm 20mm 25mm 20mm; }
    html, body { background: #fff !important; }
    body { color: #111 !important; font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.45; }

    /* Guard: kalau ada footer fixed dari template, matiin (biar gak nabrak) */
    footer, .footer, .page-footer { display: none !important; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const url = req.nextUrl;

    // ✅ Next.js kamu ngetype params sebagai Promise
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const c = await prisma.employeeContract.findUnique({
      where: { id },
      include: { employee: { include: { branch: true } } },
    });

    if (!c) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const master = await readMasterTemplate();

    // tpl dari DB kalau ada, kalau kosong fallback master
    const tpl = c.template && c.template.trim().length > 0 ? c.template : master;

    const now = new Date();

    const employeeName = safe(c.employee?.name);
    const empNo = safe(c.employee?.empNo);
    const branchName = safe(c.employee?.branch?.name);

    // ✅ employee placeholders (HARUS di luar object vars)
    const employeeGender = safe(c.employee?.gender);
    const employeeBirthPlace = safe(c.employee?.birthPlace);
    const employeeBirthDateLong = c.employee?.birthDate
      ? fmtLongID(c.employee.birthDate)
      : "-";
    const employeeReligion = safe(c.employee?.religion);
    const employeeEducation = safe(c.employee?.education);
    const employeeMaritalStatus = safe(c.employee?.maritalStatus);
    const employeeAddress = safe(c.employee?.address);
    const employeeKtp = safe(c.employee?.ktpNo);

    const vars: Record<string, string> = {
      // basic
      contractNo: escapeHtml(safe(c.contractNo)),
      employeeName: escapeHtml(employeeName),
      empNo: escapeHtml(empNo),
      branchName: escapeHtml(branchName),

      // date formats
      startDate: escapeHtml(fmtISO(c.startDate)),
      endDate: escapeHtml(fmtISO(c.endDate)),
      startDateLong: escapeHtml(fmtLongID(c.startDate)),
      endDateLong: escapeHtml(fmtLongID(c.endDate)),

      // tanda tangan
      signCity: escapeHtml(COMPANY.signCity),
      dayName: escapeHtml(dayNameId(now)),
      signDateLong: escapeHtml(fmtLongID(now)),

      // company / pihak 1
      companyName: escapeHtml(COMPANY.companyName),
      companyLegalName: escapeHtml(COMPANY.companyLegalName),
      companyAddress: escapeHtml(COMPANY.companyAddress),
      companyBusinessType: escapeHtml(COMPANY.companyBusinessType),
      docCode: escapeHtml(COMPANY.docCode),

      pihak1Name: escapeHtml(COMPANY.pihak1Name),
      pihak1Address: escapeHtml(COMPANY.pihak1Address),
      pihak1Role: escapeHtml(COMPANY.pihak1Role),
      pihak1Representative: escapeHtml(COMPANY.pihak1Representative),
      pihak1RepRole: escapeHtml(COMPANY.pihak1RepRole),
      pihak1SignTitle: escapeHtml(COMPANY.pihak1SignTitle),
      pihak1SignName: escapeHtml(COMPANY.pihak1SignName),

      // employee detail placeholders
      employeeGender: escapeHtml(employeeGender),
      employeeBirthPlace: escapeHtml(employeeBirthPlace),
      employeeBirthDateLong: escapeHtml(employeeBirthDateLong),
      employeeReligion: escapeHtml(employeeReligion),
      employeeEducation: escapeHtml(employeeEducation),
      employeeMaritalStatus: escapeHtml(employeeMaritalStatus),
      employeeAddress: escapeHtml(employeeAddress),
      employeeKtp: escapeHtml(employeeKtp),

      // terms
      contractDurationText: escapeHtml(DEFAULT_TERMS.contractDurationText),
      paydayText: escapeHtml(DEFAULT_TERMS.paydayText),
      workHoursText: escapeHtml(DEFAULT_TERMS.workHoursText),
      breakText: escapeHtml(DEFAULT_TERMS.breakText),
      workDaysText: escapeHtml(DEFAULT_TERMS.workDaysText),
      offDayText: escapeHtml(DEFAULT_TERMS.offDayText),
      resignPenaltyText: escapeHtml(DEFAULT_TERMS.resignPenaltyText),
      resignNoticeText: escapeHtml(DEFAULT_TERMS.resignNoticeText),
    };

    const bodyOrFull = fillTemplate(tpl, vars);
    const finalHtml = bodyOrFull.includes("<html")
      ? bodyOrFull
      : wrapHtml(bodyOrFull);

    // ✅ DEBUG INFO
    if (url.searchParams.get("debug") === "info") {
      return NextResponse.json({
        id,
        contractNo: c.contractNo,
        dbTemplateLen: c.template?.length || 0,
        masterTemplateLen: master?.length || 0,
        finalHtmlLen: finalHtml.length,
        finalHtmlHead: finalHtml.slice(0, 700),
      });
    }

    // ✅ DEBUG HTML
    if (url.searchParams.get("debug") === "html") {
      return new NextResponse(finalHtml, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123 });

    await page.setContent(finalHtml, { waitUntil: "domcontentloaded" });

    // ✅ DEBUG PNG
    if (url.searchParams.get("debug") === "png") {
      const png = await page.screenshot({ fullPage: true, type: "png" });
      await browser.close();
      return new NextResponse(png, { headers: { "Content-Type": "image/png" } });
    }

    // ✅ GENERATE PDF (header/footer OFF)
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: {
        top: "30mm",
        right: "20mm",
        bottom: "25mm",
        left: "20mm",
      },
    });

    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${c.contractNo}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error("PDF ERROR:", e);
    return NextResponse.json(
      { message: "PDF generation failed", error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
