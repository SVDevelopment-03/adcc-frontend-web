import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Cloud,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Apple,
} from "lucide-react";
import {
  getMerchandiseCategories,
  getMerchandiseProductsPage,
  type ProductsPagination,
} from "../../services/merchandiseApi";
import type { Category, Product } from "../merchandise/merchandiseData";
import {
  AnimatedWords,
  PublicPageHero,
  useWordList,
} from "../public/publicPageHelpers";

const PRODUCTS_PAGE_SIZE = 6;

const getPaginationItems = (
  page: number,
  totalPages: number,
): Array<number | string> => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (page >= totalPages - 2)
    return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

function MerchandiseCard({ product }: { product: Product }) {
  const image = product.images?.[0] ?? "";
  const price = `${product.price.toLocaleString()} AED`;
  return (
    <div className="min-h-[381px] rounded-[10px] border border-black/5 p-8 shadow-inner transition-all duration-300 hover:border-[#435974] hover:bg-[#435974] hover:text-white">
      <h3 className="text-[24px] uppercase">{product.name}</h3>
      <p className="mt-1 text-[18px]">{price}</p>
      {image && (
        <img
          src={image}
          alt={product.name}
          className="mt-8 h-[240px] w-full object-contain mix-blend-multiply"
        />
      )}
    </div>
  );
}

