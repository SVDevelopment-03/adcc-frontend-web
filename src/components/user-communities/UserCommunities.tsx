import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronDown,
  Users,
  CalendarDays,
  Plus,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  CommunityApiResponse,
  getAvailableCities,
  getCommunities,
} from "../../services/communitiesApi";
import { motion } from "framer-motion";
import {
  AnimatedWords,
  PublicPageHero,
  useWordList,
} from "../public/publicPageHelpers";

const FontLoader = () => (
  <style>{`



.font-bebas{font-family: 'Bebas Kai', sans-serif !important;
}
.justify-center{justify-content:center !important;}


    
    body { background: #EAF4FF; color: #000; }
    .bebas { font-family: 'Bebas Kai', sans-serif; font-weight: 400; letter-spacing: 0; }
    .communities-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
    .communities-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
      inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
    }
    @media (max-width: 768px) {
      .communities-page-hero {
        height: 360px !important;
      }
      .communities-page-hero-content {
        bottom: 40px !important;
        inset-inline-start: 16px !important;
      }
    }
    @media (min-width: 769px) and (max-width: 1024px) {
      .communities-page-hero {
        height: 480px !important;
      }
    }
    @media (min-width: 1025px) {
      .communities-page-hero {
        height: 620px !important;
      }
    }
  `}</style>
);

const COMMUNITIES_PER_PAGE = 4;
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const FALLBACK_COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop";

const COMMUNITY_TYPE_OPTIONS = [
  "Family Rides",
  "Racing & Performance",
  "Women (SheRides)",
  "Youth Cycling",
  "Weekend Social",
  "Night Riders",
  "MTB/Trail",
  "Training & Clinics",
] as const;

const COMMUNITY_TYPE_LOCALE_KEYS: Record<
  (typeof COMMUNITY_TYPE_OPTIONS)[number],
  string
> = {
  "Family Rides": "familyRides",
  "Racing & Performance": "racingPerformance",
  "Women (SheRides)": "sheRides",
  "Youth Cycling": "youthCycling",
  "Weekend Social": "weekendSocial",
  "Night Riders": "nightRiders",
  "MTB/Trail": "mtbTrail",
  "Training & Clinics": "trainingClinics",
};

type FaqItem = { q: string; a: string };

function resolveCommunityImage(image?: string) {
  const trimmed = image?.trim() ?? "";
  if (!trimmed) return FALLBACK_COMMUNITY_IMAGE;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return new URL(trimmed.replace(/^\/+/, ""), `${API_BASE_URL}/`).toString();
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  });

  return result;
}

