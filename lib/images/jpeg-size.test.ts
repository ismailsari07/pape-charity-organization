import { test } from "node:test";
import assert from "node:assert/strict";
import { jpegSize } from "./jpeg-size.ts";

// SOI, an APP0 segment, then SOF (baseline C0 or progressive C2) with the given size.
function jpeg(width: number, height: number, sof = 0xc0): Uint8Array {
  const app0 = [0xff, 0xe0, 0x00, 0x10, ...Array(14).fill(0)];
  const frame = [0xff, sof, 0x00, 0x11, 0x08, height >> 8, height & 0xff, width >> 8, width & 0xff, 0x03, ...Array(9).fill(0)];
  return new Uint8Array([0xff, 0xd8, ...app0, frame, 0xff, 0xda].flat());
}

test("reads baseline and progressive dimensions", () => {
  assert.deepEqual(jpegSize(jpeg(1600, 900)), { width: 1600, height: 900 });
  assert.deepEqual(jpegSize(jpeg(1080, 1350, 0xc2)), { width: 1080, height: 1350 });
});

test("skips a DHT segment (C4) that is not a frame", () => {
  const dht = [0xff, 0xc4, 0x00, 0x04, 0x00, 0x00];
  const bytes = jpeg(800, 800);
  const withDht = new Uint8Array([...bytes.slice(0, 2), ...dht, ...bytes.slice(2)]);
  assert.deepEqual(jpegSize(withDht), { width: 800, height: 800 });
});

test("null for non-JPEG or truncated data", () => {
  assert.equal(jpegSize(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), null);
  assert.equal(jpegSize(jpeg(1600, 900).slice(0, 22)), null);
});
