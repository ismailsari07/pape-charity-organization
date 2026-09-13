import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// Keep all rendered text within Latin-1: next/og's bundled Noto Sans covers
// it, so no font is fetched from Google Fonts at build time.
export const alt = "Turkish Islamic Center Canada - Pape Camii";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site palette (app/globals.css: --dark / --paper)
const DARK = "#0e140c";
const PAPER = "#d1cfc0";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/logo.jpeg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: 80,
          background: DARK,
          color: PAPER,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={470} height={470} alt="" style={{ borderRadius: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 68, lineHeight: 1.1 }}>Turkish Islamic Center Canada</div>
          <div style={{ fontSize: 36, marginTop: 28 }}>Pape Camii · Toronto</div>
          <div style={{ fontSize: 26, marginTop: 48, opacity: 0.7 }}>papemosque.ca</div>
        </div>
      </div>
    ),
    size,
  );
}
