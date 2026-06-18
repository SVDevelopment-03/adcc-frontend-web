import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getPublicStats } from "../../services/publicStatsApi";
import { motion } from "framer-motion";
import { AnimatedButton } from "../ui/AnimatedButton";
import { AnimatedImage } from "../ui/AnimatedImage";
import {
  AnimatedWords,
  PublicPageHero,
  useWordList,
} from "../public/publicPageHelpers";

// ─── Page styles ─────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    :root {
      --green:   #019839;
      --black:   #000000;
      --white:   #FFFFFF;
      --bg:      #EAF4FF;
      --cream:   #FFF9EF;
      --red-light: #FFEFEF;
      --blue-dark: #013282;
    }






    .about-mission-content {
        justify-content: space-between !important;
      }








    * { box-sizing: border-box; }

    body { background: var(--bg); color: var(--black); }

    .bebas { font-family: 'Bebas Kai', sans-serif; font-weight: 400; letter-spacing: 0.02em; }

    .about-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
    .about-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
      inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
    }

.about-page .about-stats-grid > div{
    border-left: 3px solid rgb(31, 80, 154) !important;
    padding-left: 16px !important;
    padding-bottom: 20px !important;
    padding-top: 20px !important;}

.about-stats-grid
{
margin-bottom: 3rem !important;}


    .journey-card {
      flex: 0 0 480px;
      width: 480px;
      height: 352px;
      border-radius: 12px;
      overflow: visible;
      background: rgba(0, 0, 0, 0.15);
      position: relative;
    }

    .journey-card__image {
      position: absolute;
      width: 418px;
      height: 484px;
      left: 208px;
      top: -107px;
      object-fit: contain;
      transform: none;
      transform-origin: center;
      z-index: 1;
      pointer-events: none;
    }

    .value-card {
      background: #777777;
      transition: background 0.25s ease;
    }

    .value-card:hover {
      background: #323232;
    }
      
    .journey-card__eyebrow {
      position: absolute;
      left: 20px;
      top: 22px;
      width: 113px;
      min-height: 23px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Bebas Kai', sans-serif;
      font-size: 16px;
      font-weight: 500;
      line-height: 145%;
      display: flex;
      align-items: center;
      z-index: 2;
    }

    .journey-card__title {
      position: absolute;
      left: 20px;
      top: 50px;
      width: 167px;
      color: #fff;
      font-size: 40px;
      line-height: 48px;
      text-transform: capitalize;
      z-index: 2;
    }

    .journey-card__community {
      position: absolute;
      left: 20px;
      top: 214px;
      width: 238.52px;
      height: 41.33px;
      z-index: 3;
    }

    .journey-card__avatar {
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

    .journey-card__avatar:nth-child(1) { left: 0; }
    .journey-card__avatar:nth-child(2) { left: 20.67px; }
    .journey-card__avatar:nth-child(3) { left: 41.33px; }
    .journey-card__avatar:nth-child(4) { left: 62px; }
    .journey-card__avatar:nth-child(5) {
      left: 82.67px;
      background: #FFF9EF;
    }

    .journey-card__community-text {
      position: absolute;
      left: 94.52px;
      top: 10.5px;
      width: 145px;
      color: #000;
      font-family: 'Satoshi', sans-serif;
      font-size: 15px;
      font-weight: 500;
      line-height: 19px;
      white-space: nowrap;
    }

    .journey-card__button {
      position: absolute;
      left: 20px;
      top: 275px;
      width: 223px;
      z-index: 3;
    }

    @media (max-width: 1220px) {
      .mission-content {
        flex-wrap: wrap;
      }

      .journey-card {
        flex-basis: min(480px, 100%);
      }
    }

    @media (max-width: 620px) {
      .journey-card {
        width: 100%;
        flex-basis: 100%;
        height: 320px;
      }

      .journey-card__image {
        left: 45%;
        top: -78px;
        width: 360px;
        height: 420px;
      }

      .journey-card__community { top: 196px; }
      .journey-card__button { top: 261px; }
    }
      

    @media (max-width: 768px) {
      .about-local-nav {
        height: 78px !important;
        padding: 0 18px !important;
      }
      .about-local-nav nav,
      .about-local-nav > div:last-child span {
        display: none !important;
      }
      .about-local-nav .bebas {
        font-size: 22px !important;
      }
      .about-local-nav button {
        padding: 10px 18px !important;
        font-size: 14px !important;
      }
      .about-hero {
        height: 360px !important;
      }
      .about-hero-bg {
        background-position: center center !important;
      }
      .about-hero-content {
        left: 18px !important;
        right: 18px !important;
        bottom: 42px !important;
      }
      .about-hero-title {
        font-size: 46px !important;
      }
      .about-hero-breadcrumb {
        font-size: 17px !important;
      }
      .about-section {
        padding: 48px 18px !important;
      }
      .about-stats-wrap,
      .about-mission-head,
      .about-values-head,
      .about-footer-main {
        flex-direction: column !important;
        gap: 26px !important;
        align-items: stretch !important;
      }
      .about-stats-left,
      .about-stats-right,
      .about-mission-card-stack,
      .about-footer-brand {
        flex: 1 1 auto !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .about-section-title,
      .about-stats-title,
      .about-mission-title,
      .about-values-title,
      .about-coaches-title {
        font-size: 38px !important;
        line-height: 1.08 !important;
        max-width: 100% !important;
      }
      .about-stats-photo {
        max-width: 100% !important;
        height: 190px !important;
      }
      .about-stats-grid {
        grid-template-columns: 1fr 1fr !important;
        gap: 0 18px !important;
      }
      .about-stat-number {
        font-size: 38px !important;
      }
      .about-stat-label {
        font-size: 15px !important;
      }
      .about-body-text,
      .about-mission-intro {
        max-width: 100% !important;
        font-size: 17px !important;
        line-height: 1.55 !important;
      }
      .about-mission-content {
        flex-direction: column !important;
        gap: 22px !important;
        align-items: stretch !important;
        justify-content: space-between !important;
      }
      .about-mission-card-stack > div {
        padding: 22px 20px !important;
      }
      .journey-card {
        flex: 1 1 auto !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow: hidden !important;
      }
      .journey-card__image {
        left: 42% !important;
        width: min(360px, 74vw) !important;
        height: auto !important;
      }
      .journey-card__title {
        width: min(178px, 56vw) !important;
        font-size: 34px !important;
        line-height: 39px !important;
      }
      .journey-card__community {
        width: 230px !important;
      }
      .journey-card__community-text {
        color: #fff !important;
        text-shadow: 0 1px 8px rgba(0,0,0,0.45);
      }
      .about-values-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 18px !important;
      }
      .about-value-card {
        min-height: 220px !important;
      }
      .about-coaches-grid {
        flex-direction: column !important;
        height: auto !important;
        border-radius: 14px !important;
      }
      .about-coach-card {
        min-height: 260px !important;
        flex: none !important;
      }
      .about-cta {
        height: auto !important;
        min-height: 380px !important;
      }
      .about-cta-title {
        font-size: 48px !important;
      }
      .about-cta-text {
        font-size: 18px !important;
        line-height: 1.45 !important;
      }
      .about-cta-buttons {
        flex-direction: column !important;
        width: min(100%, 260px) !important;
      }
      .about-cta-buttons button {
        justify-content: center !important;
        width: 100% !important;
      }
      .about-newsletter {
        width: 100% !important;
        max-width: 340px !important;
      }
      .about-footer-bottom {
        padding-right: 0 !important;
      }
      .about-footer-top-button {
        position: static !important;
        margin: 18px auto 0 !important;
      }
    }

    @media (max-width: 420px) {
      .about-section {
        padding: 42px 16px !important;
      }
      .about-hero {
        height: 320px !important;
      }
      .about-section-title,
      .about-stats-title,
      .about-mission-title,
      .about-values-title,
      .about-coaches-title {
        font-size: 34px !important;
      }
      .about-stats-grid,
      .about-values-grid {
        grid-template-columns: 1fr !important;
      }
      .journey-card {
        height: 330px !important;
      }
      .journey-card__image {
        left: 48% !important;
        top: -34px !important;
        width: 260px !important;
      }
      .journey-card__title {
        font-size: 30px !important;
        line-height: 34px !important;
        width: 150px !important;
      }
      .journey-card__community {
        top: 208px !important;
        left: 18px !important;
      }
      .journey-card__button {
        top: 272px !important;
        left: 18px !important;
        width: calc(100% - 36px) !important;
      }
      .about-cta-title {
        font-size: 40px !important;
      }
      .about-newsletter {
        height: auto !important;
        flex-direction: column !important;
      }
      .about-newsletter input {
        min-height: 48px !important;
      }
      .about-newsletter button {
        min-height: 46px !important;
        border-radius: 0 0 8px 8px !important;
      }
    }

    .about-hero{
    padding-inline-start: 86px !important;}

.journey-card__title{
    padding-bottom: 25px !important;
    display: block !important;}

.about-coaches-title div{
justify-content: center !important;}
    .public-layout .adcc-btn, button{
    font-weight: 500 !important;}
  `}</style>
);

function JourneyCard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const titleWords = useWordList("public.common.journeyCard.title");

  const avatarBackgrounds = [
    "linear-gradient(135deg, #f7c59f 0%, #7aa7ff 100%)",
    "linear-gradient(135deg, #f58b8b 0%, #ffe08a 100%)",
    "linear-gradient(135deg, #78d0b2 0%, #3567b7 100%)",
    "linear-gradient(135deg, #323232 0%, #b8d7ff 100%)",
  ];

  return (
    <div className="journey-card">
      <motion.img
        src="/img/image 2991.png"
        alt={t("public.common.journeyCard.riderAlt")}
        className="journey-card__image"
        initial={{ opacity: 0, x: 200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeOut",
        }}
        viewport={{ once: true }}
      />

      <p className="journey-card__eyebrow font-satoshi">
        {t("public.common.journeyCard.eyebrow")}
      </p>

      <h3
        className="bebas journey-card__title"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {titleWords.map((word, index) => (
          <motion.span
            key={`${word}-${index}`}
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.35,
              delay: index * 0.07,
            }}
            viewport={{ once: true }}
            style={{
              display: "inline-block",
            }}
          >
            {word}
          </motion.span>
        ))}
      </h3>

      <div
        className="journey-card__community"
        aria-label={t("public.common.journeyCard.community")}
      >
        {avatarBackgrounds.map((background, index) => (
          <span
            key={index}
            className="journey-card__avatar"
            style={{ "--avatar-bg": background } as React.CSSProperties}
          />
        ))}
        <span className="journey-card__avatar" />
        <span className="journey-card__community-text">
          {t("public.common.journeyCard.community")}
        </span>
      </div>

      <AnimatedButton
        className="journey-card__button"
        onClick={() => navigate("/contact-us")}
        fullWidth
      >
        {t("public.common.journeyCard.cta")}
      </AnimatedButton>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  const { t } = useTranslation();
  const titleWords = t("public.about.hero.titleWords", {
    returnObjects: true,
  }) as string[];
  const breadcrumb = t("public.about.hero.breadcrumb", {
    returnObjects: true,
  }) as string[];

  return (
    <PublicPageHero
      titleWords={titleWords}
      breadcrumb={breadcrumb}
      backgroundImage="/img/Frame 2147226602.png"
      classPrefix="about"
    />
  );
}

// ─── STATS + INTRO ────────────────────────────────────────────────────────────
function StatsSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const titleWords = useWordList("public.about.stats.titleWords");
  const [activeMembers, setActiveMembers] = useState<number | null>(null);
  const [organizedEvents, setOrganizedEvents] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPublicStats()
      .then((stats) => {
        if (cancelled) return;
        setActiveMembers(stats.members.active);
        setOrganizedEvents(stats.events.completed);
      })
      .catch((error) => {
        console.error("Failed to load public stats:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    {
      val: formatPublicStat(activeMembers, "5K+"),
      label: t("public.about.stats.activeMembers"),
    },
    {
      val: formatPublicStat(organizedEvents, "100+"),
      label: t("public.about.stats.eventsOrganized"),
    },
    { val: "20+", label: t("public.about.stats.communityRides") },
    { val: "2017", label: t("public.about.stats.established") },
  ];
  return (
    <section
      className="about-section"
      style={{ background: "#EAF4FF", padding: "80px 86px" }}
    >
      <div
        className="about-stats-wrap"
        style={{ display: "flex", gap: 0, alignItems: "flex-start" }}
      >
        {/* Headline — 65% */}
        <div
          className="about-stats-left"
          style={{ flex: "0 0 60%", paddingInlineEnd: 64 }}
        >
          <h2
            className="bebas about-stats-title overflow-hidden"
            style={{
              fontSize: 50,
              lineHeight: 1.1,
              textTransform: "uppercase",
            }}
          >
            <AnimatedWords words={titleWords} gap={12} />
          </h2>
          <motion.div
            className="about-stats-photo"
            initial={{ opacity: 0, x: -200 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{
              marginTop: 32,
              borderRadius: 12,
              overflow: "hidden",
              width: "100%",
              maxWidth: "100%",
              height: 320,
              background: "#ddd",
              backgroundImage: "url('/img/DSC04620.jpg 1.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        </div>

        {/* Stats grid + text — 35% */}
        <div className="about-stats-right" style={{ flex: "0 0 35%" }}>
          <div
            className="about-stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px 32px",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  borderLeft: "3px solid #1F509A",
                  paddingLeft: 16,
                  paddingBottom: 36,
                }}
              >
                <div
                  className="font-satoshi about-stat-number"
                  style={{ fontSize: 46, lineHeight: 1, fontWeight: 500 }}
                >
                  {s.val}
                </div>
                <div
                  className="font-satoshi about-stat-label"
                  style={{
                    fontSize: 14,
                    color: "#444",
                    marginTop: 6,
                    lineHeight: 1.4,
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p
            className="font-satoshi about-body-text"
            style={{
              fontSize: 18,
              lineHeight: 1.6,
              maxWidth: 380,
              marginBottom: 28,
              marginTop: 8,
              color: "rgba(0,0,0,0.8)",
            }}
          >
            {t("public.about.stats.body")}
          </p>
          <AnimatedButton onClick={() => navigate("/contact-us")}>
            {t("public.common.getInTouch")}
          </AnimatedButton>
        </div>
      </div>
    </section>
  );
}

function formatPublicStat(value: number | null, fallback: string) {
  if (value === null) return fallback;
  if (value >= 1000) {
    const formatted =
      value >= 10000
        ? Math.round(value / 1000)
        : Number((value / 1000).toFixed(1));
    return `${formatted}K+`;
  }
  return `${value}+`;
}

// ─── MISSION / VISION + JOURNEY CARD ─────────────────────────────────────────
function MissionSection() {
  const { t } = useTranslation();
  const titleWords = useWordList("public.about.mission.titleWords");

  return (
    // <section style={{ background: "#EAF4FF", padding: "0 86px 80px" }}>
    <section
      className="about-section"
      style={{
        backgroundImage: "url('/img/image 3517.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "80px 86px",
      }}
    >
      {/* Headline row */}
      <div
        className="about-mission-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 40,
        }}
      >
        <div>
          <h2
            className="bebas about-mission-title overflow-hidden"
            style={{
              fontSize: 50,
              lineHeight: 1.2,
              maxWidth: 480,
              textTransform: "capitalize",
            }}
          >
            <AnimatedWords words={titleWords} gap={12} />
          </h2>
        </div>
        <p
          className="about-mission-intro"
          style={{
            maxWidth: 480,
            fontSize: 22,
            fontWeight: 500,
            lineHeight: 1.5,
            color: "rgba(0,0,0,0.8)",
            paddingTop: 8,
          }}
        >
          {t("public.about.mission.intro")}
        </p>
      </div>

      <div
        className="mission-content about-mission-content"
        style={{ display: "flex", gap: 60, alignItems: "stretch" }}
      >
        {/* Mission + Vision cards */}
        <motion.div
          className="about-mission-card-stack"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.14,
              },
            },
          }}
          style={{
            flex: "0 0 600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 0,
            minHeight: 380,
          }}
        >
          {/* 01. Mission */}
          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                x: "-120%",
              },
              visible: {
                opacity: 1,
                x: "0%",
              },
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: "28px 32px",
            }}
          >
            <div className="bebas" style={{ fontSize: 20, marginBottom: 10 }}>
              {t("public.about.mission.heading")}
            </div>

            <p
              style={{
                fontSize: 15,
                color: "rgba(0,0,0,0.6)",
                lineHeight: 1.6,
              }}
            >
              {t("public.about.mission.body")}
            </p>
          </motion.div>

          {/* 02. Vision */}
          <motion.div
            variants={{
              hidden: {
                opacity: 0,
                x: "-120%",
              },
              visible: {
                opacity: 1,
                x: "0%",
              },
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              border: "1px solid rgba(0,0,0,0.22)",
              borderRadius: 18,
              padding: "28px 32px",
            }}
          >
            <div className="bebas" style={{ fontSize: 20, marginBottom: 10 }}>
              {t("public.about.mission.visionHeading")}
            </div>

            <p
              style={{
                fontSize: 16,
                color: "rgba(0,0,0,0.6)",
                lineHeight: 1.5,
              }}
            >
              {t("public.about.mission.visionBody")}
            </p>
          </motion.div>
        </motion.div>

        <JourneyCard />
      </div>
    </section>
  );
}

// ─── BLUE BANNER ─────────────────────────────────────────────────────────────
// function BlueBanner() {
//   return (
//     <section style={{
//       background: "linear-gradient(180deg,#025AE8 0%,#013282 100%)",
//       padding: "80px 86px",
//       position: "relative", overflow: "hidden"
//     }}>
//       <div style={{
//         position: "absolute", inset: 0,
//         backgroundImage: "url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1440&q=80')",
//         backgroundSize: "cover", backgroundPosition: "center",
//         opacity: 0.15
//       }} />
//       {/* content placeholder — in reality this section shows a tiled image layout */}
//       <div style={{ position: "relative", zIndex: 2, color: "#fff", textAlign: "center" }}>
//         <p style={{ fontSize: 16, opacity: .7, marginBottom: 8 }}>Our community in action</p>
//         <h2 className="bebas" style={{ fontSize: 48, lineHeight: 1.1 }}>United by the Ride,<br/>Driven by Passion</h2>
//       </div>
//     </section>
//   );
// }

// ─── VALUES ───────────────────────────────────────────────────────────────────
function ValuesSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const titleWords = useWordList("public.about.values.titleWords");
  const valueKeys = [
    "community",
    "excellence",
    "inclusivity",
    "achievement",
  ] as const;
  const values = valueKeys.map((key) => ({
    num: "//001",
    title: t(`public.about.values.items.${key}.title`),
    bg: key === "community" ? "#323232" : "#777777",
    text: t(`public.about.values.items.${key}.text`),
  }));
  return (
    <section
      className="about-section"
      style={{ background: "#EAF4FF", padding: "80px 86px" }}
    >
      <div
        className="about-values-head"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 40,
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Bebas Kai',sans-serif",
              fontSize: 15,
              fontWeight: 500,
              marginBottom: 8,
              color: "#000",
            }}
          >
            {t("public.about.values.eyebrow")}
          </p>
          <h2
            className="bebas about-values-title overflow-hidden"
            style={{
              fontSize: 50,
              lineHeight: 1.2,
              maxWidth: 480,
              textTransform: "capitalize",
            }}
          >
            <AnimatedWords words={titleWords} gap={12} />
          </h2>
        </div>
        <AnimatedButton onClick={() => navigate("/user-communities")}>
          {t("public.about.values.discoverCommunity")}
        </AnimatedButton>
      </div>
      <motion.div
        className="about-values-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.12,
            },
          },
        }}
        style={{ display: "flex", gap: 24 }}
      >
        {values.map((v, i) => (
          <motion.div
            key={i}
            className="value-card about-value-card"
            variants={{
              hidden: {
                opacity: 0,
                x: "120%",
              },
              visible: {
                opacity: 1,
                x: "0%",
              },
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              flex: 1,
              borderRadius: 12,
              padding: "24px 20px 28px",
              minHeight: 240,
              backdropFilter: "blur(15px)",
            }}
          >
            <div
              style={{
                fontFamily: "'Bebas Kai',sans-serif",
                fontSize: 17,
                fontWeight: 500,
                color: "#fff",
                marginBottom: 56,
              }}
            >
              {v.num}
            </div>

            <div
              className="bebas"
              style={{
                fontSize: 28,
                color: "#fff",
                marginBottom: 10,
              }}
            >
              {v.title}
            </div>

            <p
              style={{
                fontFamily: "'Bebas Kai',sans-serif",
                fontSize: 16,
                color: "#fff",
                lineHeight: 1.55,
                opacity: 0.9,
              }}
            >
              {v.text}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── COACHES ─────────────────────────────────────────────────────────────────
function CoachesSection() {
  const { t } = useTranslation();
  const titleWords = useWordList("public.about.coaches.titleWords");
  const cards = [
    { label: t("public.about.coaches.players"), img: "/img/image 2998.png" },
    { label: t("public.about.coaches.coaches"), img: "/img/image 2999.png" },
    { label: t("public.about.coaches.mechanics"), img: "/img/image 2997.png" },
  ];
  return (
    <section
      className="about-section about-coaches-section"
      style={{ background: "#EAF4FF", padding: "0 86px 80px" }}
    >
      <h2
        className="bebas about-coaches-title overflow-hidden"
        style={{
          fontSize: 50,
          lineHeight: 1.2,
          textAlign: "center",
          maxWidth: 640,
          margin: "0 auto 40px",
          textTransform: "capitalize",
        }}
      >
        <AnimatedWords words={titleWords} gap={12} />
      </h2>
      <div
        className="about-coaches-grid"
        style={{
          display: "flex",
          borderRadius: 16,
          overflow: "hidden",
          height: 488,
          background: "#fff",
        }}
      >
        {cards.map((c, i) => (
          // <div key={i} className="about-coach-card" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <motion.div
            key={i}
            className="about-coach-card adcc-image-group"
            initial={{ opacity: 0, x: 150 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.7,
              delay: i * 0.15,
              ease: "easeOut",
            }}
            viewport={{ once: true }}
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <AnimatedImage
              bare
              fill
              src={c.img}
              alt={c.label}
              style={{
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 180,
                background: "linear-gradient(360deg,#000 0%,transparent 100%)",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />
            <motion.div
              className="bebas about-coach-label"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: 0.3 + i * 0.15,
              }}
              viewport={{ once: true }}
              style={{
                position: "absolute",
                bottom: 24,
                left: 20,
                color: "#fff",
                fontSize: 26,
                lineHeight: 1,
                letterSpacing: 1,
                fontFamily: "'Bebas Kai',sans-serif",
                zIndex: 5,
                display: "block",
                opacity: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.55)",
                pointerEvents: "none",
              }}
            >
              {c.label}
            </motion.div>
          </motion.div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <AnimatedButton>{t("public.about.coaches.explore")}</AnimatedButton>
      </div>
    </section>
  );
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section
      className="about-cta"
      style={{ position: "relative", overflow: "hidden", height: 502 }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), url('/img/Rectangle 34625231.png')",
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
          className="bebas about-cta-title"
          style={{
            fontSize: 94,
            color: "#fff",
            lineHeight: 1,
            textTransform: "uppercase",
          }}
        >
          Start Your Ride Today
        </h2>
        {/* <p style={{ fontSize: 24, color: "#fff", marginTop: 16, marginBottom: 36, opacity: .95 }}> */}
        <p
          className="about-cta-text"
          style={{
            fontFamily: "'Bebas Kai',sans-serif",
            fontSize: 26,
            color: "#fff",
            marginTop: 16,
            marginBottom: 36,
            opacity: 0.95,
          }}
        >
          Download the ADCC app and join the cycling community.
        </p>
        <div className="about-cta-buttons" style={{ display: "flex", gap: 20 }}>
          {["Google Play", "App Store"].map((s) => (
            <button
              key={s}
              style={{
                background: "#fff",
                border: "none",
                borderRadius: 100,
                padding: "14px 32px",
                fontFamily: "'Bebas Kai',sans-serif",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {s === "Google Play" ? "▶" : ""} {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      className="about-section"
      style={{ background: "#EAF4FF", padding: "60px 86px 32px" }}
    >
      <div
        className="about-footer-main"
        style={{ display: "flex", gap: 64, marginBottom: 48 }}
      >
        {/* Brand */}
        <div className="about-footer-brand" style={{ flex: "0 0 340px" }}>
          <div style={{ marginBottom: 20 }}>
            <span className="bebas" style={{ fontSize: 26, letterSpacing: 2 }}>
              ABU◉DHABI
              <br />
              CYCLING CLUB
            </span>
          </div>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.6,
              color: "#000",
              maxWidth: 320,
              marginBottom: 24,
            }}
          >
            From weekend warriors to elite athletes, we unite cyclists who share
            a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          {/* email subscribe */}
          <div
            className="about-newsletter"
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
                fontSize: 16,
                fontFamily: "'Bebas Kai',sans-serif",
                outline: "none",
                color: "#333",
              }}
            />
            <button
              style={{
                background: "#019839",
                color: "#fff",
                border: "none",
                padding: "0 24px",
                fontFamily: "'Bebas Kai',sans-serif",
                fontSize: 16,
                cursor: "pointer",
                borderRadius: "0 8px 8px 0",
              }}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div
            className="bebas"
            style={{
              fontSize: 24,
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
            <p key={l} style={{ fontSize: 17, marginBottom: 10 }}>
              <a href="#" style={{ color: "#000", textDecoration: "none" }}>
                {l}
              </a>
            </p>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div
            className="bebas"
            style={{
              fontSize: 24,
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
                marginBottom: 14,
                alignItems: "flex-start",
              }}
            >
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span style={{ fontSize: 17, lineHeight: 1.4 }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="about-footer-bottom"
        style={{
          borderTop: "1px solid #D5D5D5",
          paddingTop: 24,
          textAlign: "center",
          position: "relative",
        }}
      >
        <p style={{ fontSize: 17, color: "rgba(0,0,0,0.7)" }}>
          Copyright 2026. Abu Dhabi Cycling Club
        </p>
        {/* scroll-to-top */}
        <button
          className="about-footer-top-button"
          style={{
            position: "absolute",
            right: 0,
            top: 16,
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

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function AboutUs() {
  return (
    <>
      <FontLoader />
      <div
        className="about-page"
        style={{ minWidth: 320, overflowX: "hidden" }}
      >
        <Hero />
        <StatsSection />
        <MissionSection />
        {/* <BlueBanner /> */}
        <ValuesSection />
        <CoachesSection />
      </div>
    </>
  );
}
