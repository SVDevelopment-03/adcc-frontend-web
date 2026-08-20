import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Cloud, ChevronRight, Phone, Mail, MapPin } from "lucide-react";
import {
  getNews,
  type NewsItem,
  type NewsPagination,
} from "../../services/newsApi";
import { PublicPageHero, useWordList } from "../public/publicPageHelpers";

const NEWS_PAGE_SIZE = 6;
const FALLBACK_IMAGE = "/img/image 306912.png";

const getPaginationItems = (
  page: number,
  totalPages: number,
): Array<number | string> => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (page >= totalPages - 2)
    return [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

function formatByDate(value: string | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function NewsCard({ item }: { item: NewsItem }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const id = item.slug || item.id || item._id;
  const authorName =
    item.author ||
    item.createdBy?.fullName ||
    t("public.news.listing.defaultAuthor");
  const dateLabel = formatByDate(
    item.publishedAt || item.createdAt,
    i18n.language,
  );

  return (
    <button
      type="button"
      onClick={() => id && navigate(`/user-news/${id}`)}
      className="cursor-pointer flex flex-col overflow-hidden rounded-2xl bg-white text-start shadow-sm transition-all duration-300 hover:shadow-lg"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#f4f4f4]">
        <img
          src={item.coverImage || FALLBACK_IMAGE}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
      <div className="p-4 sm:p-5">
        <p className="text-[12px] text-black/50 sm:text-[13px]">
          {t("public.news.listing.byLine", {
            author: authorName,
            date: dateLabel,
          })}
        </p>
        <h3 className="mt-2 line-clamp-2 text-[18px]  uppercase leading-snug sm:text-[22px]">
          {item.title}
        </h3>
      </div>
    </button>
  );
}

export default function UserNews() {
  const { t, i18n } = useTranslation();
  const heroTitleWords = useWordList("public.news.listing.hero.titleWords");
  const heroBreadcrumb = useWordList("public.news.listing.hero.breadcrumb");

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<NewsPagination>({
    page: 1,
    limit: NEWS_PAGE_SIZE,
    total: 0,
    pages: 1,
  });

  useEffect(() => {
    setLoading(true);
    getNews({ page, limit: NEWS_PAGE_SIZE })
      .then(({ items, pagination }) => {
        setItems(items);
        setPagination(pagination);
      })
      .catch(() => {
        setItems([]);
        setPagination({ page: 1, limit: NEWS_PAGE_SIZE, total: 0, pages: 1 });
      })
      .finally(() => setLoading(false));
    // Re-fetch on language switch too — the API returns already-localized
    // text, so without this the titles stay in the old language until a
    // full page reload.
  }, [page, i18n.language]);

  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <header className="flex h-[78px] items-center justify-between px-4 sm:h-[96px] sm:px-6 md:px-10 lg:h-[134px] lg:px-20">
        <img
          src="/ADCC-Logo.png"
          alt="ADCC"
          className="h-[57px] w-[135px] object-contain"
        />

        <nav className="hidden lg:flex gap-12 text-[20px] font-medium">
          <span>{t("public.nav.aboutUs")}</span>
          <span>{t("public.nav.events")}</span>
          <span>{t("public.nav.community")}</span>
          <span>{t("public.nav.tracks")}</span>
        </nav>

        <div className="flex items-center gap-6">
          <Cloud size={24} />
          <span className="text-[17px]">{t("public.language.english")}</span>
          <button className="rounded-full bg-black px-8 py-4 text-[18px] font-bold text-white">
            {t("public.auth.menu")}
          </button>
        </div>
      </header>

      <PublicPageHero
        titleWords={heroTitleWords}
        breadcrumb={heroBreadcrumb}
        backgroundImage="/img/pexels-zakhar-36955801 1.png"
        classPrefix="store-page"
        breadcrumbFontSize={17}
      />

      <section className="w-full px-4 py-10 sm:px-6 sm:py-20 md:px-10 lg:px-20 lg:py-24">
        <h2 className="text-center text-[26px] uppercase leading-tight sm:text-[36px] lg:text-[44px]">
          {t("public.news.listing.heading")}
        </h2>
        <p className="mx-auto mt-4 max-w-[720px] text-center text-[14px] leading-6 text-black/60 sm:mt-6 sm:text-[17px]">
          {t("public.news.listing.subheading")}
        </p>

        {loading ? (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[300px] animate-pulse rounded-2xl bg-black/5 sm:h-[360px]"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="mt-10 text-center text-[15px] text-black/50 sm:mt-14 sm:text-[18px]">
            {t("public.news.listing.empty")}
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <NewsCard key={item.id || item._id} item={item} />
            ))}
          </div>
        )}

        {!loading && pagination.pages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[#019839] text-[13px] font-medium sm:mt-16 sm:gap-3 sm:text-[16px] lg:gap-8 lg:text-[20px]">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={pagination.page <= 1}
              aria-label={t("public.common.prevPage")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            >
              <ChevronRight className="h-3.5 w-3.5 rotate-180 sm:h-4 sm:w-4 lg:h-[22px] lg:w-[22px]" />
            </button>

            {getPaginationItems(pagination.page, pagination.pages).map(
              (item, index) =>
                item === "..." ? (
                  <span key={`ellipsis-${index}`} className="tracking-[0.25em]">
                    ..........
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPage(item as number)}
                    aria-current={item === pagination.page ? "page" : undefined}
                    className={
                      item === pagination.page
                        ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#019839] text-white sm:h-10 sm:w-10 lg:h-12 lg:w-12"
                        : "transition-colors hover:text-[#017a2e]"
                    }
                  >
                    {item}
                  </button>
                ),
            )}

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(pagination.pages, current + 1))
              }
              disabled={pagination.page >= pagination.pages}
              aria-label={t("public.common.nextPage")}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
            >
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[22px] lg:w-[22px]" />
            </button>
          </div>
        )}
      </section>

      <footer className="w-full px-4 py-24 sm:px-6 md:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img
              src="/ADCC-Logo.png"
              alt="ADCC"
              className="h-[63px] w-[149px] object-contain"
            />
            <p className="mt-8 max-w-[402px] text-[18px] leading-[23px]">
              {t("public.footer.brandText")}
            </p>

            <div className="mt-8 flex h-[57px] max-w-[367px] rounded-lg bg-[#8DDF93] p-[6px]">
              <input
                placeholder={t("public.footer.emailPlaceholder")}
                className="flex-1 bg-transparent px-4 outline-none"
              />
              <button className="rounded-lg bg-[#019839] px-7 text-white">
                {t("public.footer.submit")}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">
              {t("public.footer.quickLinks")}
            </h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>{t("public.nav.aboutUs")}</li>
              <li>{t("public.footer.rides")}</li>
              <li>{t("public.nav.events")}</li>
              <li>{t("public.footer.cyclistsCorner")}</li>
              <li>{t("public.footer.contactUs")}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">
              {t("public.footer.contactUs")}
            </h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3">
                <Phone size={22} /> +971 2 654 5645
              </li>
              <li className="flex gap-3">
                <Phone size={22} /> 144226
              </li>
              <li className="flex gap-3">
                <Mail size={22} /> {t("public.news.listing.footer.address")}
              </li>
              <li className="flex gap-3">
                <MapPin size={22} /> info@adcyclingclub.ae
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#d5d5d5] pt-8 text-center text-[18px] text-black/70">
          {t("public.footer.copyright")}
        </div>
      </footer>
    </div>
  );
}
