import { useEffect, useMemo, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  CalendarDays,
  Cross,
  Droplets,
  Heart,
  MapPin,
  ParkingCircle,
  Plus,
  Share2,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { EventApiResponse, getEventById, getEventsPage } from "../../services/eventsApi";

type TFunction = (key: string, options?: Record<string, unknown>) => string;

type StatCard = {
  icon: LucideIcon;
  title: string;
  label: string;
};

type Facility = {
  title: string;
  icon: LucideIcon;
  active?: boolean;
};

type ScheduleItem = {
  time: string;
  title: string;
  description: string;
};

type EventEligibility =
  | {
      experienceLevel?: string;
      experinceLevel?: string;
      helmetRequired?: boolean;
      roadBikeOnly?: boolean;
      gender?: string;
    }
  | Array<{
      experienceLevel?: string;
      experinceLevel?: string;
      helmetRequired?: boolean;
      roadBikeOnly?: boolean;
      gender?: string;
    }>;

type GrandPrixEvent = EventApiResponse & {
  eligibility?: EventEligibility;
};

const TARGET_EVENT_TITLE = "Abu Dhabi Grand Prix Ride";
const TARGET_EVENT_SLUG = "abu-dhabi-grand-prix-ride";
const FALLBACK_HERO_IMAGE = "/img/pexels-ander-garcia-1317358711-25016478 1.png";
const SCHEDULE_IMAGE = "/img/505801846.png";

const FALLBACK_EVENT: GrandPrixEvent = {
  id: TARGET_EVENT_SLUG,
  slug: TARGET_EVENT_SLUG,
  title: TARGET_EVENT_TITLE,
  description:
    "Join us for an unforgettable cycling experience in Abu Dhabi. This advanced event is for riders wanting a challenge while enjoying fellow enthusiasts. The route covers 42 km of paths showcasing the UAE's best. Compete or enjoy the ride; it promises to be exceptional.",
  mainImage: FALLBACK_HERO_IMAGE,
  eventDate: "2026-03-15",
  eventTime: "7:00 AM",
  endTime: "11:00 AM",
  address: "Yas Marina Circuit",
  city: "Abu Dhabi",
  country: "United Arab Emirates",
  maxParticipants: 200,
  currentParticipants: 156,
  registrationFeeType: "free",
  registrationFeeAmount: 0,
  status: "Open",
  difficulty: "Advanced",
  distance: 42,
  category: "Race",
  rewards: { points: 0, badgeName: "" },
  galleryImages: [],
  amenities: ["Water Stations", "Medical Support", "Bike Repair", "Restrooms", "Parking"],
  schedule: [
    { time: "6:00 AM", title: "Registration Opens", description: "Check-in and collect your race packet", order: 1 },
    { time: "7:00 AM", title: "Event Start", description: "The ride begins!", order: 2 },
    { time: "11:00 AM", title: "Awards Ceremony", description: "Celebration and prizes", order: 3 },
  ],
};

const formatDate = (date: string | undefined, t: TFunction) => {
  if (!date) return t("public.common.dateTBA");
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return t("public.common.dateTBA");
  return new Intl.DateTimeFormat(i18n.language, {
    month: "short",
    day: "numeric",
  }).format(parsed);
};

const formatFee = (event: GrandPrixEvent | null | undefined, t: TFunction) => {
  if (!event) return t("public.events.detail.register.loading");
  if (event.registrationFeeType !== "paid") return t("public.events.detail.register.free");
  const amount = event.registrationFeeAmount ?? 0;
  return amount > 0 ? `AED ${amount}` : t("public.events.detail.register.paid");
};

const getImage = (event?: GrandPrixEvent | null) =>
  event?.mainImage || event?.eventImage || event?.galleryImages?.[0] || FALLBACK_HERO_IMAGE;

const getParticipants = (event?: GrandPrixEvent | null) =>
  event?.currentParticipants ?? event?.registrations ?? 0;

const getLevel = (event: GrandPrixEvent | null | undefined, t: TFunction) => {
  if (!event) return "Level TBA";
  if (event.difficulty) return event.difficulty;
  const eligibility = Array.isArray(event.eligibility)
    ? event.eligibility[0]
    : event.eligibility;
  return (
    eligibility?.experienceLevel ||
    eligibility?.experinceLevel ||
    t("public.common.filters.allLevels")
  );
};

// `city` is always dashboard-translated (see backend localizeEventStatic); `address`
// is free text that may not have an Arabic version filled in for a given event, so
// prefer the guaranteed-localized city when the UI is in Arabic.
const getLocalizedLocation = (event: GrandPrixEvent | null | undefined, fallback: string) => {
  if (!event) return fallback;
  const preferCity = i18n.language?.startsWith("ar");
  return (preferCity ? event.city || event.address : event.address || event.city) || fallback;
};

const titleCase = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStats = (event: GrandPrixEvent | null | undefined, t: TFunction): StatCard[] => [
  {
    icon: CalendarDays,
    title: formatDate(event?.eventDate, t),
    label: t("public.events.detail.stats.date"),
  },
  {
    icon: MapPin,
    title:
      typeof event?.distance === "number"
        ? `${event.distance} km`
        : t("public.common.distanceTBA"),
    label: t("public.tracks.detail.distance"),
  },
  {
    icon: Users,
    title: t("public.events.detail.stats.ridersCount", { count: getParticipants(event) }),
    label: t("public.events.detail.stats.participantsLabel"),
  },
  {
    icon: Trophy,
    title: titleCase(getLevel(event, t)),
    label: t("public.tracks.detail.level"),
  },
];

const facilityIconMap: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /water|drink|hydration/i, icon: Droplets },
  { match: /medical|aid|health|ambulance/i, icon: Cross },
  { match: /repair|bike|mechanic|workshop/i, icon: Wrench },
  { match: /parking/i, icon: ParkingCircle },
  { match: /restroom|toilet|washroom/i, icon: Users },
];

