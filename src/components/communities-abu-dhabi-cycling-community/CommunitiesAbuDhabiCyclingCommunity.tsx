import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  CalendarDays,
  Gauge,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import {
  CommunityApiResponse,
  getCommunityById,
  getCommunities,
} from "../../services/communitiesApi";
import { EventApiResponse, getEventsPage } from "../../services/eventsApi";


const TARGET_COMMUNITY_TITLE = "Abu Dhabi Cycling Community";
const TARGET_COMMUNITY_SLUG = "abu-dhabi-cycling-community";
const FALLBACK_HERO_IMAGE = "/img/pexels-ander-garcia-1317358711-25016478 1.png";


const FALLBACK_COMMUNITY: CommunityApiResponse = {
  id: TARGET_COMMUNITY_SLUG,
  slug: TARGET_COMMUNITY_SLUG,
  title: TARGET_COMMUNITY_TITLE,
  description: "The cycling community of Abu Dhabi unites cyclists of all levels to explore the best routes. Join us for group rides, social events, and community challenges. Whether a beginner or experienced, you will find your place here.",
  type: "Official",
  category: "Cycling Community",
  location: "Abu Dhabi",
  city: "Abu Dhabi",
  country: "United Arab Emirates",
  image: FALLBACK_HERO_IMAGE,
  isActive: true,
  isPublic: true,
  memberCount: "2456",
  upcomingEventCount: "3",
  weeklyRides: "12+",
  ridesThisMonth: "48",
  distance: 45000,
  terrain: "Road",
  allowPosts: true,
};

const FALLBACK_EVENTS: EventApiResponse[] = [
  { id: "abu-dhabi-grand-prix-ride", title: "Abu Dhabi Grand Prix Ride", description: "A challenging ride around Abu Dhabi.", eventImage: "/img/Frame 2147226042.png", eventDate: "2026-03-15", eventTime: "7:00 AM", endTime: "11:00 AM", address: "Yas Marina Circuit", city: "Abu Dhabi", maxParticipants: 200, currentParticipants: 156, distance: 42, category: "Race", status: "Open", rewards: { points: 0, badgeName: "" }, galleryImages: [] },
  { id: "dubai-marina-sunrise-ride", title: "Dubai Marina Sunrise Ride", description: "A scenic sunrise community ride.", eventImage: "/img/490796704_1417267435941639_5633845168834004037_n. 1.png", eventDate: "2026-03-20", eventTime: "6:00 AM", endTime: "9:00 AM", address: "Dubai Marina", city: "Dubai", maxParticipants: 120, currentParticipants: 89, distance: 25, category: "Community Ride", status: "Open", rewards: { points: 0, badgeName: "" }, galleryImages: [] },
  { id: "al-ain-mountain-challenge", title: "Al Ain Mountain Challenge", description: "A demanding mountain cycling challenge.", eventImage: "/img/503933859_18364437631178203_8919788300453479084_n. 1.png", eventDate: "2026-03-28", eventTime: "6:30 AM", endTime: "12:00 PM", address: "Jebel Hafeet", city: "Al Ain", maxParticipants: 200, currentParticipants: 156, distance: 65, category: "Race", status: "Open", rewards: { points: 0, badgeName: "" }, galleryImages: [] },
];

const getCommunityId = (community?: CommunityApiResponse | null) =>
  community?._id || community?.id || "";

const getCommunityImage = (community?: CommunityApiResponse | null) =>
  community?.image ||
  community?.gallery?.[0] ||
  community?.logo ||
  FALLBACK_HERO_IMAGE;

const toNumber = (value: unknown) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatDate = (date?: string) => {
  if (!date) return "Date TBA";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date TBA";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
};

const titleCase = (value?: string, fallback = "TBA") =>
  (value || fallback)
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());


const getFaqs = (community: CommunityApiResponse, t: (key: string, options?: Record<string, unknown>) => string) => [
  t("public.communities.detail.faq.questions.join", { title: community.title }),
  t("public.communities.detail.faq.questions.location", { title: community.title }),
  t("public.communities.detail.faq.questions.rideType", { title: community.title }),
  t("public.communities.detail.faq.questions.members", { title: community.title }),
  t("public.communities.detail.faq.questions.posts", { title: community.title }),
  t("public.communities.detail.faq.questions.tracks", { title: community.title }),
];

function LoadingState() {
  const { t } = useTranslation();
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <p className="text-[22px] font-medium text-black/70">{t("public.communities.detail.loading")}</p>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <h1 className="text-[50px] font-normal uppercase">{TARGET_COMMUNITY_TITLE}</h1>
      <p className="mt-4 text-[20px] font-medium text-black/70">{message}</p>
    </main>
  );
}

function HeroSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const tag = community.category || titleCase(Array.isArray(community.type) ? community.type[0] : community.type, t("public.communities.detail.tba"));

  return (
    <section
      className="relative w-full overflow-hidden public-hero-bleed"
      style={{ height: "100vh", minHeight: 480 }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('${getCommunityImage(community)}')`,
        }}
        aria-hidden
      />
      <div className="public-hero-content-pos">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/30 px-5 py-2 text-[14px] font-medium text-white backdrop-blur sm:text-[16px]">
            {tag || t("public.common.communityFallback")}
          </span>
        </div>
        <h1 className="text-[34px] font-normal uppercase leading-tight text-white sm:text-[40px] lg:text-[50px]">
          {community.title}
        </h1>
      </div>
    </section>
  );
}

function AboutSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  return (
    <section className="px-10 py-24 text-center max-md:px-5 max-md:py-14 max-sm:px-4 max-sm:py-10">
      <h2 className="text-[28px] font-normal uppercase sm:text-[38px] md:text-[48px] lg:text-[60px]">{t("public.communities.detail.about.heading")}</h2>
      <p className="mx-auto mt-4 max-w-[851px] text-[14px] leading-relaxed sm:mt-6 sm:text-[17px] md:text-[20px] lg:text-[24px]">
        {community.description}
      </p>

      <Link to="/contact-us" className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[16px] font-bold text-white sm:mt-8 sm:px-8 sm:py-4 sm:text-[18px]">
        {t("public.communities.detail.about.joinButton")} <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
      </Link>
    </section>
  );
}

function StatsSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const tba = t("public.communities.detail.tba");
  const memberCount = toNumber(community.memberCount ?? community.stats?.members);
  const eventsOrganized = toNumber(
    (community as unknown as Record<string, unknown>).eventsOrganized ??
    community.upcomingEventCount ??
    community.eventsCount ??
    community.stats?.upcomingEvents,
  );
  const weeklyRides = community.weeklyRides || community.stats?.weeklyRides || tba;
  const avgGroupSize =
    ((community as unknown as Record<string, unknown>).avgGroupSize as string) ||
    ((community as unknown as Record<string, unknown>).stats as Record<string, unknown>)?.avgGroupSize as string ||
    tba;
  const distance = community.distance
    ? `${community.distance.toLocaleString()} km`
    : community.terrain || tba;

  return (
    <section className="mx-auto mb-16 max-w-[min(1192px,calc(100vw-2rem))] rounded-2xl bg-[#A2BFDB] p-4 lg:mb-32">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_210px_210px]">
        <div className="rounded-2xl bg-[#435974] p-5 text-white sm:p-8">
          <p className="text-[13px] text-white/70 sm:text-[14px]">• {t("public.communities.detail.stats.joinCommunityEyebrow")}</p>
          <div className="mt-4 sm:mt-8 sm:flex sm:gap-8">
            <h3 className="flex-1 text-[22px] font-bold uppercase leading-tight sm:text-[26px] lg:text-[32px]">
              {t("public.communities.detail.stats.growingFamily")}
            </h3>
            <div className="my-5 h-px bg-white/20 sm:my-0 sm:h-auto sm:w-px sm:self-stretch" />
            <div className="min-w-0 flex-1">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/60 sm:text-[12px]">
                {t("public.communities.detail.stats.communityStatsLabel")}
              </h4>
              <div className="mt-3 space-y-3 sm:mt-4">
                {[
                  [t("public.communities.detail.stats.weeklyRides"), weeklyRides],
                  [t("public.communities.detail.stats.avgGroupSize"), avgGroupSize === tba ? t("public.communities.detail.stats.avgGroupSizeFallback") : avgGroupSize],
                  [t("public.communities.detail.stats.totalDistance"), distance],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-2 text-[13px] sm:text-[14px]">
                    <span className="text-white/70">{label}</span>
                    <span className="font-bold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {[
          [String(memberCount), t("public.communities.detail.stats.activeMembers")],
          [String(eventsOrganized), t("public.communities.detail.stats.eventsOrganized")],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl bg-[#435974] p-5 text-white sm:p-8">
            <span className="inline-flex rounded-full bg-white p-3 text-[#019839] sm:p-4">
              <CalendarDays size={20} className="sm:hidden" />
              <CalendarDays size={25} className="hidden sm:block" />
            </span>
            <h3 className="mt-10 text-[28px] font-normal uppercase sm:mt-20 sm:text-[34px] lg:text-[40px]">{value}</h3>
            <p className="text-[14px] text-white/60 sm:text-[18px] lg:text-[20px]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventApiResponse }) {
  const { t, i18n } = useTranslation();
  const image =
    event.mainImage ||
    event.eventImage ||
    event.galleryImages?.[0] ||
    "/img/Frame 2147226042.png";
  const participants = event.currentParticipants ?? event.registrations ?? 0;
  const formattedParticipants = Number(participants).toLocaleString(i18n.language);

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
          <Users size={20} /> {t("public.common.participants", { count: participants, formattedCount: formattedParticipants })}
        </p>
        <p className="flex gap-2">
          <MapPin size={20} /> {event.city || event.address || t("public.communities.detail.locationTBA")}
        </p>
      </div>
    </div>
  );
}

function UpcomingEventsSection({ events }: { events: EventApiResponse[] }) {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-[1269px] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-16 md:px-10 lg:pb-28 lg:pt-20">
      <h2 className="mb-8 text-center text-[26px] font-normal uppercase sm:text-[34px] md:text-[42px] lg:text-[50px] lg:mb-16">{t("public.communities.detail.stats.upcomingEvents")}</h2>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event._id || event.id || event.title} event={event} />
        ))}
      </div>
    </section>
  );
}


function FaqSection({ community }: { community: CommunityApiResponse }) {
  const { t } = useTranslation();
  const faqs = getFaqs(community, t);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="w-full px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-16 md:px-10 lg:px-16 lg:pb-28 lg:pt-20 xl:px-20 2xl:px-24">
      <h2 className="text-[30px] font-normal uppercase sm:text-[38px] lg:text-[46px]">{t("public.communities.detail.faq.title")}</h2>
      <p className="mt-3 text-[15px] text-black/70 sm:text-[16px]">
        {t("public.communities.detail.faq.subtitle")}
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
                {t("public.communities.detail.faq.genericAnswer")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CommunityDetailPage() {
  const { t } = useTranslation();
  const { communityId = "" } = useParams<{ communityId: string }>();
  const selectedCommunityId = communityId.trim();
  const [community, setCommunity] = useState<CommunityApiResponse>(FALLBACK_COMMUNITY);
  const [events, setEvents] = useState<EventApiResponse[]>(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCommunityPage = async () => {
      setError("");

      try {
        if (selectedCommunityId) {
          setLoading(true);
          const selectedCommunity = await getCommunityById(selectedCommunityId);
          const relatedEvents = await getEventsPage({
            communityId: selectedCommunityId,
            status: "Upcoming",
            page: 1,
            limit: 3,
          });

          if (!cancelled) {
            setCommunity(selectedCommunity);
            setEvents(relatedEvents.events || []);
          }
          return;
        }

        const list = await getCommunities({
          search: TARGET_COMMUNITY_TITLE,
          isActive: true,
          isPublic: true,
          page: 1,
          limit: 10,
        });

        const matched =
          list.communities.find((item) => item.slug === TARGET_COMMUNITY_SLUG) ||
          list.communities.find(
            (item) => item.title.toLowerCase() === TARGET_COMMUNITY_TITLE.toLowerCase(),
          ) ||
          list.communities[0] ||
          null;

        if (!matched) {
          if (!cancelled) {
            setCommunity(FALLBACK_COMMUNITY);
            setEvents(FALLBACK_EVENTS);
          }
          return;
        }

        const communityId = getCommunityId(matched);
        const detailedCommunity = communityId ? await getCommunityById(communityId) : matched;
        const relatedEvents = communityId
          ? await getEventsPage({
              communityId,
              status: "Upcoming",
              page: 1,
              limit: 3,
            })
          : { events: [] };

        if (!cancelled) {
          setCommunity(detailedCommunity);
          setEvents(relatedEvents.events || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load cycling community page:", err);
          if (selectedCommunityId) {
            setError(t("public.communities.detail.errors.selectedLoadFailed"));
          } else {
            setCommunity(FALLBACK_COMMUNITY);
            setEvents(FALLBACK_EVENTS);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCommunityPage();

    return () => {
      cancelled = true;
    };
  }, [selectedCommunityId, t]);

  if (loading) return <LoadingState />;
  if (error || !community) return <ErrorState message={error || t("public.communities.detail.notFound")} />;

  return (
    <main className="font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      <HeroSection community={community} />
      <AboutSection community={community} />
      <StatsSection community={community} />
      {events.length > 0 && <UpcomingEventsSection events={events} />}
      {/* <FaqSection community={community} /> */}
    </main>
  );
}
