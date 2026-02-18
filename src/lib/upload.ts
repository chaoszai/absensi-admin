import fs from "node:fs";
import path from "node:path";

export async function saveBase64Jpeg(base64: string) {
  const m = base64.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/i);
  if (!m) throw new Error("Format foto tidak valid");

  const ext = m[1].toLowerCase() === "png" ? "png" : "jpg";
  const data = m[2];
  const bytes = Buffer.from(data, "base64");

  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;
  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, bytes);

  return `/uploads/${fileName}`; // public path
}
