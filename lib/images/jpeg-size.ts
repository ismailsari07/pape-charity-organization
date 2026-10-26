// Width and height of a JPEG from its first bytes (the SOF segment), so the
// site can lay out an announcement photo at its own aspect ratio without
// downloading the whole file. Pure, unit-tested in jpeg-size.test.ts.
// The announcement-images bucket only accepts JPEG, and the panel strips
// EXIF (re-encodes in the browser), so no orientation flag can swap the sides.

export type ImageSize = { width: number; height: number };

// Start-of-frame markers that carry the dimensions (not DHT C4, JPG C8, DAC CC).
const SOF = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

/** Dimensions from the start of a JPEG; null when not a JPEG or the SOF isn't within `bytes`. */
export function jpegSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i += 1; // fill byte
      continue;
    }
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2; // markers without a length
      continue;
    }
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    if (length < 2) return null;
    if (SOF.has(marker)) {
      if (i + 9 > bytes.length) return null;
      const height = (bytes[i + 5] << 8) | bytes[i + 6];
      const width = (bytes[i + 7] << 8) | bytes[i + 8];
      return width > 0 && height > 0 ? { width, height } : null;
    }
    if (marker === 0xda || marker === 0xd9) return null; // image data reached without a SOF
    i += 2 + length;
  }
  return null;
}