export default function AdccStorePage() {
  const { t, i18n } = useTranslation();
  const heroTitleWords = useWordList("public.store.listing.hero.titleWords");
  const heroBreadcrumb = useWordList("public.store.listing.hero.breadcrumb");
  const browseTitleWords = useWordList("public.store.listing.browseTitleWords");
  const gearUpTitleWords = useWordList("public.store.listing.gearUp.titleWords");
  const [merchandiseProducts, setMerchandiseProducts] = useState<Product[]>([]);
  const [merchandiseLoading, setMerchandiseLoading] = useState(true);
  const [merchandisePage, setMerchandisePage] = useState(1);
  const [merchandisePagination, setMerchandisePagination] = useState<ProductsPagination>({
    page: 1,
    limit: PRODUCTS_PAGE_SIZE,
    total: 0,
    pages: 1,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => {
    getMerchandiseCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [i18n.language]);

  useEffect(() => {
    setMerchandiseLoading(true);
    getMerchandiseProductsPage({
      source: "adcc",
      status: "published",
      page: merchandisePage,
      limit: PRODUCTS_PAGE_SIZE,
      categoryId: selectedCategoryId || undefined,
      q: activeSearch || undefined,
    })
      .then(({ items, pagination }) => {
        setMerchandiseProducts(items);
        setMerchandisePagination(pagination);
      })
      .catch(() => {
        setMerchandiseProducts([]);
        setMerchandisePagination({ page: 1, limit: PRODUCTS_PAGE_SIZE, total: 0, pages: 1 });
      })
      .finally(() => setMerchandiseLoading(false));
    // Re-fetch on language switch too — the API returns already-localized
    // text, so without this the titles stay in the old language until a
    // full page reload.
  }, [merchandisePage, selectedCategoryId, activeSearch, i18n.language]);

  const selectedCategoryName = selectedCategoryId
    ? categories.find((category) => category.id === selectedCategoryId)?.name
    : null;

  const applyCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setMerchandisePage(1);
    setCategoryMenuOpen(false);
  };

  const runSearch = () => {
    setActiveSearch(searchInput.trim());
    setMerchandisePage(1);
  };

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
      />

      <section className="w-full px-4 py-10 sm:px-6 sm:py-20 md:px-10 lg:px-20 lg:py-24">
        <h2 className="flex justify-center overflow-hidden text-center text-[28px] font-normal uppercase sm:text-[38px] lg:text-[50px]">
          <AnimatedWords words={browseTitleWords} gap={16} />
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-[1fr_292px_156px]">
          <div className="flex h-[52px] items-center rounded-full border border-[#CBCBCB] bg-white px-6 sm:h-[66px] sm:px-8">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  runSearch();
                }
              }}
              placeholder={t("public.store.listing.searchPlaceholder")}
              className="flex-1 bg-transparent text-[15px] outline-none sm:text-[18px]"
            />
            <Search size={20} />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryMenuOpen((open) => !open)}
              aria-expanded={categoryMenuOpen}
              className="flex h-[52px] w-full items-center justify-between rounded-full border border-[#CBCBCB] bg-white px-6 text-[15px] sm:h-[66px] sm:px-8 sm:text-[18px]"
            >
              <span className="truncate">
                {selectedCategoryName ?? t("public.store.listing.allCategories")}
              </span>
              <ChevronDown
                size={20}
                className={`shrink-0 transition-transform ${categoryMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {categoryMenuOpen && (
              <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-[280px] overflow-y-auto rounded-2xl border border-[#CBCBCB] bg-white p-2 shadow-lg">
                <button
                  type="button"
                  onClick={() => applyCategory("")}
                  className={`block w-full rounded-xl px-4 py-2.5 text-start text-[15px] hover:bg-[#eaf4ff] ${
                    !selectedCategoryId ? "font-bold text-[#019839]" : ""
                  }`}
                >
                  {t("public.store.listing.allCategories")}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => applyCategory(category.id)}
                    className={`block w-full rounded-xl px-4 py-2.5 text-start text-[15px] hover:bg-[#eaf4ff] ${
                      selectedCategoryId === category.id ? "font-bold text-[#019839]" : ""
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={runSearch}
            className="h-[52px] rounded-full bg-[#019839] text-[16px] font-bold text-white sm:h-[66px] sm:text-[20px]"
          >
            {t("public.common.search")}
          </button>
        </div>

        {/* Club Merchandise */}
        <div className="mt-10 flex items-center gap-4 sm:mt-20 sm:gap-6">
          <h3 className="text-[20px] font-normal uppercase sm:text-[28px] lg:text-[32px]">{t("public.store.listing.clubMerchandiseHeading")}</h3>
          {!merchandiseLoading && (
            <span className="rounded-full bg-[#435974]/10 px-3 py-1 text-[12px] font-bold text-[#435974] sm:px-4 sm:text-[14px]">
              {t("public.store.listing.itemsCount", { count: merchandisePagination.total })}
            </span>
          )}
        </div>
        <div className="mt-2 h-px bg-black/10" />
        {merchandiseLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-h-[300px] animate-pulse rounded-[10px] bg-black/5 sm:min-h-[381px]" />
            ))}
          </div>
        ) : merchandiseProducts.length === 0 ? (
          <p className="mt-6 text-[15px] text-black/50 sm:mt-8 sm:text-[18px]">{t("public.store.listing.noMerchandise")}</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {merchandiseProducts.map((product) => (
              <MerchandiseCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!merchandiseLoading && merchandisePagination.pages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-[#019839] text-[16px] font-medium sm:mt-20 sm:gap-8 sm:text-[20px]">
            <button
              type="button"
              onClick={() => setMerchandisePage((page) => Math.max(1, page - 1))}
              disabled={merchandisePagination.page <= 1}
              aria-label={t("public.common.prevPage")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={22} className="rotate-180" />
            </button>

            {getPaginationItems(merchandisePagination.page, merchandisePagination.pages).map(
              (item, index) =>
                item === "..." ? (
                  <span key={`ellipsis-${index}`} className="tracking-[0.25em]">
                    ..........
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setMerchandisePage(item as number)}
                    aria-current={item === merchandisePagination.page ? "page" : undefined}
                    className={
                      item === merchandisePagination.page
                        ? "flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white"
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
                setMerchandisePage((page) => Math.min(merchandisePagination.pages, page + 1))
              }
              disabled={merchandisePagination.page >= merchandisePagination.pages}
              aria-label={t("public.common.nextPage")}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </section>

      <section className="pt-8 relative grid w-full grid-cols-1 items-end gap-8 overflow-hidden px-4 pb-12 sm:gap-16 sm:px-6 sm:pb-28 md:px-10 lg:grid-cols-2 lg:px-20">
        <div>
          <h2 className="max-w-[516px] overflow-hidden text-[28px] font-normal uppercase leading-tight sm:text-[38px] sm:leading-[46px] lg:text-[50px] lg:leading-[60px]">
            <AnimatedWords words={gearUpTitleWords} gap={16} />
          </h2>

          <p className="mt-6 max-w-[615px] text-[15px] font-normal leading-6 sm:mt-12 sm:text-[24px] sm:leading-[30px]">
            {t("public.store.listing.gearUp.body")}
          </p>

          <Link
            to="/contact-us"
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[16px] font-bold text-white sm:mt-10 sm:px-8 sm:py-4 sm:text-[18px]"
          >
            {t("public.common.getInTouch")} <ArrowRight size={20} />
          </Link>
        </div>

        <img
          src="/img/image 30691.png"
          alt={t("public.store.listing.gearUp.imageAlt")}
          className="h-[300px] w-full max-w-[686px] object-contain sm:h-[568px] lg:absolute lg:bottom-[-25px] lg:end-0"
        />
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
                <Phone size={22} /> +971 2 654 5645
              </li>
              <li className="flex gap-3">
                <Phone size={22} /> 144226
              </li>
              <li className="flex gap-3">
                <Mail size={22} /> {t("public.store.listing.footer.address")}
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
