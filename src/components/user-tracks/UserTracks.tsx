import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { getTracksPageEn, UAE_CITIES, type Track } from "../../services/trackService";
import { motion } from "framer-motion";
import { APP_STORE_LINKS } from "../../config/appStoreLinks";
import { AnimatedWords, PublicPageHero, useWordList } from "../public/publicPageHelpers";

type PublicTrackCard = {
  id: string;
  name: string;
  city: string;
  difficulty: string;
  location: string;
  distance: string;
  elevation: string;
  level: string;
  featured: boolean;
  img: string;
};

type TrackFilters = {
  city: string;
  level: string;
};

type FilterOption = {
  value: string;
  label: string;
};

const TRACK_FALLBACK_IMAGE = "/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png";
const PAGE_SIZE = 6;
const ALL_FILTER_VALUE = "all";

const titleCase = (value?: string | null) =>
  (value || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getTrackId = (track: Track) => String(track.id || (track as any)._id || track.slug || track.title);

const getTrackImage = (track: Track) =>
  track.image || track.coverImage || track.galleryImages?.[0] || TRACK_FALLBACK_IMAGE;

const formatDistance = (distance: number | string | undefined, naLabel: string) => {
  if (distance === undefined || distance === null || distance === "") return naLabel;
  const numeric = Number(distance);
  return Number.isFinite(numeric) ? `${numeric} km` : String(distance);
};

const normalizeTrack = (track: Track, t: (key: string) => string): PublicTrackCard => ({
  id: getTrackId(track),
  name: track.title || (track as any).name || t("public.common.untitledTrack"),
  city: track.city || "UAE",
  difficulty: track.difficulty || "all",
  location: [track.area, track.city].filter(Boolean).join(", ") || track.city || "UAE",
  distance: formatDistance(track.distance, t("public.common.na")),
  elevation: track.elevation ? String(track.elevation) : t("public.common.na"),
  level: titleCase(track.difficulty) || t("public.common.filters.allLevels"),
  featured: Boolean((track as any).featured || (track as any).isFeatured),
  img: getTrackImage(track),
});

const getPaginationItems = (page: number, totalPages: number): Array<number | string> => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) return [1, 2, 3, 4, "...", totalPages];
  if (page >= totalPages - 2) return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "...", page - 1, page, page + 1, "...", totalPages];
};

