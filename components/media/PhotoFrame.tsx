import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ImageSize } from "@/lib/images/jpeg-size";

type Props = {
  src: string;
  alt: string;
  /** Natural size read on the server (no layout shift); null → `fallbackRatio`. */
  size: ImageSize | null | undefined;
  fallbackRatio: string; // e.g. "4 / 5"
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * A photo at its own aspect ratio, capped at 680 px high: only a very tall
 * photo is then shown whole (object-contain) with a blurred, darkened copy of
 * itself filling the sides. Both layers use the same src and sizes, so the
 * browser downloads the image once.
 */
export default function PhotoFrame({ src, alt, size, fallbackRatio, sizes, priority = false, className }: Props) {
  const ratio = size ? `${size.width} / ${size.height}` : fallbackRatio;
  return (
    <div className={cn("relative max-h-[680px] w-full overflow-hidden bg-pm-tile", className)} style={{ aspectRatio: ratio }}>
      <Image src={src} alt="" aria-hidden fill priority={priority} sizes={sizes} className="scale-110 object-cover blur-2xl brightness-[0.6]" />
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-contain" />
    </div>
  );
}
