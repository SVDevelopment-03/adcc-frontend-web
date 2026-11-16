import { useEffect, useMemo, useState, useCallback } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bike,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cross,
  Droplets,
  Flag,
  Lightbulb,
  ParkingCircle,
  Plus,
  Tag,
  Toilet,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { scrollToAppListing } from "../../utils/appStoreLink";
import { isEventClosed } from "../../utils/eventStatus";
import { FacilitiesStrip } from "../public/FacilitiesStrip";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import {
  EventApiResponse,
  getEventById,
  getEventsPage,
} from "../../services/eventsApi";
import InternalEventRegistration from "./InternalEventRegistration";
import { AnimatedButton } from "../ui/AnimatedButton";

type TFunction = (key: string, options?: Record<string, unknown>) => string;

type StatCard = {
  icon: LucideIcon;
  title: string;
  label: string;
  /** When set, the card opens this URL in a new tab. */
  href?: string;
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
const FALLBACK_HERO_IMAGE =
  "/img/pexels-ander-garcia-1317358711-25016478 1.png";
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
  amenities: [
    "Water Stations",
    "Medical Support",
    "Bike Repair",
    "Restrooms",
    "Parking",
  ],
  schedule: [
    {
      time: "6:00 AM",
      title: "Registration Opens",
      description: "Check-in and collect your race packet",
      order: 1,
    },
    {
      time: "7:00 AM",
      title: "Event Start",
      description: "The ride begins!",
      order: 2,
    },
    {
      time: "11:00 AM",
      title: "Awards Ceremony",
      description: "Celebration and prizes",
      order: 3,
    },
  ],
};