const FontLoader = () => (
  <style>{`
    * { box-sizing: border-box; margin: 0; }
    body { background: #EAF4FF; font-family: 'Bebas Kai', sans-serif; color: #000; }
    .bebas { font-family: 'Bebas Kai', sans-serif; font-weight: 400; letter-spacing: 0.02em; }
    a { text-decoration: none; color: inherit; }
    select { appearance: none; -webkit-appearance: none; background: transparent; border: none; outline: none; cursor: pointer; font-family: 'Bebas Kai', sans-serif; font-size: 20px; color: #000; width: 100%; }
    .tracks-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
    .tracks-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
      inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
    }

    .tracks-journey-card {
      width: 482px;
      height: 214px;
      max-width: 100%;
      border-radius: 12px;
      background: #019839;
      position: relative;
      overflow: visible;
    }

    .tracks-journey-card__image {
      position: absolute;
      width: 347px;
      height: 401px;
      left: 211px;
      top: -187px;
      object-fit: contain;
      transform: matrix(1, 0, 0, 1, 0, 0);
      transform-origin: center;
      z-index: 1;
      pointer-events: none;
    }

    .tracks-journey-card__eyebrow {
      position: absolute;
      left: 20px;
      top: 22px;
      width: 113px;
      min-height: 23px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      font-weight: 500;
      line-height: 145%;
      display: flex;
      align-items: center;
      z-index: 2;
    }

    .tracks-journey-card__title {
      position: absolute;
      left: 20px;
      top: 50px;
      width: 211px;
      color: #fff;
      font-size: 26px;
      line-height: 31px;
      text-transform: capitalize;
      z-index: 2;
    }

    .tracks-journey-card__community {
      position: absolute;
      left: 20px;
      top: 142px;
      width: 244.52px;
      height: 41.33px;
      z-index: 3;
    }

    .tracks-journey-card__avatar {
      position: absolute;
      top: 0;
      width: 41.33px;
      height: 41.33px;
      border-radius: 50%;
      border: 2px solid #fff;
      background-image: var(--avatar-bg);
      background-size: cover;
      background-position: center;
    }

    .tracks-journey-card__avatar:nth-child(1) { left: 0; }
    .tracks-journey-card__avatar:nth-child(2) { left: 20.67px; }
    .tracks-journey-card__avatar:nth-child(3) { left: 41.33px; }
    .tracks-journey-card__avatar:nth-child(4) { left: 62px; }
    .tracks-journey-card__avatar:nth-child(5) {
      left: 82.67px;
      background: #FFEFD7;
    }

    .tracks-journey-card__community-text {
      position: absolute;
      left: 94.52px;
      top: 10.5px;
      width: 151px;
      color: #000;
      font-size: 15px;
      font-weight: 500;
      line-height: 19px;
      white-space: nowrap;
    }

    @media (max-width: 620px) {
      .tracks-journey-card {
        height: 214px;
      }

      .tracks-journey-card__image {
        left: 42%;
        top: -150px;
        width: 310px;
        height: 360px;
      }
    }

    @media (max-width: 768px) {
      .track-local-nav {
        height: 78px !important;
        padding: 0 18px !important;
      }
      .track-local-nav nav,
      .track-local-nav > div:last-child span {
        display: none !important;
      }
      .track-local-nav .bebas {
        font-size: 22px !important;
      }
      .track-local-nav button {
        padding: 10px 18px !important;
        font-size: 14px !important;
      }
      .track-hero {
        height: 360px !important;
      }
      .track-hero-bg {
        background-position: center center !important;
      }
      .track-hero-content {
        left: 18px !important;
        right: 18px !important;
        bottom: 42px !important;
      }
      .track-hero-title {
        font-size: 46px !important;
      }
      .track-hero-breadcrumb {
        font-size: 17px !important;
      }
      .track-section {
        padding: 48px 18px !important;
      }
      .track-intro-wrap,
      .track-why-content,
      .track-footer-main,
      .track-faq-grid {
        flex-direction: column !important;
        gap: 26px !important;
      }
      .track-intro-left,
      .track-intro-right,
      .track-why-image,
      .track-footer-brand {
        flex: 1 1 auto !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .track-section-title,
      .track-intro-title,
      .track-why-title,
      .track-grid-title,
      .track-faq-title {
        font-size: 38px !important;
        line-height: 1.08 !important;
        max-width: 100% !important;
      }
      .track-journey-offset {
        padding-top: 34px !important;
      }
      .tracks-journey-card {
        width: 100% !important;
        overflow: hidden !important;
      }
      .tracks-journey-card__image {
        left: 45% !important;
        top: -116px !important;
        width: min(320px, 70vw) !important;
        height: auto !important;
      }
      .track-video {
        height: 240px !important;
      }
      .track-intro-text {
        font-size: 17px !important;
        line-height: 1.55 !important;
      }
      .track-why-head,
      .track-grid-head {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 20px !important;
      }
      .track-why-image {
        min-height: 260px !important;
      }
      .track-why-grid {
        grid-template-columns: 1fr 1fr !important;
      }
      .track-grid-section {
        padding: 48px 18px 0 !important;
      }
      .track-filter-bar {
        display: grid !important;
        grid-template-columns: 1fr !important;
        width: 100% !important;
      }
      .track-filter-field {
        width: 100% !important;
        height: 54px !important;
      }
      .track-filter-field select {
        font-size: 16px !important;
      }
      .track-filter-search {
        height: 54px !important;
        width: 100% !important;
        font-size: 17px !important;
      }
      .track-cards-grid {
        display: grid !important;
        grid-template-columns: 1fr !important;
        gap: 28px !important;
      }
      .track-card {
        width: 100% !important;
      }
      .track-card-image {
        height: 220px !important;
      }
      .track-stat-row {
        display: grid !important;
        grid-template-columns: 1fr !important;
      }
      .track-card-button {
        width: 100% !important;
      }
      .track-pagination {
        flex-wrap: wrap !important;
        gap: 8px !important;
        padding: 36px 0 48px !important;
      }
      .track-pagination button {
        width: 40px !important;
        height: 40px !important;
        min-width: 40px !important;
      }
      .track-faq-section {
        padding: 48px 18px !important;
      }
      .track-faq-question {
        min-height: 82px !important;
      }
      .track-faq-question p {
        font-size: 16px !important;
      }
      .track-cta {
        height: auto !important;
        min-height: 380px !important;
      }
      .track-cta-title {
        font-size: 48px !important;
      }
      .track-cta-text {
        font-size: 18px !important;
        line-height: 1.45 !important;
      }
      .track-cta-buttons {
        flex-direction: column !important;
        width: min(100%, 260px) !important;
      }
      .track-cta-buttons button,
      .track-cta-buttons a {
        justify-content: center !important;
        width: 100% !important;
      }
      .track-footer {
        padding: 48px 18px 28px !important;
      }
      .track-newsletter {
        height: auto !important;
        flex-direction: column !important;
      }
      .track-newsletter input,
      .track-newsletter button {
        min-height: 46px !important;
      }
      .track-footer-top-button {
        position: static !important;
        margin: 18px auto 0 !important;
      }
    }

    @media (max-width: 420px) {
      .track-hero {
        height: 320px !important;
      }
      .track-section-title,
      .track-intro-title,
      .track-why-title,
      .track-grid-title,
      .track-faq-title,
      .track-cta-title {
        font-size: 34px !important;
      }
      .track-why-grid {
        grid-template-columns: 1fr !important;
      }
      .tracks-journey-card__image {
        left: 50% !important;
        top: -94px !important;
        width: 240px !important;
      }
      .tracks-journey-card__title {
        width: 170px !important;
        font-size: 24px !important;
        line-height: 28px !important;
      }
      .track-video,
      .track-card-image {
        height: 200px !important;
      }
    }
  `}</style>
);

