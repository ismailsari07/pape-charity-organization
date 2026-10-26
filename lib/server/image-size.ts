import "server-only";
import { jpegSize, type ImageSize } from "@/lib/images/jpeg-size";

/**
 * A photo's natural size, read once from its first 64 KB (HTTP Range) and
 * kept in Next's data cache for good: the panel never overwrites a stored
 * photo (a replacement gets a new URL), so a URL's size never changes.
 * Null when it can't be read; the card then falls back to a fixed frame.
 */
export async function imageSize(url: string): Promise<ImageSize | null> {
  try {
    const res = await fetch(url, { headers: { Range: "bytes=0-65535" }, cache: "force-cache" });
    if (!res.ok) return null;
    return jpegSize(new Uint8Array(await res.arrayBuffer()));
  } catch (error) {
    console.error("[image-size] could not read", url, error);
    return null;
  }
}
