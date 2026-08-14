import { useEffect, useState } from "react";
import { Users, Clock, Trophy, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getChallengesPage,
  type Challenge,
} from "../../services/challengesApi";
import { motion } from "framer-motion";
import {
  AnimatedWords,
  PublicPageHero,
  useWordList,
} from "../public/publicPageHelpers";
import { Link } from "react-router-dom";

const PAGE_SIZE = 4;
const CHALLENGE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop";
const statusTabs: Array<Challenge["status"]> = [
  "Active",
  "Upcoming",
  "Completed",
];

const STATUS_TAB_KEYS: Record<Challenge["status"], string> = {
  Active: "active",
  Upcoming: "upcoming",
  Completed: "completed",
};

type FaqItem = { q: string; a: string };

const formatNumber = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, {
    notation: value >= 10000 ? "compact" : "standard",
  }).format(value);

export default function ChallengesPage() {
  const { t, i18n } = useTranslation();
  const heroTitleWords = useWordList("public.challenges.hero.titleWords");
  const heroBreadcrumb = useWordList("public.challenges.hero.breadcrumb");
  const introTitleWords = useWordList("public.challenges.intro.titleWords");
  const listTitleWords = useWordList("public.challenges.listTitleWords");
  const faqs = t("public.tracks.faq.items", {
    returnObjects: true,
  }) as FaqItem[];

  const [status, setStatus] = useState<Challenge["status"]>("Active");
  const [page, setPage] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState([
    { value: "0", labelKey: "riders", active: true },
    { value: "0", labelKey: "active" },
    { value: "0", labelKey: "upcoming" },
    { value: "0", labelKey: "completed" },
  ]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const getDaysText = (challenge: Challenge) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(challenge.endDate);
    endDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (endDate.getTime() - today.getTime()) / 86400000,
    );

    if (challenge.status === "Completed")
      return t("public.common.challengeDays.completed");
    if (!Number.isFinite(diffDays)) return t("public.common.dateTBA");
    if (diffDays < 0) return t("public.common.challengeDays.ended");
    if (diffDays === 0) return t("public.common.challengeDays.endsToday");
    return t("public.common.challengeDays.daysLeft", { count: diffDays });
  };

  const getChallengeDescription = (challenge: Challenge) => {
    if (challenge.description) return challenge.description;
    return t("public.challenges.descriptionFallback", {
      type: challenge.type,
      target: challenge.target,
      unit: challenge.unit,
    });
  };

  const getShowingText = () => {
    if (status === "Active") {
      return t("public.common.showingActiveChallenges", {
        count: totalResults,
      });
    }
    if (status === "Upcoming") {
      return t("public.challenges.showingUpcoming", { count: totalResults });
    }
    return t("public.challenges.showingCompleted", { count: totalResults });
  };

  const getEmptyText = () => {
    if (status === "Active") return t("public.challenges.noActive");
    if (status === "Upcoming") return t("public.challenges.noUpcoming");
    return t("public.challenges.noCompleted");
  };

  useEffect(() => {
    let mounted = true;

    const loadChallenges = async () => {
      try {
        setLoading(true);
        setLoadError(false);
        const response = await getChallengesPage({
          status,
          page,
          limit: PAGE_SIZE,
        });

        if (mounted) {
          const newChallenges = response.challenges;
          const serverPages = response.pagination.pages || 1;
          const calculatedPages = Math.ceil(response.pagination.total / PAGE_SIZE) || 1;
          const computedPages = Math.max(1, Math.min(serverPages, calculatedPages));

          setChallenges(newChallenges);
          setTotalResults(response.pagination.total);
          setTotalPages(computedPages);

          if (newChallenges.length === 0 && page > 1) {
            setPage(1);
          }
        }
      } catch (err) {
        console.error("Failed to load public challenges:", err);
        if (mounted) {
          setChallenges([]);
          setTotalResults(0);
          setTotalPages(1);
          setLoadError(true);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChallenges();

    return () => {
      mounted = false;
    };
  }, [status, page]);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const [active, upcoming, completed, publicChallenges] =
          await Promise.all([
            getChallengesPage({ status: "Active", page: 1, limit: 1 }),
            getChallengesPage({ status: "Upcoming", page: 1, limit: 1 }),
            getChallengesPage({ status: "Completed", page: 1, limit: 1 }),
            getChallengesPage({ page: 1, limit: 100 }),
          ]);
        const riders = publicChallenges.challenges.reduce(
          (sum, challenge) => sum + (challenge.participants || 0),
          0,
        );

        if (mounted) {
          setStats([
            {
              value: formatNumber(riders, i18n.language),
              labelKey: "riders",
              active: true,
            },
            {
              value: formatNumber(active.pagination.total, i18n.language),
              labelKey: "active",
            },
            {
              value: formatNumber(upcoming.pagination.total, i18n.language),
              labelKey: "upcoming",
            },
            {
              value: formatNumber(completed.pagination.total, i18n.language),
              labelKey: "completed",
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to load challenge stats:", err);
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [i18n.language]);

  useEffect(() => {
    setOpenFaq(null);
  }, [i18n.language]);

  return (
    <div className="challenges-page min-h-screen overflow-x-hidden bg-[#eaf4ff] text-black">
      <style>{`

.font-satoshi, h3.font-satoshi{
font-family: 'Satoshi', sans-serif !important;
}

.font-bebas{
    font-family: var(--font-bebas-kai) !important;
    font-weight: 500;
    line-height: 1;
  }

.justify-center{
justify-content: center !important;}


        .challenges-page {
          width: 100%;
          max-width: 100vw;
          overflow-x: clip;
        }
        .challenges-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
        .challenges-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
          inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
        }
        @media (max-width: 768px) {
          .challenges-page-hero {
            height: 320px !important;
          }
          .challenges-page-hero-content {
            bottom: 40px !important;
            inset-inline-start: 16px !important;
          }
          .challenges-page-hero-title {
            font-size: 38px !important;
          }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .challenges-page-hero {
            height: 440px !important;
          }
        }
      `}</style>

      <PublicPageHero
        titleWords={heroTitleWords}
        breadcrumb={heroBreadcrumb}
        backgroundImage="/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png"
        classPrefix="challenges-page"
      />

      <section className="grid w-full grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:grid-cols-2 lg:gap-12 lg:px-16 lg:py-28 xl:px-20 2xl:px-24">
        <div>
          <AnimatedWords
            words={introTitleWords}
            gap={12}
            className="font-bebas max-w-[500px] text-[32px] font-black uppercase leading-tight sm:text-[38px] lg:text-[52px]"
          />
          <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed sm:mt-8 sm:text-[17px]">
            {t("public.challenges.intro.body")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((item, index) => (
            <motion.div
              key={item.labelKey}
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              className="
        rounded-xl border border-[#d7e3ef]
        bg-[#edf6ff]
        p-5 sm:p-6 lg:p-8
        transition-all duration-300
        hover:bg-[#435974]
        hover:text-white
        cursor-pointer
      "
            >
              <div className="flex items-center gap-4">
                <Users size={32} className="shrink-0" />

                <div>
                  <h3 className="font-satoshi text-[24px] font-black sm:text-[28px]">
                    {item.value}
                  </h3>

                  <p className="mt-1 text-[14px] sm:text-[16px]">
                    {t(`public.challenges.stats.${item.labelKey}`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <motion.video
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{ once: true }}
          className="h-[220px] w-full rounded-xl object-cover sm:h-[400px] lg:h-[550px]"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/img/videos/video.mp4" type="video/mp4" />
          {t("public.challenges.listing.videoFallback")}
        </motion.video>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center lg:mb-14">
          <AnimatedWords
            words={listTitleWords}
            gap={16}
            className="font-bebas text-[30px] font-black uppercase sm:text-[42px]"
          />
          <motion.div
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
            className="flex gap-2 sm:gap-3 md:gap-5 grid-new"
          >
            {statusTabs.map((tab) => {
              const selected = status === tab;

              return (
                <span
                  key={tab}
                  className="inline-block overflow-hidden rounded-full"
                >
                  <motion.button
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
                    onClick={() => {
                      setStatus(tab);
                      setPage(1);
                    }}
                    className={`rounded-full px-5 py-3 text-[15px] sm:px-6 md:px-8 lg:px-14 lg:py-4 lg:text-[16px] ${
                      selected
                        ? "bg-[#00a84f] font-bold text-white"
                        : "border border-[#cad8e6] text-[#6f7f8f]"
                    }`}
                  >
                    {t(`public.challenges.tabs.${STATUS_TAB_KEYS[tab]}`)}
                  </motion.button>
                </span>
              );
            })}
          </motion.div>
        </div>

        <p className="mb-6 text-[15px] font-medium">
          {loading ? t("public.common.loadingChallenges") : getShowingText()}
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {challenges.map((item) => (
            <div
              key={item.id}
              className="group challenge-card overflow-hidden rounded-xl border border-[#cad8e6] bg-[#eef7ff] transition-all duration-300 hover:bg-[#435974] hover:text-white"
            >
              <div className="adcc-image overflow-hidden">
                <img
                  className="adcc-image__img h-[220px] w-full object-cover sm:h-[280px] lg:h-[330px]"
                  src={item.image || CHALLENGE_FALLBACK_IMAGE}
                  alt={item.title}
                />
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <h3 className="text-[21px]  uppercase sm:text-[24px]">
                  {item.title}
                </h3>

                <p className="mt-2 text-[15px]">
                  {getChallengeDescription(item)}
                </p>

                <div className="mt-6 flex flex-col gap-5 rounded-md bg-[#89a2bf] px-4 py-5 text-white transition-all duration-300 group-hover:bg-[#435974] sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="space-y-2 text-[15px]">
                    <p className="flex items-center gap-2">
                      <Clock size={16} /> {getDaysText(item)}
                    </p>

                    <p className="flex items-center gap-2">
                      <Users size={16} />{" "}
                      {t("public.common.participants", {
                        count: item.participants ?? 0,
                        formattedCount: formatNumber(
                          item.participants ?? 0,
                          i18n.language,
                        ),
                      })}
                    </p>

                    <p className="flex items-center gap-2">
                      <Trophy size={16} /> {item.target} {item.unit}
                    </p>
                  </div>

                  <Link
                    to={`/user-challenges/${encodeURIComponent(item.id)}`}
                    className="rounded-full border border-white px-5 py-3 text-[13px] font-semibold sm:px-6"
                  >
                    {t("public.common.joinChallenge")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && loadError && (
          <p className="pt-8 text-[16px] font-medium text-red-700">
            {t("public.common.loadErrorChallenges")}
          </p>
        )}

        {!loading && !loadError && challenges.length === 0 && (
          <p className="pt-8 text-[16px] text-black/70">{getEmptyText()}</p>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-[#cad8e6] px-4 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3 sm:text-[14px]"
            >
              {t("public.common.prev")}
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (item) =>
                  item === 1 ||
                  item === totalPages ||
                  Math.abs(item - page) <= 1,
              )
              .map((item, index, visiblePages) => (
                <span key={item} className="flex items-center gap-2 sm:gap-3">
                  {index > 0 && item - visiblePages[index - 1] > 1 && (
                    <span className="text-[#00a84f]">...</span>
                  )}
                  <button
                    onClick={() => setPage(item)}
                    className={`h-10 w-10 rounded-full text-[14px] font-semibold sm:h-11 sm:w-11 sm:text-[15px] ${
                      page === item
                        ? "bg-[#00a84f] text-white"
                        : "text-[#00a84f]"
                    }`}
                  >
                    {item}
                  </button>
                </span>
              ))}
            <button
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              className="rounded-full border border-[#cad8e6] px-4 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3 sm:text-[14px]"
            >
              {t("public.common.next")}
            </button>
          </div>
        )}
      </section>

      <section className="w-full px-4 pb-16 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <AnimatedWords
          words={t("public.tracks.faq.title").split(/\s+/).filter(Boolean)}
          gap={12}
          className="font-bebas justify-center text-[34px] font-black uppercase sm:text-[42px] lg:text-[50px]"
        />
        <p className="mt-4 text-[16px]">{t("public.tracks.faq.subtitle")}</p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-5"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
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
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
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
                  transition={{ duration: 0.35 }}
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