function TracksJourneyCard() {
  const { t } = useTranslation();
  const avatarBackgrounds = [
    "linear-gradient(135deg, #f7c59f 0%, #7aa7ff 100%)",
    "linear-gradient(135deg, #f58b8b 0%, #ffe08a 100%)",
    "linear-gradient(135deg, #78d0b2 0%, #3567b7 100%)",
    "linear-gradient(135deg, #323232 0%, #b8d7ff 100%)",
  ];

  return (
    <div className="tracks-journey-card">
      <img
        src="/img/image 2991.png"
        alt={t("public.common.journeyCard.riderAlt")}
        className="tracks-journey-card__image"
      />
      <p className="tracks-journey-card__eyebrow">{t("public.common.journeyCard.eyebrow")}</p>
      <h3 className="bebas tracks-journey-card__title">{t("public.common.journeyCard.title")}</h3>
      <div className="tracks-journey-card__community" aria-label={t("public.common.journeyCard.community")}>
        {avatarBackgrounds.map((background, index) => (
          <span
            key={index}
            className="tracks-journey-card__avatar"
            style={{ "--avatar-bg": background } as CSSProperties}
          />
        ))}
        <span className="tracks-journey-card__avatar" />
        <span className="tracks-journey-card__community-text">{t("public.common.journeyCard.community")}</span>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { t } = useTranslation();
  const titleWords = t("public.tracks.hero.titleWords", { returnObjects: true }) as string[];
  const breadcrumb = t("public.tracks.hero.breadcrumb", { returnObjects: true }) as string[];

  return (
    <PublicPageHero
      titleWords={titleWords}
      breadcrumb={breadcrumb}
      backgroundImage="/img/pexels-krizz59-12838 1.png"
      classPrefix="track"
    />
  );
}

// ── Explore Intro ─────────────────────────────────────────────────────────────
function ExploreIntro() {
  const { t } = useTranslation();
  const titleWords = useWordList("public.tracks.intro.titleWords");

  return (
    <section className="track-section" style={{ background: "#EAF4FF", padding: "80px 82px" }}>
      <div className="track-intro-wrap" style={{ display: "flex", gap: 48, alignItems: "flex-start", overflow: "visible" }}>
        <div className="track-intro-left" style={{ flex: "0 0 480px" }}>
          <h2
            className="bebas track-intro-title overflow-hidden"
            style={{
              fontSize: 60,
              lineHeight: 1.0,
              textTransform: "capitalize",
              marginBottom: 64,
            }}
          >
            <AnimatedWords words={titleWords} gap={12} />
          </h2>
         <motion.div
          className="track-journey-offset"
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{ once: true }}
          style={{ paddingTop: 90 }}
        >
          <TracksJourneyCard />
        </motion.div>
        </div>

        {/* Right: video thumbnail + description */}
        <div className="track-intro-right" style={{ flex: 1 }}>
          <motion.div
          className="track-video"
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{ once: true }}
          style={{
            borderRadius: 12,
            overflow: "hidden",
            height: 340,
            marginBottom: 28,
            backgroundImage: "url('/img/SSYouTube.online_Falcon_daman.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
        </motion.div>
          {/* <div className="track-video" style={{
            borderRadius: 12, overflow: "hidden", height: 340, marginBottom: 28,
            backgroundImage: "url('/img/SSYouTube.online_Falcon_daman.png')",
            backgroundSize: "cover", backgroundPosition: "center",
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
          }}> */}
            {/* <div style={{
              width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <span style={{ fontSize: 22, marginLeft: 4 }}>▶</span>
            </div> */}
          {/* </div> */}
          <p className="track-intro-text" style={{ fontSize: 22, lineHeight: 1.55, color: "#000" }}>
            {t("public.tracks.intro.body")}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Why ADCC Tracks ───────────────────────────────────────────────────────────
function WhySection() {
  const { t } = useTranslation();
  const titleWords = useWordList("public.tracks.why.title");
  const featureKeys = ["infrastructure", "routes", "community", "performance"] as const;
  const features = featureKeys.map((key, index) => ({
    num: `//00${index + 1}`,
    title: t(`public.tracks.why.features.${key}.title`),
    desc: t(`public.tracks.why.features.${key}.desc`),
  }));

  return (
    <section className="track-section" style={{
      backgroundImage: "url('/img/image 3517.png')",
      // backgroundSize: "cover",
      backgroundSize: "100% 100%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      padding: "80px 82px", position: "relative", overflow: "hidden"
    }}>
      {/* bg texture */}
      {/* <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1440&q=80')",
        backgroundSize: "cover", opacity: 0.08
      }} /> */}
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* header row */}
        <div className="track-why-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
          <h2
            className="bebas track-why-title overflow-hidden"
            style={{
              fontSize: 50,
              color: "#000",
              lineHeight: 1.2,
              maxWidth: 300,
            }}
          >
            <AnimatedWords words={titleWords} gap={12} />
          </h2>
          <button style={{
            background: "#019839", color: "#fff", border: "none", borderRadius: 30,
            padding: "13px 28px", fontWeight: 700, fontSize: 18, cursor: "pointer",
            fontFamily: "'Bebas Kai',sans-serif", display: "flex", alignItems: "center", gap: 10
          }}>{t("public.common.exploreTracksArrow")}</button>
        </div>

        <div className="track-why-content" style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          {/* cycling photo */}
          <motion.div
            className="track-why-image"
            initial={{ opacity: 0, x: -140 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
            viewport={{ once: true }}
            style={{
              flex: "0 0 480px",
              borderRadius: 12,
              overflow: "hidden",
              backgroundImage: "url('/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: 420
            }}
          />
          {/* 2x2 feature grid */}
          <div className="track-why-grid" style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 120 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.12,
                  ease: "easeOut",
                }}
                viewport={{ once: true }}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  backdropFilter: "blur(7.5px)",
                  borderRadius: 12,
                  padding: "28px 24px"
                }}
              >
                <p style={{ fontSize: 13, color: "#fff", fontWeight: 400, marginBottom: 14, opacity: 0.8 }}>{f.num}</p>
                <h4 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 12, lineHeight: 1.3 }}>{f.title}</h4>
                <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.6, opacity: 0.9 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Track card ────────────────────────────────────────────────────────────────
