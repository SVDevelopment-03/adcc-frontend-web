import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Cloud, Calendar, User, Share2, ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { getNews, getNewsById, type NewsItem } from "../../services/newsApi";

const FALLBACK_IMAGE = "/img/image 306912.png";

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "ar" ? "ar" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function UserNewsDetail() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [related, setRelated] = useState<NewsItem[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getNewsById(id)
      .then((data) => {
        if (!cancelled) setNews(data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!news) return;
    const currentId = news.id || news._id;
    let cancelled = false;
    getNews({ limit: 4 })
      .then(({ items }) => {
        if (!cancelled) {
          setRelated(items.filter((item) => (item.id || item._id) !== currentId).slice(0, 3));
        }
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [news?.id, news?._id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: news?.title || "ADCC News", url: shareUrl });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("public.news.detail.linkCopied"));
    } catch {
      toast.error(t("public.news.detail.linkCopied"));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-[16px] sm:text-[18px]">{t("public.news.detail.loading")}</p>
      </div>
    );
  }

  if (loadError || !news) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <p className="text-[18px] font-semibold sm:text-[22px]">{t("public.news.detail.notFound")}</p>
        <Link
          to="/user-news"
          className="rounded-full bg-[#019839] px-8 py-3 text-[15px] font-medium text-white sm:text-[16px]"
        >
          {t("public.news.detail.backToNews")}
        </Link>
      </div>
    );
  }

  const authorName = news.author || news.createdBy?.fullName || t("public.news.listing.defaultAuthor");
  const dateLabel = formatDate(news.publishedAt || news.createdAt, i18n.language);

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
        <img src="/ADCC-Logo.png" alt="ADCC" className="h-[57px] w-[135px] object-contain" />

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

      <main className="mx-auto max-w-[900px] px-4 pt-24 pb-16 sm:px-6 sm:pt-28 lg:pt-32">
        <Link
          to="/user-news"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-black/60 hover:text-black sm:text-[15px]"
        >
          <ArrowLeft size={16} /> {t("public.news.detail.backToNews")}
        </Link>

        {news.category && (
          <span className="mt-6 inline-block rounded-full bg-[#019839]/10 px-4 py-1.5 text-[12px] font-semibold uppercase text-[#019839] sm:text-[13px]">
            {news.category}
          </span>
        )}

        <h1 className="mt-4 text-[26px] font-semibold uppercase leading-tight sm:mt-5 sm:text-[38px] lg:text-[46px]">
          {news.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-[13px] text-black/60 sm:text-[15px]">
          <span className="flex items-center gap-2">
            <User size={16} /> {authorName}
          </span>
          {dateLabel && (
            <span className="flex items-center gap-2">
              <Calendar size={16} /> {dateLabel}
            </span>
          )}
          <button
            type="button"
            onClick={handleShare}
            className="ms-auto flex items-center gap-2 rounded-full border border-black/10 px-4 py-1.5 text-[13px] font-medium text-black/70 hover:border-[#019839] hover:text-[#019839] sm:text-[14px]"
          >
            <Share2 size={15} /> {t("public.news.detail.share")}
          </button>
        </div>

        <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#f4f4f4] sm:mt-10">
          <img
            src={news.coverImage || FALLBACK_IMAGE}
            alt={news.title}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div
          className="mt-8 max-w-none text-[15px] leading-7 text-black/80 sm:mt-10 sm:text-[17px] [&_a]:text-[#019839] [&_blockquote]:border-s-4 [&_blockquote]:border-[#019839]/30 [&_blockquote]:ps-4 [&_blockquote]:italic [&_h2]:mt-6 [&_h2]:text-[24px] [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:text-[20px] [&_h3]:font-semibold [&_img]:rounded-xl [&_ol]:list-decimal [&_ol]:ps-6 [&_p]:mt-4 [&_ul]:list-disc [&_ul]:ps-6"
          dangerouslySetInnerHTML={{ __html: news.content }}
        />

        {related.length > 0 && (
          <section className="mt-16 border-t border-black/10 pt-10 sm:mt-20 sm:pt-12">
            <h2 className="text-[20px] font-semibold uppercase sm:text-[24px]">
              {t("public.news.detail.relatedHeading")}
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
              {related.map((item) => {
                const relatedId = item.id || item._id;
                return (
                  <button
                    type="button"
                    key={relatedId}
                    onClick={() => relatedId && navigate(`/user-news/${relatedId}`)}
                    className="flex flex-col overflow-hidden rounded-xl border border-black/5 text-start transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-[#f4f4f4]">
                      <img
                        src={item.coverImage || FALLBACK_IMAGE}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="line-clamp-2 text-[14px] font-semibold uppercase leading-snug sm:text-[15px]">
                        {item.title}
                      </h3>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-[1268px] px-10 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img src="/ADCC-Logo.png" alt="ADCC" className="h-[63px] w-[149px] object-contain" />
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
            <h4 className="text-[24px] font-black uppercase">{t("public.footer.quickLinks")}</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>{t("public.nav.aboutUs")}</li>
              <li>{t("public.footer.rides")}</li>
              <li>{t("public.nav.events")}</li>
              <li>{t("public.footer.cyclistsCorner")}</li>
              <li>{t("public.footer.contactUs")}</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">{t("public.footer.contactUs")}</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3"><Phone size={22} /> +971 2 654 5645</li>
              <li className="flex gap-3"><Phone size={22} /> 144226</li>
              <li className="flex gap-3">
                <Mail size={22} /> {t("public.news.listing.footer.address")}
              </li>
              <li className="flex gap-3"><MapPin size={22} /> info@adcyclingclub.ae</li>
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
