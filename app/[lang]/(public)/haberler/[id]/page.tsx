import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsGallery from "@/components/news/NewsGallery";
import { getDict } from "@/lib/i18n";
import { DATE_LOCALES, localePath, type Lang } from "@/lib/i18n/config";
import { pageMetadata } from "@/lib/seo/pageMetadata";
import { newsDate, newsParagraphs, newsSlides } from "@/lib/news";
import { reveal } from "@/lib/reveal";
import { getSiteContent } from "@/lib/server/content";
import { getPublishedNewsItem } from "@/lib/server/news";

// ISR: rendered on first visit, then refreshed at most once a minute, so an
// unpublished item turns into a 404 within about a minute.
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, ...rest } = await params;
  const lang = rest.lang as Lang;
  const news = await getPublishedNewsItem(id);
  if (!news) return { title: getDict(lang).notFound.title };
  return pageMetadata(lang, `/haberler/${id}`, { title: news.title, description: news.body.slice(0, 160), images: [news.cover.url] });
}

export default async function NewsPage({ params }: Props) {
  const { id, ...rest } = await params;
  const lang = rest.lang as Lang;
  const t = getDict(lang);
  if (!(await getSiteContent()).features.news) notFound();
  const news = await getPublishedNewsItem(id);
  if (!news) notFound();

  return (
    <main className="mx-auto grid max-w-[1248px] items-start gap-4 lg:grid-cols-[600px_minmax(0,1fr)] lg:gap-14 lg:px-6 lg:pt-10">
      <NewsGallery slides={newsSlides(news)} title={news.title} />
      <article className="flex min-w-0 flex-col gap-3 px-6 pb-6 lg:gap-4 lg:px-0 lg:pt-2">
        <Link href={localePath(lang, "/community?tab=haberler")} className="hidden text-sm font-bold text-pm-mint transition-colors hover:text-pm-mint-hover lg:block">
          ‹ {t.news.all}
        </Link>
        <span className="text-xs font-bold tracking-[1.2px] text-[#ecd28f] uppercase lg:text-[13px] lg:tracking-[1.4px]" {...reveal("right")}>
          {t.news.eyebrow} · {newsDate(news.news_date, DATE_LOCALES[lang])}
        </span>
        <h1 className="text-[28px] leading-[1.15] font-extrabold tracking-[-0.5px] text-pm-text text-balance lg:text-[40px] lg:leading-[1.12] lg:tracking-[-0.8px]" {...reveal("right", 60)}>
          {news.title}
        </h1>
        <div className="flex max-w-[560px] flex-col gap-4 text-base leading-[1.6] text-pm-text-2 lg:text-lg lg:leading-[1.65]" {...reveal("up", 120)}>
          {newsParagraphs(news.body).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
        <Link href={localePath(lang, "/community?tab=haberler")} className="py-3 text-sm font-bold text-pm-mint transition-colors hover:text-pm-mint-hover lg:hidden">
          ‹ {t.news.all}
        </Link>
      </article>
    </main>
  );
}