const getFacilityIcon = (title: string) =>
  facilityIconMap.find(({ match }) => match.test(title))?.icon || Bike;

const getFacilities = (event?: GrandPrixEvent | null): Facility[] =>
  (event?.amenities || []).map((title, index) => ({
    title: titleCase(title),
    icon: getFacilityIcon(title),
    active: index === 0,
  }));

const getSchedule = (event: GrandPrixEvent | null | undefined, t: TFunction): ScheduleItem[] => {
  const eventSchedule = event?.schedule || [];
  if (eventSchedule.length > 0) {
    return [...eventSchedule]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => ({
        time: item.time,
        title: item.title,
        description: item.description || "",
      }));
  }

  if (!event) return [];

  return [
    {
      time: event.eventTime || t("public.events.detail.schedule.timeTBA"),
      title: t("public.events.detail.schedule.eventStart"),
      description: getLocalizedLocation(event, t("public.events.detail.schedule.locationTBA")),
    },
    ...(event.endTime
      ? [
          {
            time: event.endTime,
            title: t("public.events.detail.schedule.eventEnd"),
            description: event.status
              ? t("public.events.detail.schedule.currentStatus", {
                  status: titleCase(event.status),
                })
              : "",
          },
        ]
      : []),
  ];
};

const getFaqs = (event: GrandPrixEvent | null | undefined, t: TFunction) => {
  if (!event) return [];
  const fee = formatFee(event, t);
  const level = titleCase(getLevel(event, t));
  const location = event.city || event.address || t("public.events.detail.faq.locationFallback");
  return [
    t("public.events.detail.faq.whenScheduled", { title: event.title }),
    t("public.events.detail.faq.whereTakingPlace", { title: event.title }),
    t("public.events.detail.faq.riderLevel", { level }),
    t("public.events.detail.faq.registrationFee", {
      fee: fee.toLowerCase(),
      title: event.title,
    }),
    t("public.events.detail.faq.howManyRiders", { title: event.title }),
    t("public.events.detail.faq.whatToKnow", { location }),
  ];
};

