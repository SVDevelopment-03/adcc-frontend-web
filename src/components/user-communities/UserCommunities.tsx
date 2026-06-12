import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cloud,
  Search,
  ChevronDown,
  Users,
  CalendarDays,
  Plus,
  Phone,
  Mail,
  MapPin,
  Bike,
  Apple,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import {
  CommunityApiResponse,
  getAvailableCities,
  getCommunities,
} from "../../services/communitiesApi";
import { motion } from "framer-motion";
import gsap from "gsap";
const navLinks = ["About Us", "Events", "Community", "Tracks"];

const FontLoader = () => (
  <style>{`
    body { background: #EAF4FF; font-family: 'Bebas Kai', sans-serif; color: #000; }
    .bebas { font-family: 'Bebas Kai', sans-serif; font-weight: 400; letter-spacing: 0; }
    .communities-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
    .communities-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
      inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
    }
  `}</style>
);

const COMMUNITIES_PER_PAGE = 4;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
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

function resolveCommunityImage(image?: string) {
  const trimmed = image?.trim() ?? "";
  if (!trimmed) return FALLBACK_COMMUNITY_IMAGE;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return new URL(trimmed.replace(/^\/+/, ""), `${API_BASE_URL}/`).toString();
}

function formatCount(value: number | string | undefined, label: string) {
  const count = Number(value ?? 0);
  const formatted = Number.isFinite(count) ? count.toLocaleString() : "0";
  return `${formatted} ${label}`;
}