const formatDate = (date: string | undefined, t: TFunction) => {
  if (!date) return t("public.common.dateTBA");
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return t("public.common.dateTBA");
  return new Intl.DateTimeFormat(i18n.language, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const formatFee = (event: GrandPrixEvent | null | undefined, t: TFunction) => {
  if (!event) return t("public.events.detail.register.loading");
  if (event.registrationFeeType !== "paid")
    return t("public.events.detail.register.free");
  const amount = event.registrationFeeAmount ?? 0;
  return amount > 0 ? `${t("public.common.aed")} ${amount}` : t("public.events.detail.register.paid");
};

const getImage = (event?: GrandPrixEvent | null) =>
  event?.mainImage ||
  event?.eventImage ||
  event?.galleryImages?.[0] ||
  FALLBACK_HERO_IMAGE;

const getParticipants = (event?: GrandPrixEvent | null) =>
  event?.currentParticipants ?? event?.registrations ?? 0;

// The API populates trackId as { _id, title, titleAr }
const getTrackName = (event?: GrandPrixEvent | null) => {
  const track = event?.trackId as
    | string
    | { title?: string; titleAr?: string }
    | null
    | undefined;
  if (!track || typeof track !== "object") return "";
  return (
    (i18n.language?.startsWith("ar") && track.titleAr
      ? track.titleAr
      : track.title) || ""
  );
};

// Only what the admin chose in the dashboard; empty means the level is hidden.
const getLevel = (event: GrandPrixEvent | null | undefined) =>
  event?.difficulty?.trim() || "";

// `city` is always dashboard-translated (see backend localizeEventStatic); `address`
// is free text that may not have an Arabic version filled in for a given event, so
// prefer the guaranteed-localized city when the UI is in Arabic.
const getLocalizedLocation = (
  event: GrandPrixEvent | null | undefined,
  fallback: string,
) => {
  if (!event) return fallback;
  const preferCity = i18n.language?.startsWith("ar");
  return (
    (preferCity ? event.city || event.address : event.address || event.city) ||
    fallback
  );
};

const titleCase = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

// Event times are stored as 24-hour "HH:mm"; show them in the page language
// ("5:00 PM" / "5:00 م"). Anything else (old free-text values) is shown as is.
const formatTime = (value?: string) => {
  const raw = value?.trim();
  if (!raw) return "";
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (!match) return raw;
  const date = new Date(2000, 0, 1, Number(match[1]), Number(match[2]));
  return new Intl.DateTimeFormat(i18n.language, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getTimeRange = (event: GrandPrixEvent | null | undefined) => {
  const start = formatTime(event?.eventTime);
  const end = formatTime(event?.endTime);
  return start && end ? `${start} – ${end}` : start;
};

/**
 * The event facts strip: the same six cards on every event, in the same order
 * (date, time, track, category, participants, level). A value that is not
 * filled in shows a dash so every event page has the same layout.
 */
const EMPTY_STAT = "—";
const getStats = (
  event: GrandPrixEvent | null | undefined,
  t: TFunction,
): StatCard[] => {
  const level = getLevel(event);
  const category = event?.category?.trim();
  const riders = getParticipants(event);
  return [
    {
      icon: CalendarDays,
      title: formatDate(event?.eventDate, t) || EMPTY_STAT,
      label: t("public.events.detail.stats.date"),
    },
    {
      icon: Clock,
      title: getTimeRange(event) || EMPTY_STAT,
      label: t("public.events.detail.stats.time"),
    },
    {
      icon: Flag,
      title: getTrackName(event) || EMPTY_STAT,
      label: t("public.events.detail.stats.track"),
    },
    {
      icon: Tag,
      title: category ? titleCase(category) : EMPTY_STAT,
      label: t("public.events.detail.stats.category"),
    },
    {
      icon: Users,
      title: t("public.events.detail.stats.ridersCount", { count: riders }),
      label: t("public.events.detail.stats.participantsLabel"),
    },
    {
      icon: Trophy,
      title: level ? titleCase(level) : EMPTY_STAT,
      label: t("public.tracks.detail.level"),
    },
  ];
};

const facilityIconMap: Array<{ match: RegExp; icon: LucideIcon }> = [
  // Amenity labels come through as whatever the admin-managed lookup list
  // (or the API's locale) returns — an English label or an Arabic one
  // ("دورات المياه", "موقف سيارات", ...) — so match keywords in both
  // languages rather than defaulting everything to the generic Bike icon.
  //
  // Toilets is checked before water: its Arabic label ("دورات المياه")
  // contains the word for "water", so it must win first.
  { match: /restroom|toilet|washroom|bathroom|دورات|حمام/i, icon: Toilet },
  { match: /water|drink|hydration|ماء|مياه/i, icon: Droplets },
  { match: /medical|aid|health|ambulance|طبي|صحي|إسعاف/i, icon: Cross },
  {
    match: /repair|bike|mechanic|workshop|دراجات|تصليح|إصلاح|ورشة/i,
    icon: Wrench,
  },
  { match: /parking|موقف|مواقف/i, icon: ParkingCircle },
  { match: /light|إضاءة/i, icon: Lightbulb },
];

const getFacilityIcon = (title: string) =>
  facilityIconMap.find(({ match }) => match.test(title))?.icon || Bike;

const getFacilities = (event?: GrandPrixEvent | null): Facility[] =>
  (event?.amenities || []).map((title, index) => ({
    title: titleCase(title),
    icon: getFacilityIcon(title),
    active: index === 0,
  }));

const getSchedule = (
  event: GrandPrixEvent | null | undefined,
  t: TFunction,
): ScheduleItem[] => {
  // Only rows the admin actually entered; with none, the schedule section is hidden.
  const eventSchedule = (event?.schedule || []).filter(
    (item) => item?.time || item?.title?.trim(),
  );
  return [...eventSchedule]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      time: item.time,
      title: item.title,
      description: item.description || "",
    }));
};

const getFaqs = (event: GrandPrixEvent | null | undefined, t: TFunction) => {
  if (!event) return [];
  const fee = formatFee(event, t);
  const level = titleCase(getLevel(event));
  const location =
    event.city ||
    event.address ||
    t("public.events.detail.faq.locationFallback");
  return [
    t("public.events.detail.faq.whenScheduled", { title: event.title }),
    t("public.events.detail.faq.whereTakingPlace", { title: event.title }),
    ...(level ? [t("public.events.detail.faq.riderLevel", { level })] : []),
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

    /* Headings split into word <span>s (e.g. PublicPageHero) must keep the
       heading font instead of the Outfit span rule above. */
    .grand-prix-page :is(h1, h2, h3, h4, .bebas, .grand-prix-bebas) span {
      font-family: inherit;
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
      width: min(1200px, calc(100vw - 24px));
      margin: 0 auto;
    }
    @media (min-width: 768px) {
      .grand-prix-shell {
        width: min(1200px, calc(100vw - 48px));
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

    /* RTL: the Arabic fallback for 'Bebas Kai' runs visually larger than the
       Latin font at the same size, so the hero title needs to come down a
       size at every breakpoint to avoid the cramped multi-line wrap. */
    html[dir='rtl'] .grand-prix-hero-title {
      font-size: 26px !important;
    }
    @media (min-width: 640px) {
      html[dir='rtl'] .grand-prix-hero-title {
        font-size: 34px !important;
      }
    }
    @media (min-width: 1024px) {
      html[dir='rtl'] .grand-prix-hero-title {
        font-size: 40px !important;
      }
    }

    /* RTL: the facility pills pin the icon and label with a physical 'left'
       offset, so they never mirrored for Arabic. Flip both to the right
       edge — same offsets, same card size, just reflected — so the icon
       sits on the right with the label reading toward it on the left. */
    html[dir='rtl'] .facility-card-icon {
      left: auto !important;
      right: 14px !important;
    }
    html[dir='rtl'] .facility-card-title {
      left: auto !important;
      right: 60px !important;
      text-align: right !important;
    }
    @media (min-width: 640px) {
      html[dir='rtl'] .facility-card-icon {
        right: 19px !important;
      }
      html[dir='rtl'] .facility-card-title {
        right: 86px !important;
      }
    }

    /* RTL: the schedule gallery is pinned with a physical 'left' offset on
       desktop; mirror it to the right edge so it sits inside its column. */
    @media (min-width: 1024px) {
      html[dir='rtl'] .schedule-gallery {
        left: auto !important;
        right: 41px !important;
      }
    }
  `}</style>
);

function HeroSection({ event }: { event: GrandPrixEvent }) {
  const tags = Array.from(
    new Set([event.category, event.city, getTrackName(event)].filter(Boolean)),
  );

  return (
    <section
      className="grand-prix-hero public-hero-bleed relative w-full overflow-hidden"
      style={{ height: "100vh", minHeight: 480 }}
    >
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
        <h1 className="grand-prix-bebas grand-prix-hero-title text-[34px] uppercase leading-tight text-white sm:text-[44px] lg:text-[52px]">
          {event.title}
        </h1>
      </div>
    </section>
  );
}

const JOIN_EVENT_BUTTON_CLASS = "mt-5";

function AboutSection({ event }: { event: GrandPrixEvent }) {
  const { t } = useTranslation();
  const registrationLink = event.registrationLink?.trim();

  return (
    <section className="grand-prix-section px-4 pt-[103px] max-md:pt-14 max-sm:pt-10 text-center">
      <h2 className="grand-prix-bebas text-[28px] uppercase leading-tight sm:text-[38px] md:text-[48px] lg:text-[60px]">
        {t("public.events.detail.aboutHeading")}
      </h2>
      <p className="mx-auto mt-4 max-w-[851px] text-[14px] font-normal leading-relaxed text-black sm:text-[17px] md:text-[20px] lg:text-[24px]">
        {event.description}
      </p>
      {/* No joining once the event is over. Internal events register on the
          website form; external ones on their own link or in the app. */}
      {isEventClosed(event) ? null : event.isInternal ? (
        <AnimatedButton
          to={`/events/${encodeURIComponent(event.slug || event._id || event.id || "")}/register`}
          className={JOIN_EVENT_BUTTON_CLASS}
        >
          {t("public.events.detail.joinEvent")}
        </AnimatedButton>
      ) : registrationLink ? (
        <AnimatedButton
          href={registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className={JOIN_EVENT_BUTTON_CLASS}
        >
          {t("public.events.detail.joinEvent")}
        </AnimatedButton>
      ) : (
        <AnimatedButton
          onClick={scrollToAppListing}
          className={JOIN_EVENT_BUTTON_CLASS}
        >
          {t("public.events.detail.joinEvent")}
        </AnimatedButton>
      )}
    </section>
  );
}

function StatCardShell({
  href,
  className,
  children,
}: {
  href?: string;
  className: string;
  children: React.ReactNode;
}) {
  if (!href) return <article className={className}>{children}</article>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} block transition-colors hover:bg-[#3a4e66]`}
    >
      {children}
    </a>
  );
}

function RegisterCard({
  event,
  inRow = false,
}: {
  event: GrandPrixEvent;
  /** Desktop: full width on its own row, 330px next to the facts from xl up. */
  inRow?: boolean;
}) {
  const { t } = useTranslation();
  const total = event.maxParticipants ?? 0;
  const joined = getParticipants(event);
  const closed = isEventClosed(event);
  const spotsText = closed
    ? t("public.events.detail.register.registrationClosed", "Registration closed")
    : total > 0
      ? t("public.events.detail.register.spotsAvailable", {
          count: Math.max(total - joined, 0),
        })
      : t("public.events.detail.register.openRegistration");
  // Organiser picked in the admin (already in the page language); the club itself when none is set.
  const organizerName =
    event.organizedByName?.trim() ||
    event.organizedBy?.trim() ||
    t("public.events.detail.register.defaultOrganizer");

  return (
    <article
      className={`relative h-[200px] w-full shrink-0 rounded-2xl bg-[#435974] text-white lg:h-[236px] ${
        inRow ? "xl:w-[330px]" : ""
      }`}
    >
      <p className="absolute left-4 top-[14px] flex items-center gap-[6px] text-[12px] font-medium leading-[18px] lg:left-6 lg:top-[19px] lg:text-[14px]">
        <span className="h-[7px] w-[7px] rounded-full bg-white" />
        {closed
          ? t("common.eventClosed", "Event Closed")
          : t("public.events.detail.register.registerNow")}
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
          <b
            title={organizerName}
            className={`grand-prix-bebas max-w-[150px] truncate leading-tight sm:max-w-[190px] ${
              organizerName.length > 12
                ? "text-[16px] lg:text-[20px]"
                : "text-[24px] lg:text-[30px]"
            }`}
          >
            {organizerName}
          </b>
        </div>
      </div>
    </article>
  );
}

function StatsStrip({
  event,
  stats,
}: {
  event: GrandPrixEvent;
  stats: StatCard[];
}) {
  // Price, places and organiser only apply to events registered through ADCC
  // (internal). External events register with their own organiser, so the
  // register card is left out and only the event facts are shown.
  const showRegister = !!event.isInternal;
  return (
    <section className="grand-prix-section mt-10 mb-20 px-4 lg:mt-[60px] lg:px-0">
      {/* Mobile (< lg): register card stacked on top of a 2x2 stats grid */}
      <div className="mx-auto w-full max-w-[600px] rounded-2xl bg-[#A2BFDB] p-3 lg:hidden">
        <div className="flex flex-col gap-3">
          {showRegister && <RegisterCard event={event} />}
          {/* An odd last card spans both columns so the grid has no hole. */}
          <div className="grid grid-cols-2 gap-3 [&>*:last-child:nth-child(odd)]:col-span-2">
            {stats.map(({ icon: Icon, title, label, href }) => (
              <StatCardShell
                key={label}
                href={href}
                className="relative overflow-hidden break-words rounded-[14px] bg-[#435974] p-4 text-white sm:p-5"
              >
                <span className="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-white text-[#019839] sm:h-[50px] sm:w-[50px]">
                  <Icon className="h-[20px] w-[20px] sm:h-[25px] sm:w-[25px]" />
                </span>
                <h3 className="grand-prix-bebas mt-4 text-[20px] uppercase leading-tight sm:mt-8 sm:text-[26px]">
                  {title}
                </h3>
                <p className="mt-1 text-[13px] leading-5 text-white/60 sm:text-[16px]">
                  {label}
                </p>
              </StatCardShell>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop (lg+): the six fact cards always sit in one even row. The
          register card (internal events) sits beside them on wide screens
          (xl+) and on its own row above them on smaller laptops. */}
      <div className="mx-auto hidden w-full max-w-[1192px] rounded-2xl bg-[#A2BFDB] p-3 lg:block">
        <div className="flex flex-col gap-3 xl:flex-row">
          {showRegister && <RegisterCard event={event} inRow />}
          <div
            className="grid min-w-0 flex-1 gap-3"
            style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
          >
            {stats.map(({ icon: Icon, title, label, href }) => (
              <StatCardShell
                key={label}
                href={href}
                className="flex h-[236px] min-w-0 flex-col overflow-hidden rounded-[10px] bg-[#435974] p-4 text-white xl:p-5"
              >
                <span className="flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full bg-white text-[#019839]">
                  <Icon className="h-[25px] w-[25px]" />
                </span>
                {/* Track names and time ranges can be long: wrap up to three
                    lines at a smaller size instead of running off the card. */}
                <h3
                  title={title}
                  className={`grand-prix-bebas mt-auto line-clamp-3 break-words uppercase leading-tight ${
                    title.length > 12 ? "text-[19px]" : "text-[24px]"
                  }`}
                >
                  {title}
                </h3>
                <p className="mt-1 text-[16px] leading-5 text-white/60">
                  {label}
                </p>
              </StatCardShell>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection({ facilities }: { facilities: Facility[] }) {
  const { t } = useTranslation();
  if (facilities.length === 0) return null;

  return (
    <section
      className="grand-prix-section  max-md:mt-16 max-sm:mt-10 bg-cover bg-center bg-no-repeat py-8 text-white sm:py-16"
      style={{ backgroundImage: "url('/img/image 3518.png')" }}
    >
      {/* <div className="grand-prix-shell relative h-full"> */}
      {/* <div className="grand-prix-shell relative "> */}
      <div className="grand-prix-shell relative">
        <div className="flex items-start justify-between pt-16 max-lg:flex-col max-lg:gap-8 max-lg:pt-0">
          <h2 className="grand-prix-bebas max-w-[579px] text-[32px] uppercase leading-tight text-[#000000] sm:text-[38px] lg:text-[44px]">
            {t("public.tracks.detail.facilitiesHeading")}
          </h2>
          <AnimatedButton to="/contact-us" className="mt-[35px] shrink-0 max-lg:mt-0">
            {t("public.common.getInTouch")}
          </AnimatedButton>
        </div>
      </div>

      <FacilitiesStrip facilities={facilities} />
    </section>
  );
}

function ScheduleGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    setIndex((i) => (i >= count ? 0 : i));
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % count),
      4000,
    );
    return () => window.clearInterval(id);
  }, [count]);

  const go = (next: number) => setIndex(((next % count) + count) % count);

  return (
    <div className="schedule-gallery absolute bottom-0 left-[41px] h-[260px] w-[377px] max-lg:left-0 max-lg:w-full lg:h-[478px]">
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        <div
          dir="ltr"
          className="flex h-full w-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {images.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={alt}
              loading="lazy"
              className="h-full w-full shrink-0 object-cover"
            />
          ))}
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(index - 1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(index + 1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to image ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
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

  const galleryImages = (
    event.galleryImages && event.galleryImages.length > 0
      ? event.galleryImages
      : [getImage(event), SCHEDULE_IMAGE]
  )
    .filter(Boolean)
    .slice(0, 4);

  return (
    <section
      id="grand-prix-schedule"
      className="grand-prix-section relative z-10 block w-full bg-[#323232] pb-[78px] pt-[69px] text-white max-md:pb-8 max-md:pt-6"
    >
      <h2 className="grand-prix-bebas mx-auto max-w-[621px] text-center text-[26px] uppercase leading-tight sm:text-[34px] md:text-[42px] lg:text-[50px]">
        {t("public.events.detail.schedule.titleSuffix", { title: event.title })}
      </h2>

      <p className="mx-auto mb-8 mt-3 max-w-[795px] text-center text-[13px] leading-relaxed text-white/70 sm:text-[16px] md:text-[18px] lg:text-[22px] lg:mb-[45px] lg:mt-[22px]">
        {getLocalizedLocation(
          event,
          t("public.events.detail.schedule.subtitleFallback"),
        )}
      </p>

      <div className="grand-prix-shell mt-6 grid grid-cols-1 items-center gap-6 lg:mt-[45px] lg:gap-[53px] lg:grid-cols-[460px_minmax(0,1fr)]">
        <div className="relative order-2 h-[260px] w-full max-w-[460px] max-lg:mx-auto lg:order-1 lg:h-[478px]">
          <div className="absolute bottom-0 left-0 h-[150px] w-full rounded-tl-xl rounded-br-xl rounded-tr-[60px] rounded-bl-[60px] bg-[#435974] lg:h-[254px]" />

          <ScheduleGallery
            images={galleryImages}
            alt={t("public.events.detail.schedule.participantAlt", {
              title: event.title,
            })}
          />
        </div>

        {/* <div className="space-y-[16px]"> */}
        {/* <div className="w-[736px] space-y-[16px] max-lg:w-full"> */}
        <div className="order-1 w-full min-w-0 space-y-[16px] lg:order-2">
          {schedule.map((item, index) => (
            <article
              key={`${item.time}-${item.title}-${index}`}
              className={`grid min-h-[98px] w-full grid-cols-[168px_1fr] items-center rounded-[11.91px] px-[19px] text-white max-lg:w-full max-sm:h-auto max-sm:grid-cols-1 max-sm:gap-2 max-sm:py-5 ${
                // className={`grid min-h-[98px] grid-cols-[149px_1fr] items-center rounded-[12px] px-[19px] text-white max-sm:grid-cols-1 max-sm:gap-2 max-sm:py-5 ${
                index === 0 ? "bg-[#435974]" : "bg-[#7891AF]"
              }`}
            >
              <time className="max-sm:order-2 text-[13px] font-normal leading-snug sm:text-[16px] md:text-[18px]">
                {item.time}
              </time>

              <div className="max-sm:order-1">
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
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") toggle(index);
            }}
            className="cursor-pointer overflow-hidden rounded-xl border border-[#ccc] px-4 text-start text-[16px] font-medium sm:px-6 sm:text-[20px]"
          >
            <div className="flex min-h-16 items-center justify-between gap-3 py-3 sm:min-h-25 sm:gap-4 sm:py-4">
              <span>{faq}</span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black text-[16px] font-normal leading-none transition-transform duration-300 sm:h-7 sm:w-7 sm:text-[18px] ${openIndex === index ? "rotate-45" : ""}`}
              >
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
          events.find(
            (item) =>
              item.title.toLowerCase() === TARGET_EVENT_TITLE.toLowerCase(),
          ) ||
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

  // A closed event has no detail page (the listing hides View Details for it):
  // links to it go back to the events list. FALLBACK_EVENT is only the
  // placeholder shown before the requested event loads.
  if (selectedEventId && !loading && event !== FALLBACK_EVENT && isEventClosed(event)) {
    return <Navigate to="/events" replace />;
  }

  return (
    <div className="grand-prix-page">
      <FontLoader />
      {loading && (
        <section className="grand-prix-section grand-prix-shell py-24 text-center">
          <p className="text-[22px] font-medium text-black/70">
            {t("public.events.detail.loading")}
          </p>
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
          {schedule.length > 0 && (
            <ScheduleSection event={event} schedule={schedule} />
          )}
          {/* <FaqSection faqs={faqs} /> */}
        </>
      )}
    </div>
  );
}

/**
 * /events/:eventId/register — the registration form of an internal event.
 * Other events have no form here, so they go back to their detail page;
 * closed events go to the events list.
 */
export function InternalEventRegisterPage() {
  const { t } = useTranslation();
  const { eventId = "" } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<GrandPrixEvent | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setEvent(null);
    setError("");
    getEventById(eventId.trim())
      .then((loaded) => {
        if (!cancelled) setEvent(loaded as GrandPrixEvent);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load event for registration:", err);
        setError(t("public.events.detail.loadErrorSelected"));
      });
    return () => {
      cancelled = true;
    };
  }, [eventId, i18n.language]);

  // Closed events take no registrations and have no detail page: back to the list
  if (event && isEventClosed(event)) {
    return <Navigate to="/events" replace />;
  }

  if (event && !event.isInternal) {
    return <Navigate to={`/events/${encodeURIComponent(eventId)}`} replace />;
  }

  return (
    <div className="grand-prix-page">
      <FontLoader />
      {!event && !error && (
        <section className="grand-prix-section grand-prix-shell py-24 text-center">
          <p className="text-[22px] font-medium text-black/70">
            {t("public.events.detail.loading")}
          </p>
        </section>
      )}
      {error && (
        <section className="grand-prix-section grand-prix-shell py-24 text-center">
          <p className="mt-4 text-[20px] font-medium text-black/70">{error}</p>
        </section>
      )}
      {event && <InternalEventRegistration event={event} heroImage={getImage(event)} />}
    </div>
  );
}