const FontLoader = () => (
  <style>{`
    .grand-prix-page {
      --green: #019839;
      --blue-gray: #435974;
      --dark: #323232;
      width: 100%;
      overflow-x: hidden;
      overflow-y: visible;
      background: #EAF4FF;
      color: #000;
      font-family: 'Outfit', sans-serif;
    }

    .grand-prix-page p,
    .grand-prix-page button,
    .grand-prix-page input,
    .grand-prix-page textarea,
    .grand-prix-page li,
    .grand-prix-page time,
    .grand-prix-page label,
    .grand-prix-page span:not(.grand-prix-bebas) {
      font-family: 'Outfit', sans-serif;
    }

    .grand-prix-page * {
      box-sizing: border-box;
    }

    .grand-prix-bebas {
      font-family: 'Bebas Kai', sans-serif;
      font-weight: 400;
      letter-spacing: 0;
    }

    .grand-prix-shell {
      width: min(1268px, calc(100vw - 24px));
      margin: 0 auto;
    }
    @media (min-width: 768px) {
      .grand-prix-shell {
        width: min(1268px, calc(100vw - 48px));
      }
    }

    .public-layout-content > div.grand-prix-page > section.grand-prix-section {
      display: block !important;
    }

    /* Facility scrollbar */
    .facility-scroll::-webkit-scrollbar { display: none; }
    .facility-scroll { scrollbar-width: none; }

    /* FAQ font */
    .grand-prix-faq-item {
      font-family: 'Outfit', 'Satoshi', sans-serif;
    }

    @media (max-width: 640px) {
      .grand-prix-hero { height: 100vh !important; min-height: 420px !important; }
    }
    @media (min-width: 641px) and (max-width: 1023px) {
      .grand-prix-hero { height: 100vh !important; min-height: 460px !important; }
    }
  `}</style>
);

function HeroSection({ event }: { event: GrandPrixEvent }) {
  const tags = [event.category, event.city].filter(Boolean);

  return (
    <section className="grand-prix-hero public-hero-bleed relative w-full overflow-hidden" style={{ height: "100vh", minHeight: 480 }}>
      <img
        src={getImage(event)}
        alt={event.title}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
      <div className="public-hero-content-pos">
        <div className="mb-3 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/30 px-5 py-2 text-[14px] font-medium text-white backdrop-blur sm:text-[16px]"
            >
              {tag}
            </span>
          ))}
        </div>
        <h1 className="grand-prix-bebas text-[34px] uppercase leading-tight text-white sm:text-[44px] lg:text-[52px]">
          {event.title}
        </h1>
      </div>
    </section>
  );
}

function AboutSection({ event }: { event: GrandPrixEvent }) {
  const { t } = useTranslation();
  return (
    <section className="grand-prix-section px-4 pt-[103px] max-md:pt-14 max-sm:pt-10 text-center">
      <h2 className="grand-prix-bebas text-[28px] uppercase leading-tight sm:text-[38px] md:text-[48px] lg:text-[60px]">
        {t("public.events.detail.aboutHeading")}
      </h2>
      <p className="mx-auto mt-4 max-w-[851px] text-[14px] font-normal leading-relaxed text-black sm:text-[17px] md:text-[20px] lg:text-[24px]">
        {event.description}
      </p>
      <Link
        to="/contact-us"
        className="mt-5 inline-flex h-[44px] items-center justify-center gap-3 rounded-full bg-[#019839] px-6 text-[16px] font-bold leading-none text-white transition hover:bg-[#017a2e] sm:h-[49px] sm:px-[28px] sm:text-[18px]"
      >
        {t("public.events.detail.joinEvent")}
        <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
      </Link>
    </section>
  );
}