function mapCommunityCard(community: CommunityApiResponse) {
  return {
    id: community._id || community.id || community.title,
    title: community.title || community.name || "Community",
    members: formatCount(community.memberCount, "members"),
    events: formatCount(
      community.upcomingEventCount ?? community.eventsCount,
      "events"
    ),
    image: resolveCommunityImage(community.image),
  };
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

const faqs = [
  {
    q: "Do I need to be an experienced cyclist to join ADCC rides?",
    a: "Not at all! ADCC welcomes riders of all experience levels. We have beginner-friendly rides as well as advanced training sessions to suit everyone.",
  },
  {
    q: "Are there specific tracks for beginners or families?",
    a: "Yes! We have several easy, flat tracks such as Corniche Seafront and Saadiyat Island Loop that are perfect for beginners and family outings.",
  },
  {
    q: "What gear do I need to bring for a group ride?",
    a: "A road-worthy bike, a helmet, water, and appropriate cycling attire. We recommend lights for early morning or evening rides.",
  },
  {
    q: "Can I participate in races without being a professional?",
    a: "Absolutely. Many of our races have categories for recreational riders. Check individual event details for age and skill category breakdowns.",
  },
  {
    q: "How do I track my performance or join challenges?",
    a: "Download the ADCC app to log your rides, join challenges, and track your progress alongside thousands of community members.",
  },
  {
    q: "Are there any women-only rides or training sessions?",
    a: "Yes! ADCC organises regular women-only rides and training sessions. Check our events calendar for upcoming sessions.",
  },
];

export default function CommunitiesPage() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState<"city" | "type" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [communities, setCommunities] = useState<ReturnType<typeof mapCommunityCard>[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);

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
      setCommunities([]);
      setTotalPages(1);
      setError(err instanceof Error ? err.message : "Failed to load communities");
    } finally {
      setLoading(false);
    }
  }, [cityFilter, currentPage, searchQuery, typeFilter]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
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
      { value: "all", label: "All Cities" },
      ...cities.map((city) => ({ value: city, label: city })),
    ],
    [cities]
  );

  const typeOptions = useMemo(
    () => [
      { value: "all", label: "All Types" },
      ...COMMUNITY_TYPE_OPTIONS.map((type) => ({ value: type, label: type })),
    ],
    []
  );

  const renderDropdown = (
    id: "city" | "type",
    value: string,
    options: Array<{ value: string; label: string }>,
    onChange: (value: string) => void
  ) => {
    const selectedLabel = options.find((option) => option.value === value)?.label || options[0]?.label || "";
    const isOpen = openDropdown === id;

    return (
      <div className="relative min-w-0">
        <button
          type="button"
          onClick={() => setOpenDropdown((current) => (current === id ? null : id))}
          className="flex h-[54px] w-full min-w-0 items-center justify-between gap-3 overflow-hidden rounded-full bg-white px-5 text-left text-[16px] sm:text-[18px] lg:h-[66px] lg:px-8 lg:text-[22px]"
          aria-expanded={isOpen}
        >
          <span className="min-w-0 flex-1 truncate">{selectedLabel}</span>
          <ChevronDown size={22} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-[240px] overflow-y-auto rounded-2xl border border-black/10 bg-white py-2 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`block w-full px-5 py-3 text-left text-[15px] transition-colors hover:bg-[#EAF4FF] sm:text-[16px] ${
                  option.value === value ? "bg-[#EAF4FF] font-semibold text-[#019839]" : "text-black"
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
    // <div className="min-h-screen bg-[#eaf4ff] text-black">
    <div className="communities-page min-h-screen overflow-x-hidden bg-[#eaf4ff] text-black">
      <FontLoader />

      <header className="flex h-[78px] items-center justify-between bg-[#eaf4ff] px-4 sm:h-[96px] sm:px-6 md:px-10 lg:h-[134px] lg:px-20">
        <img
          src="/ADCC-Logo.png"
          alt="ADCC Logo"
          className="h-auto w-[112px] object-contain sm:w-[125px] lg:w-[135px]"
        />

        <nav className="hidden lg:flex items-center gap-12 text-[20px] font-medium">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className={link === "Community" ? "text-[#092A25]" : "text-black"}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
          <Cloud size={22} />
          <span className="hidden sm:block text-[15px] font-medium lg:text-[17px]">English</span>
          <button className="rounded-full bg-black px-5 py-3 text-[14px] font-bold text-white sm:px-6 lg:px-8 lg:py-4 lg:text-[18px]">
            Menu
          </button>
        </div>
      </header>

      <section
        className="relative h-[360px] w-full bg-cover bg-center bg-no-repeat sm:h-[480px] md:h-[620px] lg:h-[940px]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url('/img/pexels-jonathanborba-19431223 1.png')",
        }}
      >
        <div className="absolute bottom-10 left-4 right-4 text-white sm:bottom-14 sm:left-6 md:bottom-20 md:left-10 lg:left-20">
          <h1 className="text-[42px] font-black uppercase leading-none sm:text-[50px] lg:text-[60px]">
            {["Communities"].map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.12,
                }}
                style={{
                  display: "inline-block",
                  marginRight: "14px",
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <p className="mt-3 text-[17px] sm:text-[20px] lg:mt-4 lg:text-[24px]">
            {["Home", "/", "Communities"].map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.25 + index * 0.1,
                }}
                style={{
                  display: "inline-block",
                  marginRight: "8px",
                }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        </div>
      </section>

      {/* <section className="mx-auto grid max-w-[1268px] grid-cols-1 gap-10 px-10 py-20 lg:relative lg:block lg:h-[565px] lg:py-0"> */}
      {/* <section className="mx-auto grid max-w-[1268px] grid-cols-1 items-center gap-[42px] px-10 py-20 lg:grid-cols-[634px_592px]"> */}
      <section className="grid w-full grid-cols-1 items-center gap-8 px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,592px)] lg:gap-[42px] lg:px-16 lg:py-20 xl:px-20 2xl:px-24">
        {/* <div className="max-w-[634px] lg:absolute lg:left-0 lg:top-[206px] lg:w-[634px]"> */}
        <div className="max-w-[634px]">
          <h2 className="bebas max-w-[634px] text-[34px] leading-[39px] capitalize sm:text-[42px] sm:leading-[50px] md:text-[52px] md:leading-[62px] lg:text-[60px] lg:leading-[72px]">
            {["Connect", "with", "Cycling", "Communities", "Across", "Abu", "Dhabi"].map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                }}
                viewport={{ once: true }}
                style={{
                  display: "inline-block",
                  marginRight: "12px",
                }}
              >
                {word}
              </motion.span>
            ))}
          </h2>

          <p className="mt-5 max-w-[610px] text-[16px] leading-[23px] sm:text-[18px] sm:leading-[24px] md:text-[22px] md:leading-[28px] lg:mt-[44px] lg:text-[24px] lg:leading-[30px]">
            {[
              "Abu", "Dhabi", "Cycling", "Club", "unites", "riders", "through",
              "communities", "focused", "on", "cycling.", "Whether", "for",
              "fitness,", "competition,", "or", "fun,", "find", "a", "group",
              "that", "suits", "you."
            ].map((word, index) => (
              <motion.span
                key={`${word}-${index}`}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: 0.25 + index * 0.025,
                }}
                viewport={{ once: true }}
                style={{
                  display: "inline-block",
                  marginRight: "8px",
                }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        </div>

        {/* <div className="h-auto w-full max-w-[592px] overflow-hidden rounded-[10px] lg:absolute lg:right-0 lg:top-[125px] lg:h-[440px] lg:w-[592px]"> */}
        {/* <div className="h-[440px] w-full max-w-[592px] overflow-hidden rounded-[10px]"> */}
        <div className="h-[240px] w-full overflow-hidden rounded-[10px] sm:h-[320px] lg:h-[440px]">
          <img
            src="/img/Frame 2147226625.png"
            alt="Cycling community"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <h2 className="text-center text-[34px] font-black uppercase sm:text-[42px] lg:text-[50px]">
          {["Explore", "Communities"].map((word, index) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: -100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: index * 0.12,
              }}
              viewport={{ once: true }}
              style={{
                display: "inline-block",
                marginRight: "14px",
              }}
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* <div className="mt-8 grid grid-cols-1 gap-4 lg:mt-10 lg:grid-cols-[1fr_260px_260px_156px] lg:gap-5"> */}
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
          {/* <div className="flex h-[54px] min-w-0 items-center rounded-full bg-white px-5 lg:h-[66px] lg:px-8"> */}
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
              placeholder="Search Communities"
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
            Search
          </motion.button>
        </motion.div>

        {error && (
          <p className="mt-10 text-center text-[18px] text-red-600">{error}</p>
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
                <motion.button
                  initial={{ opacity: 0, y: 120 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.12,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true }}
                  type="button"
                  key={item.id}
                  onClick={() => navigate(`/user-communities/${encodeURIComponent(item.id)}`)}
                  className="group relative h-[300px] overflow-hidden rounded-[10px] bg-black text-left sm:h-[380px] lg:h-[467px]"
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
                </motion.button>
              ))}
        </div>

        {!loading && !error && communities.length === 0 && (
          <p className="mt-10 text-center text-[20px] text-black/60">
            No communities found. Try adjusting your search or filters.
          </p>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-2 text-[16px] font-medium text-[#019839] sm:gap-4 sm:text-[18px] md:gap-8 lg:mt-20 lg:text-[20px]">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
              aria-label="Previous page"
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
                  className={`flex h-10 min-w-10 items-center justify-center rounded-full px-3 sm:h-12 sm:min-w-12 ${
                    currentPage === page
                      ? "bg-[#019839] text-white"
                      : "text-[#019839] hover:bg-[#019839]/10"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages || loading}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#019839] text-white disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:w-12"
              aria-label="Next page"
            >
              <ChevronRight size={22} />
            </button>
          </div>
        )}
      </section>

      <section className="w-full px-4 pb-16 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <h2 className="text-[34px] font-black uppercase sm:text-[42px] lg:text-[50px]">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-[16px] sm:text-[18px]">
          Got questions before hitting the road? We’ve got you covered.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-7">
          {faqs.map((faq, index) => (
            <div
              key={faq.q}
              role="button"
              tabIndex={0}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") setOpenFaq(openFaq === index ? null : index);
              }}
              className="cursor-pointer rounded-xl border border-[#ccc] px-4 text-left text-[16px] font-medium sm:px-6 sm:text-[19px] lg:px-7 lg:text-[22px]"
            >
              <div className="flex min-h-[82px] items-center justify-between gap-4 py-4 sm:min-h-[92px] lg:min-h-[100px]">
                <span>
                  {String(index + 1).padStart(2, "0")}. {faq.q}
                </span>
                <Plus className={`shrink-0 transition-transform ${openFaq === index ? "rotate-45" : ""}`} size={24} />
              </div>
              {openFaq === index && (
                <p className="pb-5 text-[15px] font-normal leading-7 text-black/65 sm:text-[16px] lg:text-[17px]">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer className="w-full px-4 py-14 sm:px-6 md:px-10 lg:px-16 lg:py-24 xl:px-20 2xl:px-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img
              src="/ADCC-Logo.png"
              alt="ADCC Logo"
              className="h-[63px] w-[149px] object-contain"
            />
            <p className="mt-8 max-w-[402px] text-[18px] leading-[23px]">
              From weekend warriors to elite athletes, we unite cyclists who
              share a passion for riding. ADCC is where your cycling journey
              thrives...
            </p>

            <div className="mt-8 flex h-auto max-w-[367px] flex-col rounded-lg bg-[#8DDF93] p-[6px] sm:h-[57px] sm:flex-row">
              <input
                placeholder="Enter your email"
                className="min-h-11 flex-1 bg-transparent px-4 text-[16px] outline-none"
              />
              <button className="min-h-11 rounded-lg bg-[#019839] px-7 text-white">
                Submit
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Quick Links</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>About Us</li>
              <li>Rides</li>
              <li>Events</li>
              <li>Cyclist’s Corner</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Contact Us</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3">
                <Phone size={22} /> +971 2 654 5645
              </li>
              <li className="flex gap-3">
                <Phone size={22} /> 144226
              </li>
              <li className="flex gap-3">
                <Mail size={22} /> Abu Dhabi, Yas island, yas marina circuit,
                Villa 18.
              </li>
              <li className="flex gap-3">
                <MapPin size={22} /> info@adcyclingclub.ae
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#d5d5d5] pt-8 text-center text-[18px] text-black/70">
          Copyright 2026. Abu Dhabi Cycling Club
        </div>

        <button className="fixed bottom-5 right-5 rounded-full bg-[#019839] p-3 text-white shadow-lg sm:bottom-10 sm:right-10 sm:p-4">
          <Bike size={28} />
        </button>
      </footer>
    </div>
  );
}
