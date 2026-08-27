import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  CalendarDays,
  Flag,
  Gauge,
  ImageIcon,
  MapPin,
  Users,
} from "lucide-react";
import {
  CommunityApiResponse,
  getCommunityById,
} from "../../services/communitiesApi";
import { EventApiResponse, getEventsPage } from "../../services/eventsApi";
import { motion } from "framer-motion";
import { useWordList } from "../public/publicPageHelpers";
import { AnimatedButton } from "../ui/AnimatedButton";
import i18n from "../../i18n";

type CommunityTrack = {
  _id?: string;
  id?: string;
  title?: string;
  titleAr?: string;
  distance?: number;
  difficulty?: string;
  trackType?: string;
  category?: string;
  image?: string;
  city?: string;
  description?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const FALLBACK_COMMUNITY_IMAGE =
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1600&auto=format&fit=crop";
const FALLBACK_EVENT_IMAGE = "/img/Frame 2147226042.png";
const FALLBACK_TRACK_IMAGE = "/img/image 3049.png";

const resolveAsset = (image?: string) => {
  const trimmed = image?.trim() ?? "";
  if (!trimmed) return "";
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  return new URL(trimmed.replace(/^\/+/, ""), `${API_BASE_URL}/`).toString();
};

const getCommunityImage = (community?: CommunityApiResponse | null) =>
  resolveAsset(community?.image) ||
  resolveAsset(community?.gallery?.[0]) ||
  resolveAsset(community?.logo) ||
  FALLBACK_COMMUNITY_IMAGE;

const getId = (community?: CommunityApiResponse | null) =>
  community?._id || community?.id || "";

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatNumber = (value: unknown) => toNumber(value).toLocaleString();

const titleCase = (value?: string, fallback = "TBA") =>
  (value || fallback)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDate = (date?: string, naLabel = "Date TBA") => {
  if (!date) return naLabel;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return naLabel;
  return new Intl.DateTimeFormat(i18n.language, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const normalizeTracks = (community?: CommunityApiResponse | null): CommunityTrack[] => {
  const trackId = community?.trackId;
  if (!trackId) return [];
  const list = Array.isArray(trackId) ? trackId : [trackId];
  return list.filter(
    (track): track is CommunityTrack =>
      typeof track === "object" && track !== null && !!(track.title || track._id || track.id),
  );
};

function LoadingState() {
  const { t } = useTranslation();
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-4 py-16 text-center text-black sm:px-6 md:px-10 md:py-24">
      <p className="text-[18px] font-medium text-black/70 sm:text-[22px]">{t("public.communities.detail.loading")}</p>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-4 py-16 text-center text-black sm:px-6 md:px-10 md:py-24">
      <h1 className="text-[34px] font-black uppercase sm:text-[42px] md:text-[50px]">{t("public.communities.detail.communityDetailsHeading")}</h1>
      <p className="mt-4 text-[17px] font-medium text-black/70 sm:text-[20px]">{message}</p>
      <button
        type="button"
        onClick={() => navigate("/user-communities")}
        className="mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-[#019839] px-6 py-4 text-[16px] font-bold text-white sm:px-8 sm:text-[18px]"
      >
        <ArrowLeft size={20} /> {t("public.communities.detail.backToCommunities")}
      </button>
    </main>
  );
}

function HeroSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const tag = community.category || titleCase(Array.isArray(community.type) ? community.type[0] : community.type, t("public.communities.detail.tba"));
  const location = community.location || community.city || community.area || t("public.communities.detail.locationTBA");

  return (
    <section className="mx-auto max-w-[1272px] px-4 sm:px-6 md:px-10">
      <div
        className="relative h-[340px] overflow-hidden rounded-none bg-cover bg-center sm:h-[420px] md:h-[500px]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url('${getCommunityImage(
            community,
          )}')`,
        }}
      >
        <div className="absolute bottom-8 left-5 right-5 text-white sm:bottom-12 sm:left-8 md:bottom-20 md:left-10">
          <div className="mb-3 flex flex-wrap gap-2 sm:gap-3">
            <span className="rounded-full bg-white/30 px-4 py-2 text-[13px] backdrop-blur sm:px-5 sm:text-[16px]">{tag}</span>
            <span className="rounded-full bg-white/30 px-4 py-2 text-[13px] backdrop-blur sm:px-5 sm:text-[16px]">{location}</span>
          </div>
          <motion.h1
            className="max-w-[820px] text-[30px] font-black uppercase leading-tight sm:text-[36px] md:text-[40px] md:leading-none overflow-hidden"
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
            {community.title?.split(" ").map((word, index) => (
              <span
                key={index}
                className="inline-block overflow-hidden mr-3"
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
          </motion.h1>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const aboutHeadingWords = useWordList("public.communities.detail.about.headingWords");
  const tba = t("public.communities.detail.tba");
  const type = Array.isArray(community.type) ? community.type.join(", ") : community.type;

  return (
    <section className="mx-auto grid max-w-[1268px] grid-cols-1 items-start gap-8 px-4 py-14 sm:px-6 sm:py-16 md:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12 lg:py-24">
      <div>
        <motion.h2
          className="text-[34px] font-black uppercase leading-tight sm:text-[44px] md:text-[60px] md:leading-none overflow-hidden"
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
          {aboutHeadingWords.map((word, index) => (
            <span
              key={index}
              className="mr-3 inline-block overflow-hidden"
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
        <p className="mt-5 max-w-[820px] text-[17px] leading-[25px] sm:mt-8 sm:text-[20px] sm:leading-[28px] md:text-[24px] md:leading-[30px]">{community.description}</p>
        <motion.button
          initial={{ opacity: 0, x: -120 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#019839] px-6 py-4 text-[16px] font-bold text-white sm:w-auto sm:px-8 sm:text-[18px]"
        >
          <motion.span
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.15,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {t("public.communities.detail.about.joinButton")}
          </motion.span>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.25,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <ArrowRight size={20} />
          </motion.div>
        </motion.button>
      </div>

      <div className="rounded-2xl bg-[#435974] p-5 text-white sm:p-8">
        <h3 className="text-[24px] font-black uppercase sm:text-[28px]">{t("public.communities.detail.about.infoHeading")}</h3>
        <div className="mt-6 space-y-5 text-[16px] text-white/80 sm:mt-7 sm:text-[18px]">
          <p className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <span>{t("public.communities.detail.about.type")}</span>
            <b className="text-left text-white sm:text-right">{type || tba}</b>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <span>{t("public.communities.detail.about.category")}</span>
            <b className="text-left text-white sm:text-right">{community.category || tba}</b>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <span>{t("public.communities.detail.about.manager")}</span>
            <b className="text-left text-white sm:text-right">{community.manager || tba}</b>
          </p>
          <p className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
            <span>{t("public.communities.detail.about.founded")}</span>
            <b className="text-left text-white sm:text-right">{community.foundedYear || tba}</b>
          </p>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const tba = t("public.communities.detail.tba");
  const stats = [
    {
      icon: Users,
      value: formatNumber(community.memberCount ?? community.stats?.members),
      label: t("public.communities.detail.stats.activeMembers"),
    },
    {
      icon: CalendarDays,
      value: formatNumber(community.upcomingEventCount ?? community.eventsCount ?? community.stats?.upcomingEvents),
      label: t("public.communities.detail.stats.upcomingEvents"),
    },
    {
      icon: Bike,
      value: String(community.weeklyRides ?? community.stats?.weeklyRides ?? tba),
      label: t("public.communities.detail.stats.weeklyRides"),
    },
    {
      icon: Flag,
      value: String(community.ridesThisMonth ?? community.stats?.ridesThisMonth ?? tba),
      label: t("public.communities.detail.stats.ridesThisMonth"),
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.12,
          },
        },
      }}
      className="mx-4 mb-16 grid max-w-[1192px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 sm:mx-6 md:mx-10 md:grid-cols-2 lg:mx-auto lg:mb-24 lg:grid-cols-4"
    >
      {stats.map(({ icon: Icon, value, label }) => (
        <motion.article
          key={label}
          variants={{
            hidden: {
              opacity: 0,
              y: 120,
            },
            visible: {
              opacity: 1,
              y: 0,
            },
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="rounded-xl bg-[#435974] p-5 text-white sm:p-8"
        >
          <span className="inline-flex rounded-full bg-white p-3 text-[#019839] sm:p-4">
            <Icon size={25} />
          </span>

          <h3 className="mt-8 text-[25px] font-black uppercase sm:mt-12 sm:text-[30px] lg:mt-16">
            {value}
          </h3>

          <p className="text-[17px] text-white/60 sm:text-[20px]">
            {label}
          </p>
        </motion.article>
      ))}
    </motion.section>
  );
}

function LocationSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const headingWords = useWordList(
    "public.communities.detail.communityDetailsHeadingWords",
  );
  const details = [
    [t("public.communities.detail.location.location"), community.location],
    [t("public.communities.detail.location.city"), community.city],
    [t("public.communities.detail.location.area"), community.area],
    [t("public.communities.detail.location.country"), community.country],
    [t("public.communities.detail.location.purpose"), community.purposeType],
    [t("public.communities.detail.location.terrain"), community.terrain],
  ].filter(([, value]) => value);

  if (details.length === 0) return null;

  return (
    <section className="bg-[#d8ebff] px-4 py-14 sm:px-6 sm:py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-[1268px]">
        <motion.h2
          className="text-center text-[34px] font-black uppercase sm:text-[42px] md:text-[50px] overflow-hidden"
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
          {headingWords.map((word, index) => (
            <span
              key={index}
              className="mr-3 inline-block overflow-hidden"
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
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-3"
        >
          {details.map(([label, value]) => (
            <motion.div
              key={label}
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
              className="rounded-xl bg-white p-5 sm:p-7"
            >
              <p className="text-[16px] font-medium text-black/50">
                {label}
              </p>

              <h3 className="mt-3 text-[20px] font-black uppercase sm:text-[24px]">
                {value}
              </h3>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TracksSection({ tracks }: { tracks: CommunityTrack[] }) {
  const { t } = useTranslation();
  const headingWords = useWordList("public.communities.detail.tracks.headingWords");
  const tba = t("public.communities.detail.tba");
  if (tracks.length === 0) return null;

  return (
    <section className="bg-[#777] px-4 py-14 sm:px-6 sm:py-16 md:px-10 lg:py-24">
      <motion.h2
        className="mb-8 text-center text-[34px] font-black uppercase text-white sm:mb-12 sm:text-[42px] md:text-[50px] lg:mb-16 overflow-hidden"
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
        {headingWords.map((word, index) => (
          <span
            key={index}
            className="mr-3 inline-block overflow-hidden"
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
      <motion.div
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
        className="mx-auto grid max-w-[1240px] grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3 lg:gap-10"
      >
        {tracks.map((track, index) => (
          <motion.article
            key={track._id || track.id || track.title}
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
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`rounded-xl p-3 transition-colors duration-200 ${
              index === 0
                ? "bg-[#435974] text-white hover:bg-[#323232]"
                : "bg-white text-black hover:bg-[#323232] hover:text-white"
            }`}
          >
            <img
              src={resolveAsset(track.image) || FALLBACK_TRACK_IMAGE}
              alt={track.title || t("public.communities.detail.tracks.imageAlt")}
              className="h-[220px] w-full rounded-lg object-cover sm:h-[260px] lg:h-[300px]"
            />

            <div className="p-4">
              <p className="flex gap-2 text-sm opacity-80">
                <MapPin size={18} /> {track.city || t("public.communities.detail.locationTBA")}
              </p>

              <h3 className="mt-4 text-[22px] font-black uppercase sm:text-[26px]">
                {track.title || t("public.communities.detail.tracks.fallbackTitle")}
              </h3>

              <div className="mt-6 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
                {[
                  [
                    t("public.common.stats.distance"),
                    typeof track.distance === "number"
                      ? `${track.distance} km`
                      : tba,
                  ],
                  [t("public.communities.detail.about.type"), track.trackType || track.category || tba],
                  [t("public.common.stats.level"), titleCase(track.difficulty, tba)],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded border border-white/20 bg-[#323232] p-3 text-white"
                  >
                    <p className="text-[14px]">{label}</p>
                    <b className="text-[16px]">{value}</b>
                  </div>
                ))}
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

function EventCard({ event }: { event: EventApiResponse }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const image = event.mainImage || event.eventImage || event.galleryImages?.[0] || FALLBACK_EVENT_IMAGE;
  const participants = event.currentParticipants ?? event.registrations ?? 0;
  const formattedParticipants = Number(participants).toLocaleString(i18n.language);

  return (
    <article>
      <div className="relative h-[220px] overflow-hidden rounded-[14px] bg-white sm:h-[280px] lg:h-[360px]">
        <img src={image} alt={event.title} className="h-full w-full object-cover" />
        <span className="absolute right-4 top-4 rounded-full bg-black/40 px-4 py-2 text-[13px] text-white sm:right-6 sm:top-6 sm:px-6 sm:text-[16px]">
          {event.category || t("public.common.eventFallback")}
        </span>
      </div>
      <h3 className="event-card-title mt-5 text-[22px] font-black uppercase sm:mt-6 sm:text-[26px]">{event.title}</h3>
      <div className="mt-4 grid grid-cols-1 gap-y-3 text-[16px] text-black/70 sm:mt-5 sm:grid-cols-2 sm:text-[18px]">
        <p className="flex gap-2">
          <CalendarDays size={20} /> {formatDate(event.eventDate, t("public.common.dateTBA"))}
        </p>
        <p className="flex gap-2">
          <Gauge size={20} /> {typeof event.distance === "number" ? `${event.distance} km` : t("public.common.distanceTBA")}
        </p>
        <p className="flex gap-2">
          <Users size={20} /> {t("public.common.participants", { count: participants, formattedCount: formattedParticipants })}
        </p>
        <p className="flex gap-2">
          <MapPin size={20} /> {event.city || event.address || t("public.communities.detail.locationTBA")}
        </p>
      </div>
      <AnimatedButton
        variant="outline"
        size="sm"
        className="event-card-button mt-5 sm:mt-6"
        onClick={() => {
          const eventSlug = event.slug || event._id || event.id;
          if (eventSlug) {
            navigate(`/user-event/${encodeURIComponent(eventSlug)}`);
          }
        }}
      >
        {t("public.common.viewDetails")}
      </AnimatedButton>
    </article>
  );
}

function EventsSection({ events }: { events: EventApiResponse[] }) {
  const { t } = useTranslation();
  const headingWords = useWordList("public.communities.detail.events.headingWords");
  return (
    <section className="mx-auto max-w-[1269px] px-4 py-14 sm:px-6 sm:py-16 md:px-10 lg:py-28">
      <motion.h2
        className="mb-8 text-center text-[34px] font-black uppercase sm:mb-12 sm:text-[42px] md:text-[50px] lg:mb-16 overflow-hidden"
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
        {headingWords.map((word, index) => (
          <span
            key={index}
            className="mr-3 inline-block overflow-hidden"
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
      {events.length === 0 ? (
        <motion.p
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-center text-[17px] font-medium text-black/60 sm:text-[20px]"
        >
          {t("public.communities.detail.events.empty")}
        </motion.p>
      ) : (
        <motion.div
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
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {events.map((event) => (
            <motion.div
              key={event._id || event.id || event.title}
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
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <EventCard event={event} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}

function GallerySection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const images = (community.gallery || []).map(resolveAsset).filter(Boolean);
  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1268px] px-4 pb-16 sm:px-6 md:px-10 lg:pb-28">
      <h2 className="mb-8 text-center text-[34px] font-black uppercase sm:mb-12 sm:text-[42px] md:text-[50px]">{t("public.communities.detail.gallery.heading")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <div key={image} className="relative h-[220px] overflow-hidden rounded-xl bg-black/10 sm:h-[260px]">
            <img
              src={image}
              alt={t("public.communities.detail.gallery.imageAlt", {
                title: community.title,
                index: index + 1,
              })}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function UserCommunityDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<CommunityApiResponse | null>(null);
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCommunity = async () => {
      if (!id) {
        setError(t("public.communities.detail.errors.missingId"));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const selectedCommunity = await getCommunityById(decodeURIComponent(id));
        const communityId = getId(selectedCommunity);
        const eventPage = communityId
          ? await getEventsPage({ communityId, status: "Upcoming", page: 1, limit: 3 })
          : { events: [] };

        if (!cancelled) {
          setCommunity(selectedCommunity);
          setEvents(eventPage.events || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load community detail:", err);
          setCommunity(null);
          setEvents([]);
          setError(t("public.communities.detail.errors.loadFailed"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCommunity();

    return () => {
      cancelled = true;
    };
    // Re-fetch on language switch too — the API returns already-localized
    // text, so without this the titles stay in the old language until a
    // full page reload.
  }, [id, t, i18n.language]);

  const tracks = useMemo(() => normalizeTracks(community), [community]);

  if (loading) return <LoadingState />;
  if (error || !community) return <ErrorState message={error || t("public.communities.detail.notFound")} />;

  return (
    <main className="user-community-detail-page font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      <style>{`
        .user-community-detail-page .adcc-btn--arrow:hover .adcc-btn__arrow--enter,
        .user-community-detail-page .adcc-btn--arrow:focus-visible .adcc-btn__arrow--enter {
          inset-inline-start: calc(var(--adcc-btn-arrow-inset) - var(--adcc-btn-arrow-shift) + 15px);
        }
      `}</style>
      <div className="mx-auto max-w-[1272px] px-4 pb-5 sm:px-6 md:px-10 md:pb-6">
        <button
          type="button"
          onClick={() => navigate("/user-communities")}
          className="inline-flex items-center gap-2 text-[16px] font-bold text-[#019839] sm:text-[18px]"
        >
          <ArrowLeft size={20} /> {t("public.communities.detail.backToCommunities")}
        </button>
      </div>
      <HeroSection community={community} />
      <AboutSection community={community} />
      <StatsSection community={community} />
      <LocationSection community={community} />
      <TracksSection tracks={tracks} />
      <EventsSection events={events} />
      <GallerySection community={community} />
      <button className="fixed bottom-5 right-5 rounded-full bg-[#019839] p-3 text-white shadow-lg sm:bottom-10 sm:right-10 sm:p-4">
        <ImageIcon size={28} />
      </button>
    </main>
  );
}