function RegisterCard({ event }: { event: GrandPrixEvent }) {
  const { t } = useTranslation();
  const total = event.maxParticipants ?? 0;
  const joined = getParticipants(event);
  const spotsText =
    total > 0
      ? t("public.events.detail.register.spotsAvailable", {
          count: Math.max(total - joined, 0),
        })
      : t("public.events.detail.register.openRegistration");

  return (
    <article className="relative h-[200px] w-[300px] shrink-0 rounded-2xl bg-[#435974] text-white lg:h-[236px] lg:w-[426px] max-sm:w-[calc(100vw-56px)]">
      <p className="absolute left-4 top-[14px] flex items-center gap-[6px] text-[12px] font-medium leading-[18px] lg:left-6 lg:top-[19px] lg:text-[14px]">
        <span className="h-[7px] w-[7px] rounded-full bg-white" />
        {t("public.events.detail.register.registerNow")}
      </p>

      <h3 className="grand-prix-bebas absolute left-4 top-[44px] text-[28px] uppercase leading-tight lg:left-6 lg:top-[56px] lg:text-[36px]">
        {formatFee(event, t)}
      </h3>
      <p className="absolute left-4 top-[78px] text-[11px] leading-5 text-white/60 lg:left-6 lg:top-[96px] lg:text-[12px]">
        {spotsText}
      </p>

      <div className="absolute bottom-[12px] left-4 right-4 h-[60px] border-t border-white/10 lg:bottom-[14px] lg:left-6 lg:right-6 lg:h-[71px]">
        <span className="absolute left-[10px] top-[24px] flex items-center gap-[6px] text-[11px] font-medium leading-5 lg:left-[13px] lg:top-[31px] lg:text-[13px]">
          <span className="h-[7px] w-[7px] rounded-full bg-white" />
          {t("public.events.detail.register.organizedBy")}
        </span>
        <div className="absolute right-0 top-[12px] flex h-9 items-center gap-2 lg:h-10 lg:top-[17px]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#019839] lg:h-10 lg:w-10">
            <Bike className="h-[14px] w-[14px] lg:h-4 lg:w-4" />
          </span>
          <b className="grand-prix-bebas text-[24px] leading-tight lg:text-[30px]">ADCC</b>
        </div>
      </div>

      <button
        type="button"
        aria-label={t("public.events.detail.register.saveEvent")}
        className="absolute right-4 top-[14px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white text-[#C12D32] lg:right-5 lg:top-4 lg:h-[38px] lg:w-[38px]"
      >
        <Heart className="h-3 w-3 lg:h-4 lg:w-4" />
      </button>
      <button
        type="button"
        aria-label={t("public.events.detail.register.shareEvent")}
        className="absolute right-4 top-[54px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-white text-[#019839] lg:right-5 lg:top-[56px] lg:h-[38px] lg:w-[38px]"
      >
        <Share2 className="h-3 w-3 lg:h-4 lg:w-4" />
      </button>
    </article>
  );
}

