import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import puppeteer from "puppeteer";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COMPANY = {
  companyName: "ALF SPAREPART DAN ACCESSORIES HP",
  companyLegalName: "PT ALF Distributor Spare Part dan ACC HP",
  companyAddress: "Jalan Veteran No 75 Sangkal Putung, Bareng Lor, Klaten Utara",
  companyBusinessType: "Ritail",
  docCode: "",
  pihak1Name: "Bpk H. Purwanto",
  pihak1Address: "Toprayan, Cawas, Kec Cawas, Klaten",
  pihak1Role: "Pemilik Perusahaan (Owner)",
  pihak1Representative: "Bp. Moh. Haryanto",
  pihak1RepRole: "General Manager",
  pihak1SignTitle: "Manager ALF GROUP",
  pihak1SignName: "Moh. Haryanto",
  signCity: "Klaten",
};

const DEFAULT_TERMS = {
  contractDurationText: "1 (satu) tahun",
  paydayText: "1",
  workHoursText: "9 (sembilan) jam sehari (09:00–18:00)",
  breakText: "1 jam (12:00–13:00)",
  workDaysText: "6 (enam) hari",
  offDayText: "1 hari",
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
  if (!v) return fallback;
  const s = String(v).trim();
  return s.length ? s : fallback;
}

function fmtISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

const MONTHS_ID = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember",
];

function fmtLongID(d: Date) {
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function wrapHtml(body: string) {
  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<style>
@page { size: A4; margin: 30mm 20mm 25mm 20mm; }
body { font-family: "Times New Roman", serif; font-size: 12pt; }
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
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    const c = await prisma.employeeContract.findUnique({
      where: { id },
      include: { employee: { include: { branch: true } } },
    });

    if (!c) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const master = await readMasterTemplate();
    const tpl =
      c.template && c.template.trim().length > 0 ? c.template : master;

    const now = new Date();

    const vars: Record<string, string> = {
      contractNo: escapeHtml(safe(c.contractNo)),
      employeeName: escapeHtml(safe(c.employee?.name)),
      empNo: escapeHtml(safe(c.employee?.empNo)),
      branchName: escapeHtml(safe(c.employee?.branch?.name)),
      startDate: escapeHtml(fmtISO(c.startDate)),
      endDate: escapeHtml(fmtISO(c.endDate)),
      startDateLong: escapeHtml(fmtLongID(c.startDate)),
      endDateLong: escapeHtml(fmtLongID(c.endDate)),
      signCity: escapeHtml(COMPANY.signCity),
      signDateLong: escapeHtml(fmtLongID(now)),
      companyName: escapeHtml(COMPANY.companyName),
      companyLegalName: escapeHtml(COMPANY.companyLegalName),
      companyAddress: escapeHtml(COMPANY.companyAddress),
      companyBusinessType: escapeHtml(COMPANY.companyBusinessType),
      pihak1Name: escapeHtml(COMPANY.pihak1Name),
      pihak1SignName: escapeHtml(COMPANY.pihak1SignName),
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

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, { waitUntil: "domcontentloaded" });

    if (url.searchParams.get("debug") === "png") {
      const png = await page.screenshot({ fullPage: true, type: "png" });
      await browser.close();
      return new NextResponse(Buffer.from(png), {
        headers: { "Content-Type": "image/png" },
      });
    }

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdf), {
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