function TrackCard({ track, index = 0 }: { track: PublicTrackCard; index?: number }) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const isFeatured = track.featured || isHovered;
  // const cardBg = isFeatured ? "#435974" : "#fff";
  const cardBg = isHovered ? "#435974" : "#fff";
  // const textColor = isFeatured ? "#fff" : "#000";
  const textColor = isHovered ? "#fff" : "#000";
  // const statBg = isFeatured ? "#435974" : "#323232";
  const statBg = "#435974";
  const borderStyle = isFeatured ? "none" : "1px solid rgba(0,0,0,0.3)";
  const mutedText = isFeatured ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)";

  return (
    <motion.div
    className="track-card"
    initial={{ opacity: 0, y: 120 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      duration: 0.5,
      delay: index * 0.08,
      ease: "easeOut",
    }}
    viewport={{ once: true }}
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
    style={{
      width: "calc(33.33% - 19px)", minWidth: 0,
      borderRadius: 12, overflow: "hidden",
      background: cardBg, border: borderStyle,
      display: "flex", flexDirection: "column",
      transition: "all .3s",
      cursor: "pointer",
    }}>
      {/* image */}
      <div className="track-card-image adcc-image adcc-image--fill" style={{
        height: 240, overflow: "hidden", position: "relative",
        background: "#ddd"
      }}>
        <img className="adcc-image__img adcc-image__img--fill" src={track.img} alt={track.name} />
      </div>

      {/* info */}
      <div style={{ padding: "20px 14px 24px" }}>
        {/* location */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: mutedText }}>{track.location}</span>
        </div>
        {/* name */}
        <h3 className="bebas" style={{ fontSize: 24, color: textColor, marginBottom: 16, letterSpacing: 0.5 }}>{track.name}</h3>

        {/* stats row */}
        <div className="track-stat-row" style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[
            { label: t("public.common.stats.distance"), val: track.distance },
            { label: t("public.common.stats.elevation"), val: track.elevation },
            { label: t("public.common.stats.level"), val: track.level },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: statBg,
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 5, padding: "10px 6px", textAlign: "center"
            }}>
              <div style={{ fontSize: 12, color: "#fff", opacity: 0.8, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Bebas Kai',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* button */}
        <button className="track-card-button" style={{
          width: 157, height: 50,
          background: isFeatured ? "#fff" : "transparent",
          border: isFeatured ? "none" : "1px solid rgba(0,0,0,0.5)",
          borderRadius: 30, cursor: "pointer",
          color: isFeatured ? "#435974" : "rgba(0,0,0,0.49)",
          fontSize: 15, fontWeight: 700, fontFamily: "'Bebas Kai',sans-serif",
          transition: "all .2s"
        }}>{t("public.common.viewDetails")}</button>
      </div>
    </motion.div>
  );
}