function StatsStrip({ event, stats }: { event: GrandPrixEvent; stats: StatCard[] }) {
  return (
    <section className="grand-prix-section mx-auto mt-10 max-w-[1192px] overflow-x-auto rounded-2xl bg-[#A2BFDB] p-3 lg:mt-[60px] lg:overflow-visible">
      <div className="flex w-max gap-2 lg:gap-3">
        <RegisterCard event={event} />
        {stats.map(({ icon: Icon, title, label }) => (
          <article
            key={title}
            className="relative h-[200px] w-[140px] shrink-0 overflow-hidden rounded-[10px] bg-[#435974] text-white lg:h-[236px] lg:w-[171px]"
          >
            <span className="absolute left-4 top-4 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white text-[#019839] lg:h-[50px] lg:w-[50px] lg:left-5 lg:top-5">
              <Icon className="h-[18px] w-[18px] lg:h-[25px] lg:w-[25px]" />
            </span>
            <h3 className="grand-prix-bebas absolute left-4 top-[125px] whitespace-nowrap text-[22px] uppercase leading-tight lg:left-5 lg:top-[155px] lg:text-[30px]">
              {title}
            </h3>
            <p className="absolute left-4 top-[152px] text-[14px] leading-5 text-white/60 lg:left-5 lg:top-[191px] lg:text-[18px]">
              {label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FacilitiesSection({ facilities }: { facilities: Facility[] }) {
  const { t } = useTranslation();
  if (facilities.length === 0) return null;

  return (
    <section
        className="grand-prix-section mt-[130px] max-md:mt-16 max-sm:mt-10 bg-cover bg-center bg-no-repeat py-16 text-white"
      style={{ backgroundImage: "url('/img/image 3518.png')" }}
    >
      {/* <div className="grand-prix-shell relative h-full"> */}
      {/* <div className="grand-prix-shell relative "> */}
      <div className="grand-prix-shell relative">
        <div className="flex items-start justify-between pt-16 max-lg:flex-col max-lg:gap-8 max-lg:pt-0">
          <h2 className="grand-prix-bebas max-w-[579px] text-[32px] uppercase leading-tight text-[#000000] sm:text-[38px] lg:text-[44px]">
            {t("public.tracks.detail.facilitiesHeading")}
          </h2>
          <Link
            to="/contact-us"
            className="mt-[35px] inline-flex h-[50px] items-center justify-center gap-[14px] rounded-full bg-[#019839] px-[27px] text-[18px] font-bold leading-none text-white transition hover:bg-[#017a2e] max-lg:mt-0"
          >
            {t("public.common.getInTouch")}
            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
          </Link>
        </div>

      </div>

      <div
        className="facility-scroll mt-[42px] flex gap-3 overflow-x-auto pl-3 sm:gap-5 md:pl-6 lg:pl-[max(1.5rem,calc((100vw-1268px)/2))]"
        style={{
          maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)",
        }}
      >
        {facilities.map(({ title, icon: Icon }) => (
          <article
            key={title}
            className="group relative h-[70px] w-[170px] shrink-0 cursor-pointer rounded-[10px] bg-[#76767666] text-white transition-colors duration-200 hover:bg-white hover:text-[#333] sm:h-[97px] sm:w-[260px]"
          >
            <span className="absolute left-[14px] top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-[8px] bg-white text-[#333] transition-colors duration-200 group-hover:bg-[#019839] group-hover:text-white sm:left-[19px] sm:top-5 sm:h-[50px] sm:w-[50px] sm:translate-y-0 sm:rounded-[10px]">
              <Icon className="h-[18px] w-[18px] sm:h-[26px] sm:w-[26px]" />
            </span>
            <b className="absolute left-[60px] top-1/2 flex h-[36px] max-w-[100px] -translate-y-1/2 items-center text-[13px] font-bold leading-[16px] sm:left-[86px] sm:top-5 sm:h-[50px] sm:max-w-[130px] sm:translate-y-0 sm:text-[20px] sm:leading-[22px]">
              {title}
            </b>
            <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-b-[10px] bg-transparent transition-colors duration-200 group-hover:bg-[#019839] sm:h-[4px]" />
          </article>
        ))}
        <div className="shrink-0 w-4" aria-hidden />
      </div>
    </section>
  );
}

function ScheduleSection({
  event,
  schedule,
}: {
  event: GrandPrixEvent;
  schedule: ScheduleItem[];
}) {
  const { t } = useTranslation();
  if (schedule.length === 0) return null;

  return (
    <section
      id="grand-prix-schedule"
      className="grand-prix-section relative z-10 block w-full bg-[#323232] pb-[78px] pt-[69px] text-white max-md:pb-12 max-md:pt-10"
    >
      <h2 className="grand-prix-bebas mx-auto max-w-[621px] text-center text-[26px] uppercase leading-tight sm:text-[34px] md:text-[42px] lg:text-[50px]">
        {t("public.events.detail.schedule.titleSuffix", { title: event.title })}
      </h2>

      <p className="mx-auto mb-8 mt-3 max-w-[795px] text-center text-[13px] leading-relaxed text-white/70 sm:text-[16px] md:text-[18px] lg:text-[22px] lg:mb-[45px] lg:mt-[22px]">
        {getLocalizedLocation(event, t("public.events.detail.schedule.subtitleFallback"))}
      </p>

      {/* <div className="grand-prix-shell mt-[45px] grid grid-cols-[460px_736px] gap-[53px] max-lg:grid-cols-1"> */}
      <div className="grand-prix-shell mt-[45px] grid grid-cols-1 gap-[53px] lg:grid-cols-[460px_minmax(0,1fr)]">
        <div className="relative h-[478px] w-full max-w-[460px] max-lg:mx-auto">
          <div className="absolute bottom-0 left-0 h-[254px] w-full rounded-tl-xl rounded-br-xl rounded-tr-[60px] rounded-bl-[60px] bg-[#435974]" />

          <img
            src={event.galleryImages?.[1] || SCHEDULE_IMAGE}
            alt={t("public.events.detail.schedule.participantAlt", { title: event.title })}
            className="absolute bottom-0 left-[41px] h-[478px] w-[377px] object-contain"
          />

          <div className="absolute start-[60px] top-[265px] z-20 flex items-center">
            {[
              "/img/Ellipse 2 (1).png",
              "/img/Ellipse 3 (1).png",
              "/img/Ellipse 4 (1).png",
              "/img/Ellipse 5 (1).png",
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt={t("public.events.detail.schedule.riderAlt")}
                className="-ms-[29.16px] h-[58.33px] w-[58.33px] rounded-full border-2 border-white object-cover first:ms-0"
              />
            ))}

            <div className="-ms-[29.16px] flex h-[58.33px] w-[58.33px] items-center justify-center rounded-full bg-white font-sans text-[20.83px] font-normal uppercase leading-[27px] text-black">
              +12k
            </div>
          </div>
        </div>

        {/* <div className="space-y-[16px]"> */}
        {/* <div className="w-[736px] space-y-[16px] max-lg:w-full"> */}
        <div className="w-full min-w-0 space-y-[16px]">
          {schedule.map((item, index) => (
            <article
              key={`${item.time}-${item.title}-${index}`}
              className={`grid min-h-[98px] w-full grid-cols-[168px_1fr] items-center rounded-[11.91px] px-[19px] text-white max-lg:w-full max-sm:h-auto max-sm:grid-cols-1 max-sm:gap-2 max-sm:py-5 ${
              // className={`grid min-h-[98px] grid-cols-[149px_1fr] items-center rounded-[12px] px-[19px] text-white max-sm:grid-cols-1 max-sm:gap-2 max-sm:py-5 ${
                index === 0 ? "bg-[#435974]" : "bg-[#7891AF]"
              }`}
            >
              <time className="text-[13px] font-normal leading-snug sm:text-[16px] md:text-[18px]">
                {item.time}
              </time>

              <div>
                <h3 className="text-[15px] font-normal leading-snug sm:text-[18px] md:text-[22px]">
                  {item.title}
                </h3>

                <p className="mt-1 text-[13px] leading-snug text-white/70 sm:text-[15px] md:text-[17px]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ faqs }: { faqs: string[] }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section className="grand-prix-section px-4 pb-16 pt-14 text-center sm:pb-20 sm:pt-16 lg:pb-28 lg:pt-20">
      <h2 className="grand-prix-bebas text-[34px] uppercase leading-tight sm:text-[42px] lg:text-[50px]">
        {t("public.tracks.faq.title")}
      </h2>
      <p className="mx-auto mt-3 max-w-[563px] text-[15px] font-medium text-black/70 sm:text-[16px]">
        {t("public.tracks.faq.subtitle")}
      </p>

      <div className="mx-auto mt-6 grid max-w-[1098px] grid-cols-1 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 md:gap-5">
        {faqs.map((faq, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => toggle(index)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(index); }}
            className="cursor-pointer overflow-hidden rounded-xl border border-[#ccc] px-4 text-start text-[16px] font-medium sm:px-6 sm:text-[20px]"
          >
            <div className="flex min-h-16 items-center justify-between gap-3 py-3 sm:min-h-25 sm:gap-4 sm:py-4">
              <span>{faq}</span>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black text-[16px] font-normal leading-none transition-transform duration-300 sm:h-7 sm:w-7 sm:text-[18px] ${openIndex === index ? "rotate-45" : ""}`}>
                +
              </span>
            </div>
            {openIndex === index && (
              <p className="pb-5 text-[16px] font-normal leading-5 text-black/65 sm:leading-7">
                {t("public.events.detail.faq.genericAnswer")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CommunitiesAbuDhabiGrandPrixRide() {
  const { t } = useTranslation();
  const { eventId = "" } = useParams<{ eventId: string }>();
  const selectedEventId = eventId.trim();
  const [event, setEvent] = useState<GrandPrixEvent>(FALLBACK_EVENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    setError("");

    if (selectedEventId) {
      setLoading(true);
      getEventById(selectedEventId)
        .then((selectedEvent) => {
          if (!cancelled) setEvent(selectedEvent as GrandPrixEvent);
        })
        .catch((err) => {
          if (cancelled) return;
          console.error("Failed to load selected event:", err);
          setError(t("public.events.detail.loadErrorSelected"));
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

      return () => {
        cancelled = true;
      };
    }

    getEventsPage({
      search: TARGET_EVENT_TITLE,
      page: 1,
      limit: 10,
    })
      .then((data) => {
        if (cancelled) return;
        const events = (data.events || []) as GrandPrixEvent[];
        const matchedEvent =
          events.find((item) => item.slug === TARGET_EVENT_SLUG) ||
          events.find((item) => item.title.toLowerCase() === TARGET_EVENT_TITLE.toLowerCase()) ||
          events[0];

        if (matchedEvent) setEvent(matchedEvent);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load Grand Prix event:", err);
        // Keep the complete designed page visible when the API is unavailable.
        setEvent(FALLBACK_EVENT);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Re-fetch on language switch too — the API returns already-localized text
    // (Accept-Language header), so a stale response would otherwise linger
    // in the old language until a full page reload.
  }, [selectedEventId, i18n.language]);

  const stats = useMemo(() => getStats(event, t), [event, t]);
  const facilities = useMemo(() => getFacilities(event), [event]);
  const schedule = useMemo(() => getSchedule(event, t), [event, t]);
  const faqs = useMemo(() => getFaqs(event, t), [event, t]);

  return (
    <div className="grand-prix-page">
      <FontLoader />
      {loading && (
        <section className="grand-prix-section grand-prix-shell py-24 text-center">
          <p className="text-[22px] font-medium text-black/70">{t("public.events.detail.loading")}</p>
        </section>
      )}
      {!loading && error && (
        <section className="grand-prix-section grand-prix-shell py-24 text-center">
          <h1 className="grand-prix-bebas text-[50px] uppercase leading-[60px]">
            {TARGET_EVENT_TITLE}
          </h1>
          <p className="mt-4 text-[20px] font-medium text-black/70">{error}</p>
        </section>
      )}
      {!loading && !error && event && (
        <>
          <HeroSection event={event} />
          <AboutSection event={event} />
          <StatsStrip event={event} stats={stats} />
          <FacilitiesSection facilities={facilities} />
          <ScheduleSection event={event} schedule={schedule} />
          <FaqSection faqs={faqs} />
        </>
      )}
    </div>
  );
}
