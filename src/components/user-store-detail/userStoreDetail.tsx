import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Cloud,
  Star,
  MapPin,
  Phone,
  Share2,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { AnimatedWords, useWordList } from "../public/publicPageHelpers";
import {
  getStoreItemById,
  getStoreItemsPage,
  type StoreItem,
} from "../../services/storeApi";

const FALLBACK_IMAGE = "/img/image 306912.png";
const FALLBACK_AVATAR = "/img/ImageWithFallback.png";

function formatRelativeTime(input: string | undefined, locale: string): string {
  if (!input) return "";
  const then = new Date(input).getTime();
  if (!Number.isFinite(then)) return "";
  const diffSeconds = Math.round((then - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const divisions: Array<[number, Intl.RelativeTimeFormatUnit]> = [
    [60, "seconds"],
    [60, "minutes"],
    [24, "hours"],
    [30, "days"],
    [12, "months"],
    [Infinity, "years"],
  ];

  let duration = diffSeconds;
  for (const [amount, unit] of divisions) {
    if (Math.abs(duration) < amount) {
      return rtf.format(Math.round(duration), unit);
    }
    duration /= amount;
  }
  return "";
}

function dedupeImages(
  ...groups: Array<string | string[] | undefined>
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  groups.flat().forEach((image) => {
    const trimmed = (image || "").trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  });
  return result;
}

/** Ecommerce-style product gallery: clickable thumbnails, prev/next sliding, swipe, hover-zoom + a zoomable lightbox. */
function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const { t } = useTranslation();
  const list = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [zoom, setZoom] = useState<{ origin: string; scale: number }>({
    origin: "center",
    scale: 1,
  });
  const touchStartX = useRef<number | null>(null);

  const safeIndex = Math.min(activeIndex, list.length - 1);
  const activeImage = list[safeIndex];

  const goPrev = () => {
    setLightboxZoomed(false);
    setActiveIndex((current) => (current - 1 + list.length) % list.length);
  };
  const goNext = () => {
    setLightboxZoomed(false);
    setActiveIndex((current) => (current + 1) % list.length);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ origin: `${x}% ${y}%`, scale: 1.6 });
  };
  const resetZoom = () => setZoom({ origin: "center", scale: 1 });

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta > 0 ? goPrev() : goNext();
    }
    touchStartX.current = null;
  };

  const onImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div>
      <div
        className="relative flex aspect-[4/3] cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#f4f4f4] sm:aspect-[16/11] lg:aspect-auto lg:h-[440px] xl:h-[500px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetZoom}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          setLightboxZoomed(false);
          setLightboxOpen(true);
        }}
      >
        <img
          src={activeImage}
          alt={alt}
          className="h-full w-full object-contain transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom.scale})`,
            transformOrigin: zoom.origin,
          }}
          onError={onImageError}
        />

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label={t("public.marketplace.detail.previousImage")}
              className="absolute start-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow sm:h-8 sm:w-8"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label={t("public.marketplace.detail.nextImage")}
              className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow sm:h-8 sm:w-8"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
          {list.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === safeIndex}
              className={`h-16 overflow-hidden rounded-lg border-2 bg-[#f4f4f4] transition-colors sm:h-20 lg:h-[92px] ${
                index === safeIndex ? "border-[#019839]" : "border-transparent"
              }`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
                onError={onImageError}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label={t("public.marketplace.detail.closeGallery")}
            className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X size={18} />
          </button>

          {list.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label={t("public.marketplace.detail.previousImage")}
              className="absolute start-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white sm:start-4"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img
            src={activeImage}
            alt={alt}
            onClick={(event) => {
              event.stopPropagation();
              setLightboxZoomed((current) => !current);
            }}
            className={`max-h-[85vh] max-w-[90vw] cursor-zoom-in object-contain transition-transform duration-300 ${
              lightboxZoomed ? "scale-150 cursor-zoom-out" : ""
            }`}
            onError={onImageError}
          />

          {list.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label={t("public.marketplace.detail.nextImage")}
              className="absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white sm:end-4"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function StoreDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const similarTitleWords = useWordList(
    "public.marketplace.detail.similarTitleWords",
  );

  const [item, setItem] = useState<StoreItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [similarItems, setSimilarItems] = useState<StoreItem[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getStoreItemById(id)
      .then((data) => {
        if (!cancelled) setItem(data);
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
    if (!item) return;
    const currentId = item.id || item._id;
    let cancelled = false;

    getStoreItemsPage({ status: "Approved", category: item.category, limit: 6 })
      .then(({ items: sameCategory }) => {
        const pool = sameCategory.filter(
          (candidate) => (candidate.id || candidate._id) !== currentId,
        );
        if (pool.length >= 3) {
          if (!cancelled) setSimilarItems(pool.slice(0, 3));
          return;
        }
        return getStoreItemsPage({ status: "Approved", limit: 12 }).then(
          ({ items: fallback }) => {
            const seen = new Set(
              pool.map((candidate) => candidate.id || candidate._id),
            );
            const extras = fallback.filter((candidate) => {
              const candidateId = candidate.id || candidate._id;
              return candidateId !== currentId && !seen.has(candidateId);
            });
            if (!cancelled) setSimilarItems([...pool, ...extras].slice(0, 3));
          },
        );
      })
      .catch(() => {
        if (!cancelled) setSimilarItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [item?.id, item?._id, item?.category]);

  const galleryImages = item ? dedupeImages(item.coverImage, item.photos) : [];

  const sellerName =
    item?.sellerName ||
    item?.createdBy?.fullName ||
    t("public.marketplace.detail.unknownSeller");
  const sellerAvatar = item?.createdBy?.profileImage || FALLBACK_AVATAR;
  const postedLabel = formatRelativeTime(item?.createdAt, i18n.language);

  const infoRows: [string, string][] = item
    ? [
        [t("public.marketplace.detail.fields.category"), item.category || "—"],
        [
          t("public.marketplace.detail.fields.condition"),
          item.condition || "—",
        ],
        [t("public.marketplace.detail.fields.location"), item.city || "—"],
        [t("public.marketplace.detail.fields.posted"), postedLabel || "—"],
      ]
    : [];

  const contactDigits = (item?.phoneNumber || "").replace(/[^\d+]/g, "");
  const contactHref = contactDigits
    ? item?.contactMethod === "WhatsApp"
      ? `https://wa.me/${contactDigits.replace(/^\+/, "")}`
      : `tel:${contactDigits}`
    : "";

  const handleContactSeller = () => {
    if (!contactDigits || !contactHref) {
      toast.error(t("public.marketplace.detail.noContactInfo"));
      return;
    }
    if (item?.contactMethod === "WhatsApp") {
      window.open(contactHref, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = contactHref;
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: item?.title || "ADCC Marketplace",
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled share sheet — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("public.marketplace.detail.linkCopied"));
    } catch {
      toast.error(t("public.marketplace.detail.linkCopied"));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-[16px] sm:text-[18px]">
          {t("public.marketplace.detail.loading")}
        </p>
      </div>
    );
  }

  if (loadError || !item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <p className="text-[18px] font-semibold sm:text-[22px]">
          {t("public.marketplace.detail.notFound")}
        </p>
        <Link
          to="/user-marketplace"
          className="rounded-full bg-[#019839] px-8 py-3 text-[15px] font-medium text-white sm:text-[16px]"
        >
          {t("public.marketplace.detail.backToMarketplace")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-black">
      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
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

      <main className="mx-auto max-w-[1440px] px-4 py-10 pt-24 sm:px-6 sm:py-14 sm:pt-28 md:px-10 lg:px-20 lg:py-16 lg:pt-32 xl:pt-36">
        <section className="grid grid-cols-1 items-start gap-8 sm:gap-10 lg:grid-cols-[480px_1fr] lg:gap-14 xl:grid-cols-[560px_1fr]">
          <ProductGallery
            key={item.id || item._id}
            images={galleryImages}
            alt={item.title}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[#F58700]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3 sm:h-3 sm:w-3 lg:h-3 lg:w-3"
                  fill="currentColor"
                />
              ))}
              <span className="ms-2 text-[13px] font-medium text-[#555] sm:text-[16px] lg:text-[18px]">
                {t("public.marketplace.detail.trustedBy")}
              </span>
            </div>

            <h1 className="mt-3 text-[26px]  uppercase leading-tight sm:mt-4 sm:text-[34px] lg:text-[42px]">
              {item.title}
            </h1>

            <p className="mt-3 max-w-[499px] text-[14px] leading-6 text-[#555] sm:mt-4 sm:text-[16px] lg:text-[18px]">
              {item.description}
            </p>

            <h2 className="mt-5 text-[24px]  sm:mt-6 sm:text-[28px] lg:text-[32px]">
              {item.currency} {Number(item.price ?? 0).toLocaleString()}
            </h2>

            <div className="mt-6 rounded-xl bg-[#323232] p-5 text-white sm:mt-8 sm:p-6 lg:max-w-[480px] lg:p-8 xl:max-w-[560px]">
              <div className="flex items-center gap-4 sm:gap-6">
                <img
                  src={sellerAvatar}
                  alt={t("public.marketplace.detail.sellerAlt")}
                  className="h-10 w-10 rounded-full object-cover sm:h-16 sm:w-16 lg:h-[70px] lg:w-[70px]"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = FALLBACK_AVATAR;
                  }}
                />
                <div>
                  <h3 className="text-[18px] sm:text-[22px] lg:text-[26px]">
                    {sellerName}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-[13px] text-white/60 sm:text-[16px] lg:text-[16px]">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                    {item.city || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-[13px] sm:mt-6 sm:space-y-4 sm:text-[15px] lg:text-[16px]">
                {infoRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between border-b border-white/30 pb-3 sm:pb-4"
                  >
                    <span className="text-white/80">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <button
                type="button"
                onClick={handleContactSeller}
                className="cursor-pointer flex h-11 items-center gap-2 rounded-full bg-[#019839] px-6 text-[14px] font-medium text-white sm:h-12 sm:px-8 sm:text-[16px] lg:h-[52px] lg:text-[18px]"
              >
                <Phone size={18} />{" "}
                {t("public.marketplace.detail.contactSeller")}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex h-11 items-center gap-2 rounded-full border border-[#019839] px-6 text-[14px] font-medium text-[#019839] sm:h-12 sm:px-8 sm:text-[16px] lg:h-[52px] lg:text-[18px]"
              >
                <Share2 size={18} /> {t("public.marketplace.detail.share")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-16 sm:mt-20 lg:mt-24">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="text-[22px] uppercase text-[#333] sm:text-[28px] lg:text-[32px]">
              {t("public.marketplace.detail.aboutHeading")}
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-black/70 sm:mt-6 sm:text-[16px] lg:text-[18px]">
              {item.description}
            </p>
          </div>
        </section>

        <section className="mt-10 sm:mt-14 lg:mt-20">
          <h2 className="flex justify-center overflow-hidden text-center text-[28px] uppercase sm:text-[36px] lg:text-[44px]">
            <AnimatedWords words={similarTitleWords} gap={16} />
          </h2>

          {similarItems.length === 0 ? (
            <p className="mt-8 text-center text-[15px] text-black/50 sm:mt-10 sm:text-[18px]">
              {t("public.marketplace.detail.noSimilar")}
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:mt-8 lg:gap-8">
              {similarItems.map((similar) => {
                const similarId = similar.id || similar._id;
                const similarImage =
                  similar.coverImage || similar.photos?.[0] || FALLBACK_IMAGE;
                return (
                  <button
                    type="button"
                    key={similarId}
                    onClick={() =>
                      similarId && navigate(`/user-marketplace/${similarId}`)
                    }
                    className="cursor-pointer min-h-[220px] rounded-[10px] border border-black/10 p-5 text-start shadow-sm transition-all duration-300 hover:border-[#435974] hover:shadow-md sm:min-h-[280px] sm:p-6 lg:min-h-[340px] lg:p-8"
                  >
                    <h3 className="text-[16px] uppercase sm:text-[18px] lg:text-[22px]">
                      {similar.title}
                    </h3>
                    <p className="mt-1 text-[14px] font-medium sm:text-[16px] lg:text-[18px]">
                      {similar.currency}{" "}
                      {Number(similar.price ?? 0).toLocaleString()}
                    </p>
                    <img
                      src={similarImage}
                      alt={similar.title}
                      className="mt-4 h-[140px] w-full object-contain mix-blend-multiply sm:mt-6 sm:h-[180px] lg:mt-8 lg:h-[220px]"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-[1268px] px-10 py-24">
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
                <Mail size={22} />{" "}
                {t("public.marketplace.detail.footer.address")}
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
