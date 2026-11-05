import Image from "next/image";
import { cn } from "@/lib/utils";
import type { NewsPhoto } from "@/lib/news";

type Props = { photo: NewsPhoto; alt: string; sizes: string; priority?: boolean; className?: string };

/**
 * A 4:5 frame. A crop fills it. "Sığdır" shows the whole photo over a blurred,
 * darkened copy of itself (PhotoFrame's rule); both layers use the same src and
 * sizes, so the browser downloads the image once.
 */
export default function NewsPhotoFrame({ photo, alt, sizes, priority = false, className }: Props) {
  return (
    <div className={cn("relative aspect-[4/5] w-full overflow-hidden bg-pm-tile", className)}>
      {photo.fit === "contain" ? (
        <>
          <Image src={photo.url} alt="" aria-hidden fill priority={priority} sizes={sizes} className="scale-110 object-cover blur-2xl brightness-[0.6]" />
          <Image src={photo.url} alt={alt} fill priority={priority} sizes={sizes} className="object-contain" />
        </>
      ) : (
        <Image src={photo.url} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      )}
    </div>
  );
}
