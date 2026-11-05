import Link from "next/link";
import { t } from "@/lib/i18n";
import { newsDate, newsSlides, type PublicNews } from "@/lib/news";
import { reveal } from "@/lib/reveal";
import { cn } from "@/lib/utils";
import NewsPhotoFrame from "./NewsPhotoFrame";

type Props = {
  news: PublicNews;
  /** "hero": the home page's card. "grid": /community. */
  variant?: "grid" | "hero";
  priority?: boolean;
  revealDelay?: number;
};

export default function NewsCard({ news, variant = "grid", priority = false, revealDelay }: Props) {
  const hero = variant === "hero";
  const count = newsSlides(news).length;
  return (
    <Link
      href={`/haberler/${news.id}`}
      className={cn("group flex flex-col overflow-hidden border border-pm-line bg-pm-card transition-colors hover:border-pm-mint/40", hero ? "rounded-[22px] lg:rounded-[24px]" : "rounded-[22px]")}
      {...(revealDelay !== undefined ? reveal("up", revealDelay) : {})}
    >
      <div className="relative">
        <NewsPhotoFrame
          photo={news.cover}
          alt={news.cover.alt ?? news.title}
          sizes={hero ? "(min-width: 1024px) 460px, 100vw" : "(min-width: 1024px) 18rem, 50vw"}
          priority={priority}
        />
        {!hero && news.is_featured && <span className="absolute top-2 left-2 rounded-[14px] bg-[#f6e3b0] px-2.5 py-1 text-xs font-extrabold text-[#4a360a] sm:top-3 sm:left-3">{t.news.featured}</span>}
        {!hero && count > 1 && <span className="absolute right-2 bottom-2 rounded-[14px] bg-[rgba(10,19,16,0.8)] px-2.5 py-1 text-xs font-bold text-pm-text sm:top-3 sm:right-3 sm:bottom-auto">{t.news.photos(count)}</span>}
      </div>
      <div className={cn("flex flex-col", hero ? "gap-1.5 p-4 lg:px-[22px] lg:py-[18px]" : "gap-1.5 p-3.5 lg:px-4")}>
        {hero ? (
          <span className="text-[11px] font-bold tracking-[1.2px] text-[#ecd28f] uppercase lg:text-xs">
            {t.news.eyebrow} · {newsDate(news.news_date)}
          </span>
        ) : (
          <span className="text-xs font-bold text-pm-mint">{newsDate(news.news_date)}</span>
        )}
        <h2 className={cn("leading-[1.25] font-extrabold text-pm-text", hero ? "text-lg lg:text-[21px]" : "text-[15px] sm:text-base")}>{news.title}</h2>
      </div>
    </Link>
  );
}
