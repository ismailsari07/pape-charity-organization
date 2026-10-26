import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Keep all rendered text within Latin-1: next/og's bundled Noto Sans covers
// it, so no font is fetched at build time ("İ"/"ı" would not render).
export const alt = "Pape Camii - Turkish Islamic Center Canada";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site palette (app/globals.css)
const BG = "#0a1310";
const TEXT = "#eef3f0";
const MINT = "#7fd1ae";
const MUTED = "#a9bab3";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-green-1024.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 72, padding: 90, background: BG, color: TEXT }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={400} height={400} alt="" style={{ borderRadius: 88 }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 4, color: MINT }}>336 PAPE AVENUE · TORONTO</div>
          <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1.05, marginTop: 22 }}>Pape Camii</div>
          <div style={{ fontSize: 40, marginTop: 18, color: MUTED }}>Turkish Islamic Center Canada</div>
          <div style={{ fontSize: 28, marginTop: 52, color: MINT }}>papemosque.ca</div>
        </div>
      </div>
    ),
    size,
  );
}
