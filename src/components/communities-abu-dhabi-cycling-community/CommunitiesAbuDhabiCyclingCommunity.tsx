import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  ArrowRight,
  Bike,
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
  descriptionAr?: string;
};

const TARGET_COMMUNITY_TITLE = "Abu Dhabi Cycling Community";
const TARGET_COMMUNITY_SLUG = "abu-dhabi-cycling-community";
const FALLBACK_HERO_IMAGE = "/img/pexels-ander-garcia-1317358711-25016478 1.png";
const FALLBACK_TRACK_IMAGE = "/img/image 3049.png";

const FALLBACK_TRACKS: CommunityTrack[] = [
  { id: "dubai-marina-loop", title: "Dubai Marina Loop", city: "Abu Dhabi", distance: 25, difficulty: "Easy", trackType: "Loop", image: "/img/pexels-stephen-noulton-421904730-17272198 1 (1).png" },
  { id: "yas-island-circuit", title: "Yas Island Circuit", city: "Abu Dhabi", distance: 45, difficulty: "Intermediate", trackType: "Circuit", image: FALLBACK_TRACK_IMAGE },
  { id: "sharjah-corniche", title: "Sharjah Corniche", city: "Abu Dhabi", distance: 18, difficulty: "Easy", trackType: "Road", image: FALLBACK_TRACK_IMAGE },
];

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
  trackId: FALLBACK_TRACKS,
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

const titleCase = (value?: string) =>
  (value || "TBA")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getTrackList = (community?: CommunityApiResponse | null): CommunityTrack[] => {
  const tracks = community?.trackId;
  if (!tracks) return [];
  const list = Array.isArray(tracks) ? tracks : [tracks];

  return list
    .filter((track): track is CommunityTrack => typeof track === "object" && track !== null)
    .filter((track) => track.title || track._id || track.id);
};

const getFaqs = (community: CommunityApiResponse) => [
  `How do I join ${community.title}?`,
  `Where is ${community.title} based?`,
  `What type of rides does ${community.title} organize?`,
  `How many members are active in ${community.title}?`,
  `Are posts enabled for ${community.title}?`,
  `Which tracks are linked with ${community.title}?`,
];

function LoadingState() {
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <p className="text-[22px] font-medium text-black/70">Loading community details...</p>
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
  const tag = community.category || titleCase(Array.isArray(community.type) ? community.type[0] : community.type);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(300px, 45vw, 500px)" }}
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
            {tag || "Community"}
          </span>
        </div>
        <h1 className="text-[30px] font-normal uppercase leading-tight text-white sm:text-[40px] lg:text-[50px]">
          {community.title}
        </h1>
      </div>
    </section>
  );
}

function AboutSection({ community }: { community: CommunityApiResponse }) {
  return (
    <section className="px-10 py-24 text-center max-md:px-5 max-md:py-14 max-sm:px-4 max-sm:py-10">
      <h2 className="text-[28px] font-normal uppercase sm:text-[38px] md:text-[48px] lg:text-[60px]">About This Community</h2>
      <p className="mx-auto mt-4 max-w-[851px] text-[14px] leading-relaxed sm:mt-6 sm:text-[17px] md:text-[20px] lg:text-[24px]">
        {community.description}
      </p>

      <button className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[15px] font-bold text-white sm:mt-8 sm:px-8 sm:py-4 sm:text-[18px]">
        Join this Community <ArrowRight size={18} />
      </button>
    </section>
  );
}

