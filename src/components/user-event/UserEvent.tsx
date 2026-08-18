import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  EventApiResponse,
  GetEventsParams,
  getEventsPage,
} from "../../services/eventsApi";
import { motion } from "framer-motion";
import i18n from "../../i18n";
import {
  AnimatedWords,
  PublicPageHero,
  useWordList,
} from "../public/publicPageHelpers";
import { useNavigate } from "react-router-dom";
import { AnimatedButton } from "../ui/AnimatedButton";
import { useEventCategories } from "../../hooks/useLookups";

const FontLoader = () => (
  <style>{`
    * { box-sizing: border-box; }

.event-hero{

padding-inline-start: 86px !important;}
.event-section-title div
{justify-content: center !important;
}

.event-page .event-filter-bar{justify-content: center !important;
}



button{
font-family: 'Satoshi', sans-serif !important;
}
    
    body { background: #EAF4FF; color: #000; }
    .bebas { font-family: 'Bebas Kai', sans-serif; font-weight: 400; letter-spacing: 0.02em; }
    a { text-decoration: none; color: inherit; }
    select { appearance: none; -webkit-appearance: none; background: transparent; border: none; outline: none; cursor: pointer; font-family: 'Bebas Kai', sans-serif; font-size: 18px; color: #000; width: 100%; padding-right: 28px; }
    .event-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
    .event-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
      inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
    }

    @media (max-width: 768px) {
      .event-local-nav {
        height: 78px !important;
        padding: 0 18px !important;
      }
      .event-local-nav nav,
      .event-local-nav > div:last-child span {
        display: none !important;
      }
      .event-local-nav .bebas {
        font-size: 22px !important;
      }
      .event-local-nav button {
        padding: 10px 18px !important;
        font-size: 14px !important;
      }
      .event-hero {
        height: 360px !important;
      }
      html[dir='rtl'] .event-hero {
        padding-inline: 18px !important;
      }
      .event-hero-bg {
        background-position: center center !important;
      }
      .event-hero-content {
        left: 18px !important;
        right: 18px !important;
        bottom: 42px !important;
      }
      .event-hero-title {
        font-size: 46px !important;
      }
      .event-hero-breadcrumb {
        font-size: 17px !important;
      }
      .event-section-header {
        padding: 48px 18px 28px !important;
      }
      .event-section-title {
        font-size: 38px !important;
        line-height: 1.08 !important;
      }
      .event-section-copy {
        font-size: 15px !important;
      }
      .event-filter-bar {
        padding: 0 18px 24px !important;
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 18px !important;
      }
      .event-filter-field {
        width: 100% !important;
        height: 54px !important;
        padding: 0 0px 0 0px !important;
      }
      .event-filter-field select {
        font-size: 15px !important;
        padding-right: 18px !important;
      }
      .event-filter-search {
        width: 100% !important;
        height: 54px !important;
        font-size: 17px !important;
      }
      .event-grid-wrap {
        padding: 0 18px !important;
      }
      .event-cards-grid {
        grid-template-columns: 1fr !important;
        gap: 34px !important;
      }
      .event-card-image {
        height: 220px !important;
      }
      .event-card-meta {
        grid-template-columns: 1fr 1fr!important;
      }
      .event-card-title {
        font-size: 22px !important;
      }
      .event-card-button {
        width: auto !important;
        font-size:16px !important;
      }
      .event-pagination {
        gap: 8px !important;
        padding: 36px 0 48px !important;
        flex-wrap: wrap !important;
      }
      .event-pagination button {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
        font-size: 16px !important;
      }
      .event-cta {
        height: auto !important;
        min-height: 380px !important;
      }
      .event-cta-title {
        font-size: 48px !important;
      }
      .event-cta-text {
        font-size: 18px !important;
        line-height: 1.45 !important;
      }
      .event-cta-buttons {
        flex-direction: column !important;
        width: min(100%, 260px) !important;
      }
      .event-cta-buttons button {
        justify-content: center !important;
        width: 100% !important;
      }
      .event-footer {
        padding: 48px 18px 28px !important;
      }
      .event-footer-main,
      .event-footer-bottom {
        flex-direction: column !important;
        gap: 26px !important;
        align-items: stretch !important;
      }
      .event-footer-brand {
        flex: 1 1 auto !important;
        width: 100% !important;
      }
      .event-newsletter {
        width: 100% !important;
        max-width: 340px !important;
      }
      .event-footer-top-button {
        position: static !important;
        margin: 18px auto 0 !important;
      }
        .event-page div.event-grid-wrap{
            padding-bottom: 0px !important;
    padding-top: 0px !important;        padding-block: 0px !important;}
    }

    @media (max-width: 420px) {
      .event-hero {
        height: 320px !important;
      }
      .event-section-title,
      .event-cta-title {
        font-size: 36px !important;
      }
      .event-filter-bar {
        grid-template-columns: 1fr !important;
        gap: 14px !important;
      }
      .event-card-image {
        height: 200px !important;
      }
      .event-newsletter {
        height: auto !important;
        flex-direction: column !important;
      }
      .event-newsletter input {
        min-height: 48px !important;
      }
      .event-newsletter button {
        min-height: 46px !important;
      }
    }
  `}</style>
);

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { t } = useTranslation();
  const titleWords = t("public.events.hero.titleWords", {
    returnObjects: true,
  }) as string[];
  const breadcrumb = t("public.events.hero.breadcrumb", {
    returnObjects: true,
  }) as string[];

  return (
    <PublicPageHero
      titleWords={titleWords}
      breadcrumb={breadcrumb}
      backgroundImage="/img/pexels-jonathanborba-19431221 1.png"
      classPrefix="event"
    />
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader() {
  const { t } = useTranslation();
  const titleWords = useWordList("public.events.intro.titleWords");

  return (
    <section
      className="event-section-header"
      style={{
        background: "#EAF4FF",
        padding: "64px 82px 40px",
        textAlign: "center",
      }}
    >
      <h2
        className="bebas event-section-title overflow-hidden"
        style={{
          fontSize: 50,
          lineHeight: 1.2,
          textTransform: "capitalize",
          maxWidth: 560,
          margin: "0 auto 16px",
        }}
      >
        <AnimatedWords words={titleWords} gap={12} />
      </h2>
      <motion.p
        className="event-section-copy"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true }}
        style={{
          fontSize: 16,
          fontWeight: 500,
          color: "rgba(0,0,0,0.6)",
          maxWidth: 444,
          margin: "0 auto",
          lineHeight: 1.6,
        }}
      >
        {t("public.events.intro.body")}
      </motion.p>
    </section>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
interface EventFilters {
  city: string;
  category: string;
  level: string;
  status: string;
}

const ALL_FILTER_VALUE = "__all__";

const DEFAULT_FILTERS: EventFilters = {
  city: ALL_FILTER_VALUE,
  category: ALL_FILTER_VALUE,
  level: ALL_FILTER_VALUE,
  status: ALL_FILTER_VALUE,
};

type FilterOption = { value: string; label: string };

function FilterBar({
  filters,
  onFilterChange,
  loading,
}: {
  filters: EventFilters;
  onFilterChange: (key: keyof EventFilters, value: string) => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const { options: categoryOptions } = useEventCategories();
  const [openDropdown, setOpenDropdown] = useState<keyof EventFilters | null>(
    null,
  );

  const dropdowns = useMemo<
    Array<{ key: keyof EventFilters; options: FilterOption[] }>
  >(
    () => [
      {
        key: "city",
        options: [
          {
            value: ALL_FILTER_VALUE,
            label: t("public.common.filters.allCities"),
          },
          {
            value: "Abu Dhabi",
            label: t("public.events.listing.filters.cities.abuDhabi"),
          },
          {
            value: "Dubai",
            label: t("public.events.listing.filters.cities.dubai"),
          },
          {
            value: "Sharjah",
            label: t("public.events.listing.filters.cities.sharjah"),
          },
          {
            value: "Al Ain",
            label: t("public.events.listing.filters.cities.alAin"),
          },
        ],
      },
      {
        key: "category",
        options: [
          {
            value: ALL_FILTER_VALUE,
            label: t("public.common.filters.allCategories"),
          },
          ...categoryOptions,
        ],
      },
      {
        key: "level",
        options: [
          {
            value: ALL_FILTER_VALUE,
            label: t("public.common.filters.allLevels"),
          },
          {
            value: "beginner",
            label: t("public.events.listing.filters.levels.beginner"),
          },
          {
            value: "intermediate",
            label: t("public.events.listing.filters.levels.intermediate"),
          },
          {
            value: "advanced",
            label: t("public.events.listing.filters.levels.advanced"),
          },
          {
            value: "all",
            label: t("public.events.listing.filters.levels.all"),
          },
        ],
      },
      {
        key: "status",
        options: [
          { value: ALL_FILTER_VALUE, label: t("public.common.filters.status") },
          {
            value: "Upcoming",
            label: t("public.events.listing.filters.status.upcoming"),
          },
          {
            value: "Ongoing",
            label: t("public.events.listing.filters.status.ongoing"),
          },
          {
            value: "Completed",
            label: t("public.events.listing.filters.status.completed"),
          },
        ],
      },
    ],
    [t, categoryOptions],
  );

  const ChevronDown = ({ open = false }: { open?: boolean }) => (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      style={{
        flexShrink: 0,
        transform: open ? "rotate(180deg)" : "none",
        transition: "transform 0.2s",
      }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const renderDropdown = (filter: {
    key: keyof EventFilters;
    options: FilterOption[];
  }) => {
    const isOpen = openDropdown === filter.key;
    const selected =
      filter.options.find((option) => option.value === filters[filter.key])
        ?.label ||
      filter.options[0]?.label ||
      "";

    return (
      // <div key={filter.key} className="event-filter-field" style={{ position: "relative", width: 260 }}>
      <motion.div
        key={filter.key}
        className="event-filter-field"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {
            opacity: 0,
            y: "120%",
          },
          visible: {
            opacity: 1,
            y: "0%",
          },
        }}
        transition={{
          duration: 0.7,
          delay: dropdowns.findIndex((d) => d.key === filter.key) * 0.08,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ position: "relative", width: 260 }}
      >
        <button
          type="button"
          onClick={() =>
            setOpenDropdown((current) =>
              current === filter.key ? null : filter.key,
            )
          }
          style={{
            width: "100%",
            height: 66,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px 0 28px",
            gap: 10,
            cursor: "pointer",
            fontFamily: "'Bebas Kai', sans-serif",
            fontSize: 18,
            color: "#000",
            textAlign: "left",
          }}
          aria-expanded={isOpen}
        >
          <span
            style={{
              minWidth: 0,
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selected}
          </span>

          <ChevronDown open={isOpen} />
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "calc(100% + 8px)",
              zIndex: 30,
              maxHeight: 240,
              overflowY: "auto",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.1)",
              background: "#fff",
              padding: "8px 0",
              boxShadow: "0 16px 40px rgba(0,0,0,0.16)",
            }}
          >
            {filter.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onFilterChange(filter.key, option.value);
                  setOpenDropdown(null);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  border: 0,
                  background:
                    option.value === filters[filter.key] ? "#EAF4FF" : "#fff",
                  color:
                    option.value === filters[filter.key] ? "#019839" : "#000",
                  padding: "12px 18px",
                  textAlign: "left",
                  fontFamily: "'Bebas Kai', sans-serif",
                  fontSize: 16,
                  fontWeight: option.value === filters[filter.key] ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.label}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    // <div style={{ padding: "0 82px 24px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
    <div
      className="event-filter-bar"
      style={{
        padding: "40px 82px 32px",
        display: "flex",
        gap: 18,
        alignItems: "center",
        gridTemplateColumns: "repeat(3, 403px)",
      }}
    >
      {dropdowns.map(renderDropdown)}
      <motion.button
        className="event-filter-search"
        initial={{ opacity: 0, x: 120 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.5,
          delay: dropdowns.length * 0.12,
          ease: "easeOut",
        }}
        viewport={{ once: true }}
        disabled={loading}
        style={{
          width: 156,
          height: 66,
          background: "#019839",
          color: "#fff",
          border: "none",
          borderRadius: 40,
          fontSize: 20,
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'Bebas Kai',sans-serif",
          opacity: loading ? 0.7 : 1,
          transition: "opacity .2s",
        }}
      >
        {loading ? t("public.common.loading") : t("public.common.search")}
      </motion.button>
    </div>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────
function EventCard({
  event,
  index,
}: {
  event: EventApiResponse;
  index: number;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumns(1);
      else if (window.innerWidth < 1200) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const getInitialAnimation = () => {
    const width = window.innerWidth;
    const cols = width < 768 ? 1 : width < 1200 ? 2 : 3;
    const position = index % cols;

    if (cols === 3) {
      if (position === 0) return { opacity: 0, x: -180 };
      if (position === 1) return { opacity: 0, y: 140 };
      return { opacity: 0, x: 180 };
    }

    if (cols === 2) {
      return position === 0 ? { opacity: 0, x: -180 } : { opacity: 0, x: 180 };
    }

    return index % 2 === 0 ? { opacity: 0, x: -180 } : { opacity: 0, x: 180 };
  };

  const tag = event.category || t("public.common.eventFallback");
  // `mainImage` is the field Event Edit actually keeps current; `eventImage` can go
  // stale (only set at creation), so prefer mainImage first.
  const image =
    event.mainImage ||
    event.eventImage ||
    event.galleryImages?.[0] ||
    "https://images.unsplash.com/photo-1471897488648-5eae4ac6d485?w=600&q=80";

  const participants = event.currentParticipants ?? event.registrations ?? 0;

  return (
    <motion.div
      className="event-card"
      initial={getInitialAnimation()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.7,
        delay: (index % 3) * 0.12,
        ease: "easeOut",
      }}
      viewport={{ once: true }}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <div
        className="event-card-image adcc-image"
        style={{
          width: "100%",
          height: 260,
          borderRadius: 14,
          overflow: "hidden",
          position: "relative",
          background: "#ddd",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 64 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.15 + (index % 3) * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          viewport={{ once: true }}
          style={{ width: "100%", height: "100%", transformOrigin: "center" }}
        >
          <img
            className="adcc-image__img"
            src={image}
            alt={event.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </motion.div>
        <span
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(15px)",
            borderRadius: 30,
            padding: "9px 18px",
            color: "#fff",
            fontFamily: "'Bebas Kai',sans-serif",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {tag}
        </span>
      </div>

      <div style={{ paddingTop: 20 }}>
        <h3
          className="bebas event-card-title"
          style={{ fontSize: 24, marginBottom: 14, letterSpacing: 0.5 }}
        >
          {event.title}
        </h3>

        <div
          className="event-card-meta"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 12px",
            marginBottom: 20,
          }}
        >
          <Meta
            icon={
              <img
                src="/img/icons/calendar.svg"
                alt={t("public.events.listing.card.calendarAlt")}
                width={14}
                height={14}
              />
            }
            text={formatEventDate(event.eventDate, t("public.common.dateTBA"))}
          />
          <Meta
            icon={
              <img
                src="/img/icons/kms.svg"
                alt={t("public.events.listing.card.distanceAlt")}
                width={14}
                height={14}
              />
            }
            text={
              typeof event.distance === "number"
                ? `${event.distance} km`
                : t("public.common.distanceTBA")
            }
          />
          <Meta
            icon={
              <img
                src="/img/icons/people.svg"
                alt={t("public.events.listing.card.participantsAlt")}
                width={14}
                height={14}
              />
            }
            text={t("public.common.participants", {
              count: participants,
              formattedCount: participants,
            })}
          />
          <Meta
            icon={
              <img
                src="/img/icons/map.svg"
                alt={t("public.events.listing.card.locationAlt")}
                width={14}
                height={14}
              />
            }
            text={event.city || event.address || "—"}
          />
        </div>

        <AnimatedButton
          variant="outline"
          size="sm"
          className="event-card-button"
          onClick={() => {
            const eventId = event._id || event.id;
            if (eventId) {
              navigate(`/user-event/${encodeURIComponent(eventId)}`);
            }
          }}
        >
          {t("public.common.viewDetails")}
        </AnimatedButton>
      </div>
    </motion.div>
  );
}

function Meta({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: 13,
          display: "flex",
          filter:
            "brightness(0) saturate(100%) invert(42%) sepia(99%) saturate(458%) hue-rotate(100deg) brightness(91%) contrast(102%)",
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 13, fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>
        {text}
      </span>
    </div>
  );
}

// ── Events grid ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

function EventsGrid() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryParams = useMemo<GetEventsParams>(() => {
    const params: GetEventsParams = { page, limit: PAGE_SIZE };
    if (filters.city !== ALL_FILTER_VALUE) params.city = filters.city;
    if (filters.category !== ALL_FILTER_VALUE)
      params.category = filters.category;
    if (filters.level !== ALL_FILTER_VALUE) params.level = filters.level;
    if (filters.status !== ALL_FILTER_VALUE) params.status = filters.status;
    return params;
  }, [filters, page]);

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    getEventsPage(queryParams)
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events || []);
        setTotalResults(data.pagination.total || 0);
        setTotalPages(Math.max(1, data.pagination.pages || 1));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load events:", err);
        setEvents([]);
        setTotalResults(0);
        setTotalPages(1);
        setError(t("public.common.loadErrorEvents"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  return (
    <>
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        loading={loading}
      />
      <div className="event-grid-wrap" style={{ padding: "0 82px 80px" }}>
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>
          {loading
            ? t("public.common.loadingEvents")
            : t("public.common.showingResults", {
                shown: events.length,
                total: totalResults,
              })}
        </p>
        {error && (
          <p style={{ fontSize: 16, color: "#C12D32", marginBottom: 20 }}>
            {error}
          </p>
        )}
        {/* <div style={{ display: "flex", flexWrap: "wrap", gap: "48px 28px" }}> */}
        <div
          className="event-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "48px 28px",
          }}
        >
          {events.map((e, index) => (
            <EventCard
              key={e._id || e.id || e.slug || e.title}
              event={e}
              index={index}
            />
          ))}
        </div>
        <Pagination page={page} total={totalPages} setPage={setPage} />
      </div>
    </>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({
  page,
  total,
  setPage,
}: {
  page: number;
  total: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  if (total <= 1) return null;
  const pages = buildPagination(page, total);
  return (
    <div
      className="event-pagination"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: "48px 0 64px",
      }}
    >
      {pages.map((p, i) => {
        const isActive = p === page;
        const isDots = typeof p === "string";
        return (
          <button
            key={i}
            onClick={() => !isDots && setPage(p)}
            style={{
              width: isDots ? "auto" : 47,
              height: isDots ? "auto" : 47,
              minWidth: isDots ? 0 : 47,
              borderRadius: "50%",
              border: "none",
              background: isActive ? "#019839" : "transparent",
              color: isActive ? "#fff" : "#019839",
              fontSize: 18,
              fontWeight: 500,
              cursor: isDots ? "default" : "pointer",
              fontFamily: "'Bebas Kai',sans-serif",
              letterSpacing: isDots ? "0.2em" : 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {p}
          </button>
        );
      })}
      {/* next arrow */}
      <button
        onClick={() => setPage((p) => Math.min(p + 1, total))}
        style={{
          width: 47,
          height: 47,
          borderRadius: "50%",
          border: "none",
          background: "#019839",
          color: "#fff",
          cursor: "pointer",
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        ›
      </button>
    </div>
  );
}

function buildPagination(page: number, total: number): Array<number | string> {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set(
    [1, total, page, page - 1, page + 1].filter((p) => p >= 1 && p <= total),
  );
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | string> = [];

  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) result.push("...");
    result.push(p);
  });

  return result;
}

function formatEventDate(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(i18n.language, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section
      className="event-cta"
      style={{ position: "relative", overflow: "hidden", height: 502 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), url('https://images.unsplash.com/photo-1570489460099-2a6e43e4c3f0?w=1440&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          textAlign: "center",
          padding: "0 24px",
        }}
      >
        <h2
          className="bebas event-cta-title"
          style={{
            fontSize: 94,
            color: "#fff",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          Start Your Ride Today
        </h2>
        <p
          className="event-cta-text"
          style={{
            fontSize: 24,
            color: "#fff",
            marginTop: 12,
            marginBottom: 36,
          }}
        >
          Download the ADCC app and join the cycling community.
        </p>
        <div className="event-cta-buttons" style={{ display: "flex", gap: 20 }}>
          {["Google Play", "App Store"].map((s) => (
            <button
              key={s}
              style={{
                background: "#fff",
                border: "none",
                borderRadius: 100,
                padding: "14px 32px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                fontFamily: "'Bebas Kai',sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="event-footer"
      style={{ background: "#EAF4FF", padding: "60px 82px 32px" }}
    >
      <div
        className="event-footer-main"
        style={{ display: "flex", gap: 64, marginBottom: 48 }}
      >
        <div className="event-footer-brand" style={{ flex: "0 0 340px" }}>
          <div style={{ marginBottom: 16 }}>
            <span className="bebas" style={{ fontSize: 24, letterSpacing: 2 }}>
              ABU◉DHABI
              <br />
              CYCLING CLUB
            </span>
          </div>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#000",
              maxWidth: 340,
              marginBottom: 24,
            }}
          >
            From weekend warriors to elite athletes, we unite cyclists who share
            a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          <div
            className="event-newsletter"
            style={{
              display: "flex",
              background: "#8DDF93",
              borderRadius: 8,
              overflow: "hidden",
              width: 340,
              height: 56,
            }}
          >
            <input
              placeholder="Enter your email"
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                padding: "0 18px",
                fontSize: 15,
                fontFamily: "'Bebas Kai',sans-serif",
                outline: "none",
              }}
            />
            <button
              style={{
                background: "#019839",
                color: "#fff",
                border: "none",
                padding: "0 22px",
                fontSize: 15,
                cursor: "pointer",
                fontFamily: "'Bebas Kai',sans-serif",
              }}
            >
              Submit
            </button>
          </div>
        </div>
        <div>
          <div
            className="bebas"
            style={{
              fontSize: 22,
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            Quick Links
          </div>
          {[
            "About Us",
            "Rides",
            "Events",
            "Cyclist's Corner",
            "Contact Us",
          ].map((l) => (
            <p key={l} style={{ fontSize: 16, marginBottom: 10 }}>
              <a href="#" style={{ color: "#000" }}>
                {l}
              </a>
            </p>
          ))}
        </div>
        <div>
          <div
            className="bebas"
            style={{
              fontSize: 22,
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            Contact Us
          </div>
          {[
            { icon: "📞", text: "+971 2 654 5645" },
            { icon: "💬", text: "144226" },
            { icon: "✉️", text: "info@adcyclingclub.ae" },
            {
              icon: "📍",
              text: "Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18.",
            },
          ].map((c, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 12,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 17 }}>{c.icon}</span>
              <span style={{ fontSize: 16, lineHeight: 1.4 }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div
        className="event-footer-bottom"
        style={{
          borderTop: "1px solid #D5D5D5",
          paddingTop: 22,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
        }}
      >
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.7)" }}>
          Copyright 2026. Abu Dhabi Cycling Club
        </p>
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.7)" }}>
          Copyright 2026. Abu Dhabi Cycling Club
        </p>
        <button
          className="event-footer-top-button"
          style={{
            position: "absolute",
            right: 0,
            top: -28,
            width: 55,
            height: 55,
            borderRadius: "50%",
            background: "#019839",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 22,
          }}
        >
          ↑
        </button>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function Events() {
  return (
    <>
      <FontLoader />
      <div
        className="event-page"
        style={{
          minWidth: 320,
          overflowX: "clip",
          overflowY: "visible",
          paddingBottom: 80,
        }}
      >
        <Hero />
        <SectionHeader />
        <EventsGrid />
      </div>
    </>
  );
}