export default function CommunitiesPage() {
  const { t, i18n } = useTranslation();
  const heroTitleWords = useWordList("public.communities.hero.titleWords");
  const heroBreadcrumb = useWordList("public.communities.hero.breadcrumb");
  const introTitleWords = useWordList("public.communities.intro.titleWords");
  const exploreTitleWords = useWordList(
    "public.communities.explore.titleWords",
  );
  const faqs = t("public.tracks.faq.items", {
    returnObjects: true,
  }) as FaqItem[];

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<"city" | "type" | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [communities, setCommunities] = useState<
    Array<{
      id: string;
      title: string;
      members: string;
      events: string;
      image: string;
    }>
  >([]);
  const [totalPages, setTotalPages] = useState(1);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const formatCount = useCallback(
    (
      value: number | string | undefined,
      labelKey: "members" | "eventsCount",
    ) => {
      const count = Number(value ?? 0);
      const formattedCount = Number.isFinite(count)
        ? count.toLocaleString(i18n.language)
        : "0";
      return t(`public.common.${labelKey}`, { formattedCount });
    },
    [i18n.language, t],
  );

  const mapCommunityCard = useCallback(
    (community: CommunityApiResponse) => ({
      id: community._id || community.id || community.title,
      title:
        community.title ||
        community.name ||
        t("public.common.communityFallback"),
      members: formatCount(community.memberCount, "members"),
      events: formatCount(
        community.upcomingEventCount ?? community.eventsCount,
        "eventsCount",
      ),
      image: resolveCommunityImage(community.image),
    }),
    [formatCount, t],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCities() {
      try {
        const available = await getAvailableCities();
        if (isMounted && available.length > 0) {
          setCities(available);
        }
      } catch {
        if (isMounted) {
          setCities(["Abu Dhabi", "Al Ain", "Dubai", "Al Dhafra", "Sharjah"]);
        }
      }
    }

    loadCities();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(false);

      const response = await getCommunities({
        page: currentPage,
        limit: COMMUNITIES_PER_PAGE,
        search: searchQuery || undefined,
        location: cityFilter !== "all" ? cityFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
        isActive: true,
      });

      setCommunities(response.communities.map(mapCommunityCard));
      setTotalPages(Math.max(1, response.pagination.pages || 1));
    } catch (err) {
      console.error("Failed to load communities:", err);
      setCommunities([]);
      setTotalPages(1);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [cityFilter, currentPage, mapCommunityCard, searchQuery, typeFilter]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  useEffect(() => {
    setOpenFaq(null);
  }, [i18n.language]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleSearch = () => {
    setCurrentPage(1);
    setSearchQuery(searchInput.trim());
  };

  const handleCityChange = (value: string) => {
    setCurrentPage(1);
    setCityFilter(value);
    setOpenDropdown(null);
  };

  const handleTypeChange = (value: string) => {
    setCurrentPage(1);
    setTypeFilter(value);
    setOpenDropdown(null);
  };

  const cityOptions = useMemo(
    () => [
      { value: "all", label: t("public.common.filters.allCities") },
      ...cities.map((city) => ({ value: city, label: city })),
    ],
    [cities, t],
  );

  const typeOptions = useMemo(
    () => [
      { value: "all", label: t("public.common.filters.allTypes") },
      ...COMMUNITY_TYPE_OPTIONS.map((type) => {
        const localeKey = COMMUNITY_TYPE_LOCALE_KEYS[type];
        return {
          value: type,
          label: t(`public.communities.types.${localeKey}`),
        };
      }),
    ],
    [t],
  );

  const renderDropdown = (
    id: "city" | "type",
    value: string,
    options: Array<{ value: string; label: string }>,
    onChange: (value: string) => void,
  ) => {
    const selectedLabel =
      options.find((option) => option.value === value)?.label ||
      options[0]?.label ||
      "";
    const isOpen = openDropdown === id;

    return (
      <div className="relative min-w-0">
        <button
          type="button"
          onClick={() =>
            setOpenDropdown((current) => (current === id ? null : id))
          }
          className="flex h-[54px] w-full min-w-0 items-center justify-between gap-3 overflow-hidden rounded-full bg-white px-5 text-left text-[16px] sm:text-[18px] lg:h-[66px] lg:px-8 lg:text-[22px]"
          aria-expanded={isOpen}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <ChevronDown
            size={22}
            className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[240px] overflow-y-auto rounded-2xl border border-black/10 bg-white py-2 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`block w-full px-5 py-3 text-left text-[15px] transition-colors hover:bg-[#EAF4FF] sm:text-[16px] ${
                  option.value === value
                    ? "bg-[#EAF4FF] font-semibold text-[#019839]"
                    : "text-black"
                }`}
              >
                <span className="block truncate">{option.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="communities-page min-h-screen overflow-x-hidden bg-[#eaf4ff] text-black">
      <FontLoader />

      <PublicPageHero
        titleWords={heroTitleWords}
        breadcrumb={heroBreadcrumb}
        backgroundImage="/img/pexels-jonathanborba-19431223 1.png"
        classPrefix="communities-page"
      />

      <section className="grid w-full grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,592px)] lg:gap-[42px] lg:px-16 lg:py-20 xl:px-20 2xl:px-24">
        <div className="max-w-[634px]">
          <AnimatedWords
            words={introTitleWords}
            gap={12}
            className="bebas max-w-[634px] text-[34px] capitalize leading-[39px] sm:text-[42px] sm:leading-[50px] md:text-[52px] md:leading-[50px] lg:text-[60px] lg:leading-[60px]"
          />

          <p className="mt-5 max-w-[610px] text-[16px] leading-[23px] sm:text-[18px] sm:leading-[24px] md:text-[22px] md:leading-[28px] lg:mt-[44px] lg:text-[24px] lg:leading-[30px]">
            {t("public.communities.intro.body")}
          </p>
        </div>

        <div className="h-[240px] w-full overflow-hidden rounded-[10px] sm:h-[320px] lg:h-[440px]">
          <img
            src="/img/Frame 2147226625.png"
            alt={t("public.communities.imageAlt")}
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <AnimatedWords
          words={exploreTitleWords}
          gap={14}
          className="justify-center text-center text-[34px] font-bebas uppercase sm:text-[42px] lg:text-[50px]"
        />

        <motion.div
          className="mt-8 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-[1fr_260px_260px_156px] lg:gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 120 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5 }}
            className="flex h-[54px] min-w-0 items-center rounded-full bg-white px-5 lg:h-[66px] lg:px-8"
          >
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSearch();
              }}
              placeholder={t("public.common.searchCommunities")}
              className="min-w-0 flex-1 bg-transparent text-[16px] outline-none sm:text-[18px] lg:text-[22px]"
            />
            <Search size={22} />
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 120 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            {renderDropdown("city", cityFilter, cityOptions, handleCityChange)}
          </motion.div>

          <motion.div
            variants={{
              hidden: { opacity: 0, x: 120 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            {renderDropdown("type", typeFilter, typeOptions, handleTypeChange)}
          </motion.div>

          <motion.button
            variants={{
              hidden: { opacity: 0, x: 120 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.5 }}
            type="button"
            onClick={handleSearch}
            className="h-[54px] rounded-full bg-[#019839] text-[17px] font-bold text-white lg:h-[66px] lg:text-[22px]"
          >
            {t("public.common.search")}
          </motion.button>
        </motion.div>

        {loadError && (
          <p className="mt-10 text-center text-[18px] text-red-600">
            {t("public.common.loadErrorCommunities")}
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 lg:mt-20 lg:grid-cols-2 lg:gap-8">
          {loading
            ? Array.from({ length: COMMUNITIES_PER_PAGE }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="relative h-[300px] animate-pulse overflow-hidden rounded-[10px] bg-black/10 sm:h-[380px] lg:h-[467px]"
                />
              ))
            : communities.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  key={item.id}
                >
                  <Link
                    to={`/user-communities/${encodeURIComponent(item.id)}`}
                    className="group relative block h-[300px] overflow-hidden rounded-[10px] bg-black text-left sm:h-[380px] lg:h-[467px]"
                  >
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    viewport={{ once: true }}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  <div className="absolute bottom-5 left-5 right-5 text-white sm:bottom-8 sm:left-7 lg:bottom-10 lg:left-8">
                    <h3 className="text-[23px] font-black uppercase leading-tight sm:text-[27px] lg:text-[30px]">
                      {item.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-2 sm:gap-4 lg:mt-5">
                      <span className="flex min-h-9 items-center gap-2 rounded-full bg-white/20 px-3 text-[13px] backdrop-blur-md sm:h-10 sm:px-5 sm:text-[16px]">
                        <Users size={18} /> {item.members}
                      </span>
                      <span className="flex min-h-9 items-center gap-2 rounded-full bg-white/20 px-3 text-[13px] backdrop-blur-md sm:h-10 sm:px-5 sm:text-[16px]">
                        <CalendarDays size={18} /> {item.events}
                      </span>
                    </div>
                  </div>
                  </Link>
                </motion.div>
              ))}
        </div>

        {!loading && !loadError && communities.length === 0 && (
          <p className="mt-10 text-center text-[20px] text-black/60">
            {t("public.common.noCommunities")}
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[16px] font-medium text-[#019839] sm:gap-4 sm:text-[18px] md:gap-8 lg:mt-20 lg:text-[20px]">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
              aria-label={t("public.common.prevPage")}
            >
              <ChevronLeft size={22} />
            </button>

            {pageNumbers.map((page, index) =>
              page === "ellipsis" ? (
                <span key={`ellipsis-${index}`} className="tracking-[0.25em]">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  disabled={loading}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 sm:h-12 sm:min-w-12 ${
                    currentPage === page
                      ? "bg-[#019839] text-white"
                      : "text-[#019839] hover:bg-[#019839]/10"
                  }`}
                >
                  {page}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages || loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
              aria-label={t("public.common.nextPage")}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </section>

      <section className="w-full px-4 pb-16 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <AnimatedWords
          words={t("public.tracks.faq.title").split(/\s+/).filter(Boolean)}
          gap={12}
          className="text-[34px] font-bebas justify-center uppercase sm:text-[42px] lg:text-[50px]"
        />
        <p className="mt-4 text-[16px] sm:text-[18px]">
          {t("public.tracks.faq.subtitle")}
        </p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-7"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              role="button"
              tabIndex={0}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  setOpenFaq(openFaq === index ? null : index);
              }}
              className="cursor-pointer overflow-hidden rounded-xl border border-[#ccc] px-6 text-left text-[20px] font-medium"
            >
              <div className="flex min-h-25 items-center justify-between gap-4 py-4">
                <span>{faq.q}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[18px] font-normal leading-none transition-transform ${openFaq === index ? "rotate-45" : ""}`}>
                  +
                </span>
              </div>
              {openFaq === index && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="pb-5 text-[16px] font-normal leading-7 text-black/65"
                >
                  {faq.a}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