function StatsSection({ community }: { community: CommunityApiResponse }) {
  const memberCount = toNumber(community.memberCount ?? community.stats?.members);
  const upcomingEventCount = toNumber(
    community.upcomingEventCount ?? community.eventsCount ?? community.stats?.upcomingEvents,
  );
  const weeklyRides = community.weeklyRides || community.stats?.weeklyRides || "TBA";
  const ridesThisMonth = community.ridesThisMonth || community.stats?.ridesThisMonth || "TBA";
  const distance = community.distance ? `${community.distance} km` : community.terrain || "TBA";

  return (
    <section className="mx-auto mb-16 grid max-w-[1108px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:mb-32 lg:grid-cols-[610px_220px_220px]">
      <div className="grid rounded-2xl bg-[#435974] p-5 text-white sm:p-8 md:grid-cols-[240px_1fr]">
        <div>
          <p className="text-[13px] text-white/70 sm:text-[14px]">• Join Community</p>
          <h3 className="mt-4 text-[22px] font-normal uppercase leading-tight sm:mt-8 sm:text-[30px] lg:text-[36px]">
            Become part of {community.title}
          </h3>
        </div>

        <div className="mt-5 border-white/30 sm:mt-8 md:mt-0 md:border-l md:pl-10">
          <h4 className="text-[17px] font-normal uppercase sm:text-[20px] lg:text-[24px]">Community Stats</h4>
          <div className="mt-4 space-y-3 text-[13px] sm:mt-6 sm:space-y-5 sm:text-[16px]">
            <p className="flex justify-between">
              <span>Weekly Rides</span>
              <b>{weeklyRides}</b>
            </p>
            <p className="flex justify-between">
              <span>Rides This Month</span>
              <b>{ridesThisMonth}</b>
            </p>
            <p className="flex justify-between">
              <span>Distance / Terrain</span>
              <b>{distance}</b>
            </p>
          </div>
        </div>
      </div>

      {[
        [String(memberCount), "Active Members"],
        [String(upcomingEventCount), "Upcoming Events"],
      ].map(([value, label]) => (
        <div key={label} className="rounded-xl bg-[#435974] p-5 text-white sm:p-8">
          <span className="inline-flex rounded-full bg-white p-3 text-[#019839] sm:p-4">
            <CalendarDays size={20} className="sm:hidden" />
            <CalendarDays size={25} className="hidden sm:block" />
          </span>
          <h3 className="mt-10 text-[22px] font-normal uppercase sm:mt-20 sm:text-[28px]">{value}</h3>
          <p className="text-[14px] text-white/60 sm:text-[18px]">{label}</p>
        </div>
      ))}
    </section>
  );
}

function EventCard({ event }: { event: EventApiResponse }) {
  const image =
    event.eventImage ||
    event.mainImage ||
    event.galleryImages?.[0] ||
    "/img/Frame 2147226042.png";
  const participants = event.currentParticipants ?? event.registrations ?? 0;

  return (
    <div>
      <div className="relative h-[397px] overflow-hidden rounded-[14px] bg-white">
        <img src={image} alt={event.title} className="h-full w-full object-cover" />
        <span className="absolute right-6 top-6 rounded-full bg-black/40 px-6 py-2 text-white">
          {event.category || "Event"}
        </span>
      </div>

      <h3 className="mt-6 text-[26px] font-normal uppercase">{event.title}</h3>

      <div className="mt-5 grid grid-cols-2 gap-y-4 text-[18px] text-black/70">
        <p className="flex gap-2">
          <CalendarDays size={20} /> {formatDate(event.eventDate)}
        </p>
        <p className="flex gap-2">
          <Gauge size={20} />{" "}
          {typeof event.distance === "number" ? `${event.distance} km` : "Distance TBA"}
        </p>
        <p className="flex gap-2">
          <Users size={20} /> {participants} participants
        </p>
        <p className="flex gap-2">
          <MapPin size={20} /> {event.city || event.address || "Location TBA"}
        </p>
      </div>
    </div>
  );
}

