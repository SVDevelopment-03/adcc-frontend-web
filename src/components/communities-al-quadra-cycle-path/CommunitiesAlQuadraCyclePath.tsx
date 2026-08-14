import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bike,
  CalendarDays,
  Clock,
  Cloud,
  Cross,
  Droplets,
  Gauge,
  MapPin,
  ParkingCircle,
  Plus,
  Shield,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EventApiResponse } from "../../services/eventsApi";
import {
  getTrackById,
  getTrackEventsPage,
  getTracksPage,
  type Track,
} from "../../services/trackService";

type FacilityCard = {
  title: string;
  icon: LucideIcon;
  active?: boolean;
};

const TARGET_TRACK_TITLE = "Al Qudra Cycle Path";
const TARGET_TRACK_ALT_TITLE = "Al Quadra Cycle Path";
const TARGET_TRACK_SLUGS = ["al-qudra-cycle-path", "al-quadra-cycle-path"];
const FALLBACK_HERO_IMAGE = "/img/pexels-ander-garcia-1317358711-25016478 1.png";
const FALLBACK_EVENT_IMAGE = "/img/501345306_3950860245127637_1209497623770704531_n. 1.png";
const FACILITIES_BG = "/img/image 3518.png";

const FALLBACK_TRACK: Track = {
  id: "al-quadra-cycle-path",
  slug: "al-quadra-cycle-path",
  title: TARGET_TRACK_TITLE,
  city: "Abu Dhabi",
  area: "Al Qudra",
  country: "United Arab Emirates",
  distance: 18,
  elevation: "50 m",
  difficulty: "easy",
  trackType: "road",
  surfaceType: "Asphalt",
  status: "open",
  hasLighting: true,
  safetyLevel: "high",
  trafficLevel: "lLow",
  helmetRequired: true,
  nightRidingAllowed: true,
  safetyNotes: "Always wear a helmet, carry sufficient water and ride during cooler hours.",
  shortDescription: "The Al Qudra Cycle Path is an 18 km beginner-friendly track, ideal for cyclists who want a safe, well-maintained route with useful amenities for training or a leisurely ride.",
  eventsCount: 3,
  image: FALLBACK_HERO_IMAGE,
  coverImage: FALLBACK_HERO_IMAGE,
  galleryImages: [FALLBACK_HERO_IMAGE, "/img/image 3049.png"],
  mapPreview: "/img/image 3049.png",
  facilities: ["water", "firstAid", "bikeRental", "toilets", "parking"] as unknown as Track["facilities"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

const FALLBACK_EVENTS: EventApiResponse[] = [
  { id: "abu-dhabi-grand-prix-ride", title: "Abu Dhabi Grand Prix Ride", description: "A challenging ride around Abu Dhabi.", eventImage: FALLBACK_EVENT_IMAGE, eventDate: "2026-03-15", eventTime: "7:00 AM", endTime: "11:00 AM", address: "Yas Marina Circuit", city: "Abu Dhabi", maxParticipants: 200, currentParticipants: 156, distance: 42, category: "Race", status: "Open", rewards: { points: 0, badgeName: "" }, galleryImages: [] },
  { id: "dubai-marina-sunrise-ride", title: "Dubai Marina Sunrise Ride", description: "A scenic sunrise community ride.", eventImage: "/img/490796704_1417267435941639_5633845168834004037_n. 1.png", eventDate: "2026-03-20", eventTime: "6:00 AM", endTime: "9:00 AM", address: "Dubai Marina", city: "Dubai", maxParticipants: 120, currentParticipants: 89, distance: 25, category: "Community Ride", status: "Open", rewards: { points: 0, badgeName: "" }, galleryImages: [] },
  { id: "al-ain-mountain-challenge", title: "Al Ain Mountain Challenge", description: "A demanding mountain cycling challenge.", eventImage: "/img/503933859_18364437631178203_8919788300453479084_n. 1.png", eventDate: "2026-03-28", eventTime: "6:30 AM", endTime: "12:00 PM", address: "Jebel Hafeet", city: "Al Ain", maxParticipants: 200, currentParticipants: 156, distance: 65, category: "Race", status: "Open", rewards: { points: 0, badgeName: "" }, galleryImages: [] },
];

const getTrackId = (track?: Track | null) => ((track as any)?._id || track?.id || "") as string;

const titleCase = (value?: string) =>
  (value || "TBA")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const DIFFICULTY_FILTER_KEYS = ["easy", "medium", "hard"];

const translateDifficulty = (
  difficulty: string | undefined,
  t: (key: string) => string,
) => {
  const raw = (difficulty || "").toLowerCase();
  if (DIFFICULTY_FILTER_KEYS.includes(raw)) {
    return t(`public.common.filters.${raw}`);
  }
  return titleCase(difficulty);
};

const formatDate = (date?: string, fallback = "Date TBA") => {
  if (!date) return fallback;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const getTrackImage = (track?: Track | null) =>
  track?.coverImage ||
  track?.image ||
  track?.galleryImages?.[0] ||
  track?.mapPreview ||
  FALLBACK_HERO_IMAGE;

const normalizeFacilities = (track?: Track | null): FacilityCard[] => {
  const rawFacilities = (track?.facilities || []) as unknown;
  const names = Array.isArray(rawFacilities)
    ? rawFacilities.flatMap((item) => {
        if (typeof item === "string") return [item];
        if (item && typeof item === "object" && Array.isArray((item as any).facilities)) {
          return (item as any).facilities;
        }
        return [];
      })
    : [];

  return names.map((name, index) => ({
    title: titleCase(String(name)),
    icon: getFacilityIcon(String(name)),
    active: index === 0,
  }));
};

const getFacilityIcon = (name: string): LucideIcon => {
  if (/water|drink|hydration/i.test(name)) return Droplets;
  if (/first|aid|medical|health/i.test(name)) return Cross;
  if (/repair|bike|rental|mechanic/i.test(name)) return Wrench;
  if (/parking/i.test(name)) return ParkingCircle;
  if (/toilet|restroom|washroom/i.test(name)) return Users;
  return Bike;
};

const getFaqs = (track: Track, t: (key: string, options?: Record<string, unknown>) => string) => [
  t("public.tracks.detail.faqQuestions.location", { track: track.title }),
  t("public.tracks.detail.faqQuestions.distance", { track: track.title }),
  t("public.tracks.detail.faqQuestions.difficulty", { track: track.title }),
  t("public.tracks.detail.faqQuestions.helmet", { track: track.title }),
  t("public.tracks.detail.faqQuestions.night", { track: track.title }),
  t("public.tracks.detail.faqQuestions.facilities", { track: track.title }),
];

function LoadingState() {
  const { t } = useTranslation();
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <p className="text-[22px] font-medium text-black/70">{t("public.tracks.detail.loadingDetails")}</p>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <h1 className="text-[50px] font-normal uppercase">{TARGET_TRACK_TITLE}</h1>
      <p className="mt-4 text-[20px] font-medium text-black/70">{message}</p>
    </main>
  );
}

function HeroSection({ track }: { track: Track }) {
  const { t } = useTranslation();
  return (
    <section
      className="relative w-full overflow-hidden public-hero-bleed"
      style={{ height: "100vh", minHeight: 480 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('${getTrackImage(track)}')`,
        }}
        aria-hidden
      />
      <div className="public-hero-content-pos">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/30 px-5 py-2 text-[14px] font-medium text-white backdrop-blur sm:text-[16px]">
            {track.city || t("public.tracks.detail.locationTBA")}
          </span>
          <span className="rounded-full bg-white/30 px-5 py-2 text-[14px] font-medium text-white backdrop-blur sm:text-[16px]">
            {titleCase(track.trackType)}
          </span>
        </div>
        <h1 className="text-[30px] font-normal uppercase leading-tight text-white sm:text-[40px] lg:text-[50px]">
          {track.title}
        </h1>
      </div>
    </section>
  );
}

function AboutSection({ track }: { track: Track }) {
  const { t } = useTranslation();
  return (
    <section className="px-10 py-24 text-center max-md:px-5 max-md:py-14 max-sm:px-4 max-sm:py-10">
      <h2 className="text-[28px] font-normal uppercase sm:text-[38px] md:text-[48px] lg:text-[60px]">{t("public.tracks.detail.aboutHeading")}</h2>
      <p className="mx-auto mt-4 max-w-[851px] text-[14px] leading-relaxed sm:mt-6 sm:text-[17px] md:text-[20px] lg:text-[24px]">
        {track.shortDescription || (track as any).description || track.safetyNotes || t("public.tracks.detail.detailsComingSoon")}
      </p>

      <button className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[15px] font-bold text-white sm:mt-8 sm:px-8 sm:py-4 sm:text-[18px]">
        {t("public.tracks.detail.startRide")} <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
      </button>
    </section>
  );
}

function StatsSection({ track }: { track: Track }) {
  const { t } = useTranslation();
  const stats: [typeof CalendarDays, string, string][] = [
    [CalendarDays, `${track.distance ?? t("public.tracks.detail.tba")}${typeof track.distance === "number" ? " km" : ""}`, t("public.tracks.detail.distance")],
    [CalendarDays, translateDifficulty(track.difficulty, t), t("public.tracks.detail.level")],
    [CalendarDays, titleCase(track.trackType), t("public.tracks.detail.type")],
  ];

  return (
    <section className="mx-auto mb-16 max-w-[min(1192px,calc(100vw-2rem))] rounded-2xl bg-[#A2BFDB] p-4 lg:mb-28">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,180px)]">
        <div className="rounded-2xl bg-[#435974] p-5 text-white sm:p-8">
          <p className="text-[13px] text-white/70 sm:text-[14px]">• {t("public.tracks.detail.startYourRide")}</p>
          <div className="mt-4 sm:mt-8 sm:flex sm:gap-8">
            <h3 className="flex-1 text-[22px] font-bold uppercase leading-tight sm:text-[26px] lg:text-[32px]">
              {t("public.tracks.detail.trackProgress")}
            </h3>
            <div className="my-5 h-px bg-white/20 sm:my-0 sm:h-auto sm:w-px sm:self-stretch" />
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/60 sm:text-[12px]">
                {t("public.tracks.detail.safetyTips")}
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:mt-4 sm:gap-y-4">
                {([
                  [Shield, t("public.tracks.detail.safetyHelmet")],
                  [Droplets, t("public.tracks.detail.safetyWater")],
                  [Cloud, t("public.tracks.detail.safetyWeather")],
                  [Clock, t("public.tracks.detail.safetyHours")],
                ] as [typeof Shield, string][]).map(([Icon, label]) => (
                  <p key={label} className="flex items-center gap-2 text-[12px] text-white/80 sm:text-[14px]">
                    <Icon size={13} className="shrink-0 opacity-70" />
                    {label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {stats.map(([Icon, value, label]) => (
          <div key={label} className="rounded-xl bg-[#435974] p-5 text-white sm:p-8">
            <span className="inline-flex rounded-full bg-white p-3 text-[#019839] sm:p-4">
              <Icon size={20} className="sm:hidden" />
              <Icon size={25} className="hidden sm:block" />
            </span>
            <h3 className="mt-10 text-[22px] font-normal uppercase sm:mt-20 sm:text-[26px] lg:text-[30px]">{value}</h3>
            <p className="text-[13px] text-white/60 sm:text-[17px] lg:text-[20px]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FacilitiesSection({ facilities }: { facilities: FacilityCard[] }) {
  const { t } = useTranslation();
  if (facilities.length === 0) return null;

  return (
    <section
      className="bg-cover bg-center bg-no-repeat py-12 sm:py-16 lg:py-20"
      style={{
        backgroundImage: `url('${FACILITIES_BG}')`,
      }}
    >
      <div className="mx-auto max-w-[1268px] px-4 sm:px-6 md:px-10">
        <div className="flex justify-between gap-8 max-lg:flex-col">
          <h2 className="max-w-[580px] text-[26px] font-normal uppercase leading-tight sm:text-[34px] lg:text-[44px]">
            {t("public.tracks.detail.facilitiesHeading")}
          </h2>
          <Link to="/contact-us" className="inline-flex h-fit cursor-pointer items-center gap-2 rounded-full bg-[#019839] px-8 py-4 font-bold text-white">
            {t("public.common.getInTouch")}
            <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
          </Link>
        </div>
      </div>

      <div
        className="mt-14 flex gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-4 sm:pl-6 md:pl-10 lg:pl-[max(2.5rem,calc((100vw-1268px)/2))]"
        style={{
          maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, black 85%, transparent 100%)",
        }}
      >
        {facilities.map(({ title, icon: Icon }) => (
          <div
            key={title}
            className="group relative shrink-0 min-w-[200px] cursor-pointer rounded-xl bg-white/30 p-5 pb-6 text-white transition-colors duration-200 hover:bg-white hover:text-[#333]"
          >
            <div className="flex items-center gap-4">
              <span className="shrink-0 rounded-lg bg-white p-3 text-[#333] transition-colors duration-200 group-hover:bg-[#019839] group-hover:text-white">
                <Icon size={26} />
              </span>
              <b className="text-[18px] leading-tight">{title}</b>
            </div>
            <div className="absolute bottom-0 left-0 h-[4px] w-full rounded-b-xl bg-transparent transition-colors duration-200 group-hover:bg-[#019839]" />
          </div>
        ))}
        <div className="shrink-0 w-4" aria-hidden />
      </div>
    </section>
  );
}

function TrackMediaSection({ track }: { track: Track }) {
  const media = track.galleryImages?.[1] || track.mapPreview || track.galleryImages?.[0] || track.image;
  if (!media) return null;

  return (
    <section
      className="h-[620px] bg-[#2f2f2f] bg-cover bg-center"
      style={{
        backgroundImage: `url('${media}')`,
      }}
    />
  );
}

function EventCard({ event }: { event: EventApiResponse }) {
  const { t } = useTranslation();
  const image =
    event.eventImage ||
    event.mainImage ||
    event.galleryImages?.[0] ||
    FALLBACK_EVENT_IMAGE;
  const participants = event.currentParticipants ?? event.registrations ?? 0;
  const eventId = event._id || event.id;

  return (
    <div>
      <div className="relative h-[397px] overflow-hidden rounded-[14px] bg-white">
        <img src={image} alt={event.title} className="h-full w-full object-cover" />

        <span className="absolute right-6 top-6 rounded-full bg-black/40 px-6 py-2 text-white">
          {event.category || t("public.common.eventFallback")}
        </span>
      </div>

      <h3 className="mt-6 text-[26px] font-normal uppercase">{event.title}</h3>

      <div className="mt-5 grid grid-cols-2 gap-y-4 text-[18px] text-black/70">
        <p className="flex gap-2">
          <CalendarDays size={20} /> {formatDate(event.eventDate, t("public.common.dateTBA"))}
        </p>
        <p className="flex gap-2">
          <Gauge size={20} />{" "}
          {typeof event.distance === "number" ? `${event.distance} km` : t("public.common.distanceTBA")}
        </p>
        <p className="flex gap-2">
          <Users size={20} /> {t("public.common.participants", { count: participants, formattedCount: participants })}
        </p>
        <p className="flex gap-2">
          <MapPin size={20} /> {event.city || event.address || t("public.tracks.detail.locationTBA")}
        </p>
      </div>

      <Link
        to={
          eventId
            ? `/user-event/${encodeURIComponent(eventId)}`
            : "/user-event"
        }
        className="mt-[27px] flex h-[50px] w-[157px] items-center justify-center rounded-[30px] border border-[#019839] bg-transparent text-[16px] font-bold capitalize leading-[22px] text-[#019839] transition-colors hover:bg-[#019839] hover:text-white"
      >
        {t("public.common.viewDetails")}
      </Link>
    </div>
  );
}

function UpcomingEventsSection({ events }: { events: EventApiResponse[] }) {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-[1269px] px-10 py-32 max-md:px-5 max-md:py-16 max-sm:px-4 max-sm:py-12">
      <h2 className="mb-8 text-center text-[26px] font-normal uppercase sm:text-[34px] md:text-[42px] lg:text-[50px] lg:mb-16">{t("public.tracks.detail.upcomingEvents")}</h2>

      {events.length === 0 ? (
        <p className="text-center text-[20px] font-medium text-black/60">
          {t("public.tracks.detail.noUpcomingEvents")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id || event.id || event.title} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}

function FaqSection({ track }: { track: Track }) {
  const { t } = useTranslation();
  const faqs = getFaqs(track, t);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="w-full px-4 pb-16 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
      <h2 className="text-[30px] font-normal uppercase sm:text-[38px] lg:text-[46px]">{t("public.tracks.faq.title")}</h2>
      <p className="mt-3 text-[15px] text-black/70 sm:text-[16px]">{t("public.tracks.faq.subtitle")}</p>

      <div className="mx-auto mt-8 grid max-w-[1098px] grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 md:gap-5">
        {faqs.map((faq, index) => (
          <div
            key={faq}
            role="button"
            tabIndex={0}
            onClick={() => toggle(index)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(index); }}
            className="cursor-pointer overflow-hidden rounded-xl border border-[#ccc] px-6 text-left text-[20px] font-medium"
          >
            <div className="flex min-h-25 items-center justify-between gap-4 py-4">
              <span>{faq}</span>
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-black text-[18px] font-normal leading-none transition-transform duration-300 ${openIndex === index ? "rotate-45" : ""}`}>
                +
              </span>
            </div>
            {openIndex === index && (
              <p className="pb-5 text-[16px] font-normal leading-7 text-black/65">
                {t("public.tracks.detail.faqDefaultAnswer")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TrackDetailPage() {
  const { t } = useTranslation();
  const { trackId = "" } = useParams<{ trackId: string }>();
  const selectedTrackId = trackId.trim();
  const [track, setTrack] = useState<Track>(FALLBACK_TRACK);
  const [events, setEvents] = useState<EventApiResponse[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTrackPage = async () => {
      setError("");

      try {
        if (selectedTrackId) {
          setLoading(true);
          const [selectedTrack, selectedTrackEvents] = await Promise.all([
            getTrackById(selectedTrackId),
            getTrackEventsPage(selectedTrackId, { page: 1, limit: 3 }),
          ]);

          if (!cancelled) {
            setTrack(selectedTrack);
            setEvents(selectedTrackEvents.events || []);
          }
          return;
        }

        const tracksPage = await getTracksPage({
          search: TARGET_TRACK_TITLE,
          publicOnly: true,
          page: 1,
          limit: 10,
        });
        let tracks = tracksPage.tracks || [];

        if (tracks.length === 0) {
          const altTracksPage = await getTracksPage({
            search: TARGET_TRACK_ALT_TITLE,
            publicOnly: true,
            page: 1,
            limit: 10,
          });
          tracks = altTracksPage.tracks || [];
        }

        const matched =
          tracks.find((item) => item.slug && TARGET_TRACK_SLUGS.includes(item.slug)) ||
          tracks.find((item) => item.title.toLowerCase() === TARGET_TRACK_TITLE.toLowerCase()) ||
          tracks.find((item) => item.title.toLowerCase() === TARGET_TRACK_ALT_TITLE.toLowerCase()) ||
          tracks[0] ||
          null;

        if (!matched) {
          if (!cancelled) {
            setTrack(FALLBACK_TRACK);
            setEvents(FALLBACK_EVENTS);
          }
          return;
        }

        const trackId = getTrackId(matched);
        const detailedTrack = trackId ? await getTrackById(trackId) : matched;
        const trackEvents = trackId
          ? await getTrackEventsPage(trackId, { page: 1, limit: 3 })
          : { events: [] };

        if (!cancelled) {
          setTrack(detailedTrack);
          setEvents(trackEvents.events || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load Al Qudra track page:", err);
          if (selectedTrackId) {
            setError(t("public.tracks.detail.loadError"));
          } else {
            setTrack(FALLBACK_TRACK);
            setEvents(FALLBACK_EVENTS);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTrackPage();

    return () => {
      cancelled = true;
    };
  }, [selectedTrackId, t]);

  const facilities = useMemo(() => normalizeFacilities(track), [track]);

  if (loading) return <LoadingState />;
  if (error || !track) return <ErrorState message={error || t("public.tracks.detail.notFound")} />;

  return (
    <main className="font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      <HeroSection track={track} />
      <AboutSection track={track} />
      <StatsSection track={track} />
      <FacilitiesSection facilities={facilities} />
      <TrackMediaSection track={track} />
      <UpcomingEventsSection events={events} />
      <FaqSection track={track} />
    </main>
  );
}
