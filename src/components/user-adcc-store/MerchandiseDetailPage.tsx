import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Cloud, Star, Phone, Share2, Mail, MapPin, Tag } from "lucide-react";
import {
  AnimatedWords,
  useWordList,
  ProductGallery,
  FALLBACK_IMAGE,
} from "../public/publicPageHelpers";
import {
  getMerchandiseProductById,
  getMerchandiseProductsPage,
  getMerchandiseCategories,
} from "../../services/merchandiseApi";
import type { Category, Product } from "../merchandise/merchandiseData";

const ADCC_CONTACT_NUMBER = "+971 2 654 5645";

export default function MerchandiseDetailPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const similarTitleWords = useWordList("public.store.detail.similarTitleWords");

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setLoadError(true);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    getMerchandiseProductById(id)
      .then((data) => {
        if (!cancelled) setProduct(data);
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
    // Re-fetch on language switch too — the API returns already-localized
    // text, so without this the title/description stay in the old language
    // until a full page reload.
  }, [id, i18n.language]);

  useEffect(() => {
    getMerchandiseCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [i18n.language]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    getMerchandiseProductsPage({
      source: "adcc",
      status: "published",
      categoryId: product.categoryId,
      limit: 6,
    })
      .then(({ items: sameCategory }) => {
        const pool = sameCategory.filter((candidate) => candidate.id !== product.id);
        if (pool.length >= 3) {
          if (!cancelled) setSimilarProducts(pool.slice(0, 3));
          return;
        }
        return getMerchandiseProductsPage({ source: "adcc", status: "published", limit: 12 }).then(
          ({ items: fallback }) => {
            const seen = new Set(pool.map((candidate) => candidate.id));
            const extras = fallback.filter(
              (candidate) => candidate.id !== product.id && !seen.has(candidate.id),
            );
            if (!cancelled) setSimilarProducts([...pool, ...extras].slice(0, 3));
          },
        );
      })
      .catch(() => {
        if (!cancelled) setSimilarProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.categoryId, i18n.language]);

  const categoryName =
    categories.find((category) => category.id === product?.categoryId)?.name ?? "—";

  const inStock = (product?.totalStock ?? 0) > 0;

  const infoRows: [string, string][] = product
    ? [
        [t("public.store.detail.fields.category"), categoryName],
        [t("public.store.detail.fields.sku"), product.sku || "—"],
        [
          t("public.store.detail.fields.availability"),
          inStock ? t("public.store.detail.inStock") : t("public.store.detail.outOfStock"),
        ],
      ]
    : [];

  const contactHref = `tel:${ADCC_CONTACT_NUMBER.replace(/[^\d+]/g, "")}`;

  const handleContactAdccTeam = () => {
    window.location.href = contactHref;
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: product?.name || "ADCC Store",
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
      toast.success(t("public.store.detail.linkCopied"));
    } catch {
      toast.error(t("public.store.detail.linkCopied"));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-black">
        <p className="text-[16px] sm:text-[18px]">{t("public.store.detail.loading")}</p>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
        <p className="text-[18px] font-semibold sm:text-[22px]">
          {t("public.store.detail.notFound")}
        </p>
        <Link
          to="/user-adcc-store"
          className="rounded-full bg-[#019839] px-8 py-3 text-[15px] font-medium text-white sm:text-[16px]"
        >
          {t("public.store.detail.backToStore")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black">
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

      <main className="mx-auto max-w-[1440px] px-4 py-10 pt-24 sm:px-6 sm:py-14 sm:pt-28 md:px-10 lg:px-20 lg:py-16 lg:pt-32 xl:pt-36">
        <section className="grid grid-cols-1 items-start gap-8 sm:gap-10 lg:grid-cols-[480px_1fr] lg:gap-14 xl:grid-cols-[560px_1fr]">
          <ProductGallery key={product.id} images={product.images ?? []} alt={product.name} />

          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-[#F58700]">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-3 w-3 sm:h-3 sm:w-3 lg:h-3 lg:w-3" fill="currentColor" />
              ))}
              <span className="ms-2 text-[13px] font-medium text-[#555] sm:text-[16px] lg:text-[18px]">
                {t("public.store.detail.trustedBy")}
              </span>
            </div>

            <h1 className="mt-3 text-[26px] uppercase leading-tight sm:mt-4 sm:text-[34px] lg:text-[42px]">
              {product.name}
            </h1>

            <p className="mt-3 max-w-[499px] text-[14px] leading-6 text-[#555] sm:mt-4 sm:text-[16px] lg:text-[18px]">
              {product.description}
            </p>

            <h2 className="mt-5 text-[24px] sm:mt-6 sm:text-[28px] lg:text-[32px]">
              {Number(product.price ?? 0).toLocaleString()} {t("public.common.aed")}
              {product.originalPrice ? (
                <span className="ms-3 text-[16px] text-black/40 line-through sm:text-[20px]">
                  {Number(product.originalPrice).toLocaleString()} {t("public.common.aed")}
                </span>
              ) : null}
            </h2>

            <div className="mt-6 rounded-xl bg-[#323232] p-5 text-white sm:mt-8 sm:p-6 lg:max-w-[480px] lg:p-8 xl:max-w-[560px]">
              <div className="flex items-center gap-4 sm:gap-6">
                <img
                  src="/images/adcc-logo.png"
                  alt="ADCC"
                  className="h-10 w-10 rounded-full bg-white object-contain p-1.5 sm:h-16 sm:w-16 lg:h-[70px] lg:w-[70px]"
                />
                <div>
                  <h3 className="text-[18px] sm:text-[22px] lg:text-[26px]">
                    {t("public.store.detail.officialStore")}
                  </h3>
                  <p className="mt-1 flex items-center gap-2 text-[13px] text-white/60 sm:text-[16px] lg:text-[16px]">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />{" "}
                    {t("public.store.detail.officialStoreLocation")}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-[13px] sm:mt-6 sm:space-y-4 sm:text-[15px] lg:text-[16px]">
                {infoRows.map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-white/30 pb-3 sm:pb-4">
                    <span className="text-white/80">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <button
                type="button"
                onClick={handleContactAdccTeam}
                className="cursor-pointer flex h-11 items-center gap-2 rounded-full bg-[#019839] px-6 text-[14px] font-medium text-white sm:h-12 sm:px-8 sm:text-[16px] lg:h-[52px] lg:text-[18px]"
              >
                <Phone size={18} /> {t("public.store.detail.contactAdccTeam")}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex h-11 items-center gap-2 rounded-full border border-[#019839] px-6 text-[14px] font-medium text-[#019839] sm:h-12 sm:px-8 sm:text-[16px] lg:h-[52px] lg:text-[18px]"
              >
                <Share2 size={18} /> {t("public.store.detail.share")}
              </button>
            </div>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#435974]/10 px-3 py-1.5 text-[13px] font-medium text-[#435974]"
                  >
                    <Tag size={12} /> {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="mt-16 sm:mt-20 lg:mt-24">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="text-[22px] uppercase text-[#333] sm:text-[28px] lg:text-[32px]">
              {t("public.store.detail.aboutHeading")}
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-black/70 sm:mt-6 sm:text-[16px] lg:text-[18px]">
              {product.description}
            </p>
          </div>
        </section>

        <section className="mt-10 sm:mt-14 lg:mt-20">
          <h2 className="flex justify-center overflow-hidden text-center text-[28px] uppercase sm:text-[36px] lg:text-[44px]">
            <AnimatedWords words={similarTitleWords} gap={16} />
          </h2>

          {similarProducts.length === 0 ? (
            <p className="mt-8 text-center text-[15px] text-black/50 sm:mt-10 sm:text-[18px]">
              {t("public.store.detail.noSimilar")}
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-12 sm:gap-6 md:grid-cols-3 lg:mt-8 lg:gap-8">
              {similarProducts.map((similar) => {
                const similarImage = similar.images?.[0] ?? FALLBACK_IMAGE;
                return (
                  <button
                    type="button"
                    key={similar.id}
                    onClick={() => navigate(`/user-adcc-store/product/${similar.id}`)}
                    className="cursor-pointer min-h-[220px] rounded-[10px] border border-black/10 bg-[#fbf3f3] p-5 text-start shadow-sm transition-all duration-300 hover:border-[#435974] hover:shadow-md sm:min-h-[280px] sm:p-6 lg:min-h-[340px] lg:p-8"
                  >
                    <h3 className="text-[16px] uppercase sm:text-[18px] lg:text-[22px]">{similar.name}</h3>
                    <p className="mt-1 text-[14px] font-medium sm:text-[16px] lg:text-[18px]">
                      {Number(similar.price ?? 0).toLocaleString()} {t("public.common.aed")}
                    </p>
                    <img
                      src={similarImage}
                      alt={similar.name}
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
              <li className="flex gap-3">
                <Phone size={22} /> {ADCC_CONTACT_NUMBER}
              </li>
              <li className="flex gap-3">
                <Phone size={22} /> 144226
              </li>
              <li className="flex gap-3">
                <Mail size={22} /> {t("public.store.detail.footer.address")}
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