// ── Tracks grid ───────────────────────────────────────────────────────────────
function TracksGrid() {
  const { t, i18n } = useTranslation();
  const [filters, setFilters] = useState<TrackFilters>({ city: ALL_FILTER_VALUE, level: ALL_FILTER_VALUE });
  const [openDropdown, setOpenDropdown] = useState<keyof TrackFilters | null>(null);
  const [active, setActive] = useState(filters);
  const [page, setPage] = useState(1);
  const [tracks, setTracks] = useState<PublicTrackCard[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cityFilterOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: t("public.common.filters.allCities") },
      ...UAE_CITIES.map((city) => ({ value: city, label: city })),
    ],
    [t, i18n.language],
  );

  const levelFilterOptions = useMemo<FilterOption[]>(
    () => [
      { value: ALL_FILTER_VALUE, label: t("public.common.filters.allLevels") },
      { value: "easy", label: t("public.common.filters.easy") },
      { value: "medium", label: t("public.common.filters.medium") },
      { value: "hard", label: t("public.common.filters.hard") },
    ],
    [t, i18n.language],
  );

  useEffect(() => {
    let mounted = true;

    const loadTracks = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getTracksPageEn({
          page,
          limit: PAGE_SIZE,
          city: active.city === ALL_FILTER_VALUE ? undefined : active.city,
          difficulty: active.level === ALL_FILTER_VALUE ? undefined : active.level,
          publicOnly: true,
        });

        if (mounted) {
          setTracks(response.tracks.map((track) => normalizeTrack(track, t)));
          setTotalResults(response.pagination.total);
          setTotalPages(Math.max(1, response.pagination.pages || 1));
        }
      } catch (err) {
        console.error("Failed to load public tracks:", err);
        if (mounted) {
          setTracks([]);
          setTotalResults(0);
          setTotalPages(1);
          setError(t("public.common.loadErrorTracks"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTracks();

    return () => {
      mounted = false;
    };
  }, [active, page, t]);

  const ChevronDown = ({ open = false }: { open?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
      <path d="M6 9l6 6 6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const filterControls: Array<{ key: keyof TrackFilters; options: FilterOption[] }> = [
    { key: "city", options: cityFilterOptions },
    { key: "level", options: levelFilterOptions },
  ];
  const paginationItems = getPaginationItems(page, totalPages);

  const renderDropdown = ({ key, options }: { key: keyof TrackFilters; options: FilterOption[] }) => {
    const selectedLabel = options.find((option) => option.value === filters[key])?.label || options[0]?.label || "";
    const isOpen = openDropdown === key;

    return (
      <div className="track-filter-field" style={{ position: "relative", width: 220 }}>
        <button
          type="button"
          onClick={() => setOpenDropdown((current) => (current === key ? null : key))}
          style={{
            width: "100%",
            height: 60,
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 0 22px",
            gap: 8,
            cursor: "pointer",
            fontFamily: "'Bebas Kai',sans-serif",
            fontSize: 20,
            color: "#000",
            textAlign: "left",
          }}
          aria-expanded={isOpen}
        >
          <span style={{ minWidth: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedLabel}
          </span>
          <ChevronDown open={isOpen} />
        </button>

        {isOpen && (
          <div
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
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setFilters((previous) => ({ ...previous, [key]: option.value }));
                  setOpenDropdown(null);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  border: 0,
                  background: option.value === filters[key] ? "#EAF4FF" : "#fff",
                  color: option.value === filters[key] ? "#019839" : "#000",
                  padding: "12px 18px",
                  textAlign: "left",
                  fontFamily: "'Bebas Kai',sans-serif",
                  fontSize: 16,
                  fontWeight: option.value === filters[key] ? 700 : 400,
                  cursor: "pointer",
                }}
              >
                <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="track-grid-section" style={{ background: "#EAF4FF", padding: "60px 82px 0" }}>
      {/* section title + filters */}
      <div className="track-grid-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
        <motion.h2
          className="bebas track-grid-title overflow-hidden"
          style={{
            fontSize: 50,
            lineHeight: 1.15,
            maxWidth: 440,
            textTransform: "capitalize",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {["Explore", "Certified", "Routes", "Across", "the", "UAE"].map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="inline-block overflow-hidden"
              style={{ marginRight: "12px" }}
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <div className="track-filter-bar" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {filterControls.map((f, index) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
            >
              {renderDropdown(f)}
            </motion.div>
          ))}
          <motion.button
            className="track-filter-search"
            initial={{ opacity: 0, x: 120 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.5,
              delay: filterControls.length * 0.12,
              ease: "easeOut",
            }}
            viewport={{ once: true }} onClick={() => { setActive(filters); setPage(1); }} style={{
            height: 60, padding: "0 32px", background: "#019839", color: "#fff",
            border: "none", borderRadius: 40, fontSize: 20, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Bebas Kai',sans-serif"
          }}>{t("public.common.search")}</motion.button>
        </div>
      </div>

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 24 }}>
        {loading
          ? t("public.common.loadingTracks")
          : t("public.common.showingCount", { count: totalResults })}
      </p>

      <div className="track-cards-grid" style={{ display: "flex", flexWrap: "wrap", gap: "48px 28px" }}>
        {tracks.map((t, index) => <TrackCard key={t.id} track={t} index={index} />)}
      </div>

      {!loading && error && (
        <p style={{ fontSize: 17, color: "#B42318", padding: "32px 0 8px" }}>{error}</p>
      )}

      {!loading && !error && tracks.length === 0 && (
        <p style={{ fontSize: 17, color: "rgba(0,0,0,0.7)", padding: "32px 0 8px" }}>
          {t("public.common.noTracksFiltered")}
        </p>
      )}

      {/* Pagination */}
      <div className="track-pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "48px 0 64px" }}>
        {paginationItems.map((p, i) => {
          const isDots = typeof p === "string";
          const isActive = p === page;
          return (
            <button key={i} onClick={() => !isDots && setPage(p)} style={{
              width: isDots ? "auto" : 47, height: isDots ? "auto" : 47,
              minWidth: isDots ? 0 : 47,
              borderRadius: "50%", border: "none",
              background: isActive ? "#019839" : "transparent",
              color: isActive ? "#fff" : "#019839",
              fontSize: 18, fontWeight: 500, cursor: isDots ? "default" : "pointer",
              fontFamily: "'Bebas Kai',sans-serif", letterSpacing: isDots ? "0.2em" : 0,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{p}</button>
          );
        })}
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} style={{
          width: 47, height: 47, borderRadius: "50%", border: "none",
          background: "#019839", color: "#fff", cursor: "pointer",
          fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center"
        }}>›</button>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
type FaqItem = { q: string; a: string };

function FAQ() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<number | null>(null);
  const faqs = t("public.tracks.faq.items", { returnObjects: true }) as FaqItem[];
  const left = faqs.filter((_, i) => i % 2 === 0);
  const right = faqs.filter((_, i) => i % 2 !== 0);

  useEffect(() => {
    setOpen(null);
  }, [i18n.language]);

  const Item = ({ faq, idx }: { faq: FaqItem; idx: number }) => (
    <div
      className="track-faq-question"
      onClick={() => setOpen(open === idx ? null : idx)}
      style={{
        border: "1px solid #CCC", borderRadius: 12, padding: "0 24px",
        cursor: "pointer", overflow: "hidden",
        transition: "all .25s",
        marginBottom: 16,
        textAlign: "start",
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        minHeight: 100, gap: 16,
      }}>
        <p style={{ fontSize: 20, fontWeight: 500, color: "rgba(0,0,0,0.8)", lineHeight: 1.4, flex: 1, textAlign: "start" }}>{faq.q}</p>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0, transform: open === idx ? "rotate(45deg)" : "none",
          transition: "transform .2s"
        }}>+</span>
      </div>
      {open === idx && (
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.65)", lineHeight: 1.7, paddingBottom: 20, textAlign: "start" }}>{faq.a}</p>
      )}
    </div>
  );

  return (
    <section className="track-faq-section" style={{ background: "#EAF4FF", padding: "80px 82px" }}>
      <h2 className="bebas track-faq-title" style={{ fontSize: 50, textAlign: "center", marginBottom: 12 }}>{t("public.tracks.faq.title")}</h2>
      <p style={{ fontSize: 17, textAlign: "center", color: "#1D1D1D", marginBottom: 52 }}>
        {t("public.tracks.faq.subtitle")}
      </p>
      <div className="track-faq-grid" style={{ display: "flex", gap: 28 }}>
        <div style={{ flex: 1 }}>{left.map((f, i)  => <Item key={`${i18n.language}-l-${i}`} faq={f} idx={i * 2} />)}</div>
        <div style={{ flex: 1 }}>{right.map((f, i) => <Item key={`${i18n.language}-r-${i}`} faq={f} idx={i * 2 + 1} />)}</div>
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="track-cta" style={{ position: "relative", overflow: "hidden", height: 502 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), url('https://images.unsplash.com/photo-1570489460099-2a6e43e4c3f0?w=1440&q=80')",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", textAlign: "center", padding: "0 24px"
      }}>
        <h2 className="bebas track-cta-title" style={{ fontSize: 94, color: "#fff", lineHeight: 1, textTransform: "uppercase" }}>
          Start Your Ride Today
        </h2>
        <p className="track-cta-text" style={{ fontSize: 24, color: "#fff", marginTop: 12, marginBottom: 36 }}>
          Download the ADCC app and join the cycling community.
        </p>
        <div className="track-cta-buttons" style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Google Play", href: APP_STORE_LINKS.googlePlay },
            { label: "App Store", href: APP_STORE_LINKS.appStore },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                background: "#fff", border: "none", borderRadius: 100,
                padding: "14px 32px", fontWeight: 600, fontSize: 16, cursor: "pointer",
                fontFamily: "'Bebas Kai',sans-serif", textDecoration: "none", color: "#000",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="track-footer" style={{ background: "#EAF4FF", padding: "60px 82px 32px" }}>
      <div className="track-footer-main" style={{ display: "flex", gap: 64, marginBottom: 48 }}>
        <div className="track-footer-brand" style={{ flex: "0 0 340px" }}>
          <div style={{ marginBottom: 16 }}>
            <span className="bebas" style={{ fontSize: 24, letterSpacing: 2 }}>ABU◉DHABI<br/>CYCLING CLUB</span>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#000", maxWidth: 340, marginBottom: 24 }}>
            From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          <div className="track-newsletter" style={{ display: "flex", background: "#8DDF93", borderRadius: 8, overflow: "hidden", height: 56 }}>
            <input placeholder="Enter your email" style={{
              flex: 1, border: "none", background: "transparent",
              padding: "0 18px", fontSize: 15, fontFamily: "'Bebas Kai',sans-serif", outline: "none"
            }} />
            <button style={{
              background: "#019839", color: "#fff", border: "none",
              padding: "0 22px", fontSize: 15, cursor: "pointer", fontFamily: "'Bebas Kai',sans-serif"
            }}>Submit</button>
          </div>
        </div>
        <div>
          <div className="bebas" style={{ fontSize: 22, textTransform: "uppercase", marginBottom: 18 }}>Quick Links</div>
          {["About Us", "Rides", "Events", "Cyclist's Corner", "Contact Us"].map(l => (
            <p key={l} style={{ fontSize: 16, marginBottom: 10 }}><a href="#" style={{ color: "#000" }}>{l}</a></p>
          ))}
        </div>
        <div>
          <div className="bebas" style={{ fontSize: 22, textTransform: "uppercase", marginBottom: 18 }}>Contact Us</div>
          {[
            { icon: "📞", text: "+971 2 654 5645" },
            { icon: "💬", text: "144226" },
            { icon: "✉️", text: "info@adcyclingclub.ae" },
            { icon: "📍", text: "Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18." },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 17 }}>{c.icon}</span>
              <span style={{ fontSize: 16, lineHeight: 1.4 }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #D5D5D5", paddingTop: 22, textAlign: "center", position: "relative" }}>
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.7)" }}>Copyright 2026. Abu Dhabi Cycling Club</p>
        <button className="track-footer-top-button" style={{
          position: "absolute", right: 0, top: -28,
          width: 55, height: 55, borderRadius: "50%",
          background: "#019839", border: "none", cursor: "pointer",
          color: "#fff", fontSize: 22
        }}>↑</button>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function Tracks() {
  return (
    <>
      <FontLoader />
      <div className="tracks-page" style={{ minWidth: 320, overflowX: "hidden" }}>
        <Hero />
        <ExploreIntro />
        <WhySection />
        <TracksGrid />
        <FAQ />
        {/* <CTABanner /> */}
        {/* <Footer /> */}
      </div>
    </>
  );
}