function UpcomingEventsSection({ events }: { events: EventApiResponse[] }) {
  return (
    <section className="mx-auto max-w-[1269px] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-16 md:px-10 lg:pb-28 lg:pt-20">
      <h2 className="mb-8 text-center text-[26px] font-normal uppercase sm:text-[34px] md:text-[42px] lg:text-[50px] lg:mb-16">Upcoming Events</h2>

      {events.length === 0 ? (
        <p className="text-center text-[20px] font-medium text-black/60">
          No upcoming events are linked with this community yet.
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

function TracksSection({ tracks }: { tracks: CommunityTrack[] }) {
  return (
    <section className="bg-[#777] px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:py-24">
      <h2 className="mb-8 text-center text-[26px] font-normal uppercase text-white sm:text-[34px] md:text-[42px] lg:text-[50px] lg:mb-16">
        Community Tracks
      </h2>

      {tracks.length === 0 ? (
        <p className="text-center text-[20px] font-medium text-white/80">
          No tracks are linked with this community yet.
        </p>
      ) : (
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 lg:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={track._id || track.id || track.title}
              className="group flex min-h-[645px] flex-col rounded-xl bg-[#FFFFFF] p-3 text-black transition-colors duration-300 hover:bg-[#323232] hover:text-white"
            >
              <img
                src={track.image || FALLBACK_TRACK_IMAGE}
                alt={track.title || "Community track"}
                className="h-[363px] w-full rounded-lg object-cover"
              />

              <div className="flex flex-1 flex-col p-4">
                <p className="flex gap-2 text-sm opacity-80">
                  <MapPin size={18} /> {track.city || "Location TBA"}
                </p>
                <h3 className="mt-4 text-[26px] font-normal uppercase">
                  {track.title || "Untitled Track"}
                </h3>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Distance", typeof track.distance === "number" ? `${track.distance} km` : "TBA"],
                    ["Type", track.trackType || track.category || "TBA"],
                    ["Level", titleCase(track.difficulty)],
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

                <button
                  type="button"
                  className="mt-[30px] flex h-[50px] w-[157px] items-center justify-center rounded-[30px] border border-black/50 bg-transparent text-[16px] font-bold capitalize leading-[22px] text-black/50 transition-colors duration-300 group-hover:border-[#019839] group-hover:bg-[#019839] group-hover:text-white"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function FaqSection({ community }: { community: CommunityApiResponse }) {
  const faqs = getFaqs(community);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="w-full px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-16 md:px-10 lg:px-16 lg:pb-28 lg:pt-20 xl:px-20 2xl:px-24">
      <h2 className="text-[30px] font-normal uppercase sm:text-[38px] lg:text-[46px]">Frequently Asked Questions</h2>
      <p className="mt-3 text-[15px] text-black/70 sm:text-[16px]">
        Got questions before hitting the road? We've got you covered.
      </p>

      <div className="mx-auto mt-8 grid max-w-[1098px] grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 md:gap-5">
        {faqs.map((faq, index) => (
          <div
            key={faq}
            role="button"
            tabIndex={0}
            onClick={() => toggle(index)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") toggle(index); }}
            className="cursor-pointer rounded-lg border border-[#cad8e6] bg-[#eef7ff] px-4 text-left text-[15px] font-medium sm:px-7 sm:text-[16px]"
            style={{ fontFamily: "'Outfit', 'Satoshi', sans-serif" }}
          >
            <div className="flex min-h-17 items-center justify-between gap-4 py-5 sm:min-h-20 sm:py-6">
              <span>{faq}</span>
              <Plus
                size={18}
                className="shrink-0 transition-transform duration-300"
                style={{ transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)" }}
              />
            </div>
            {openIndex === index && (
              <p className="pb-5 text-[14px] font-normal leading-6 text-black/65 sm:text-[15px]">
                For more information, please contact our community team or check the community guidelines.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CommunityDetailPage() {
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
            setError("The selected community details could not be loaded right now.");
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
  }, [selectedCommunityId]);

  const tracks = useMemo(() => getTrackList(community), [community]);

  if (loading) return <LoadingState />;
  if (error || !community) return <ErrorState message={error || "Community not found."} />;

  return (
    <main className="font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      <HeroSection community={community} />
      <AboutSection community={community} />
      <StatsSection community={community} />
      <UpcomingEventsSection events={events} />
      <TracksSection tracks={tracks} />
      <FaqSection community={community} />
      <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
        <Bike size={28} />
      </button>
    </main>
  );
}
