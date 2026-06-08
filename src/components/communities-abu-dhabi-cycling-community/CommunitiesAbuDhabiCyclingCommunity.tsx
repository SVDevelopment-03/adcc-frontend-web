import { useEffect, useMemo, useState } from "react";
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
      <h1 className="text-[50px] font-black uppercase">{TARGET_COMMUNITY_TITLE}</h1>
      <p className="mt-4 text-[20px] font-medium text-black/70">{message}</p>
    </main>
  );
}

function HeroSection({ community }: { community: CommunityApiResponse }) {
  const tag = community.category || titleCase(Array.isArray(community.type) ? community.type[0] : community.type);

  return (
    <section className="mx-auto max-w-[1272px] px-10 pt-0">
      <div
        className="relative h-[500px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('${getCommunityImage(
            community,
          )}')`,
        }}
      >
        <div className="absolute bottom-20 left-10 text-white">
          <span className="rounded-full bg-white/30 px-5 py-2">{tag || "Community"}</span>
          <h1 className="mt-4 text-[40px] font-black uppercase">{community.title}</h1>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ community }: { community: CommunityApiResponse }) {
  return (
    <section className="px-10 py-24 text-center">
      <h2 className="text-[60px] font-black uppercase">About This Community</h2>
      <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
        {community.description}
      </p>

      <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
        Join this Community <ArrowRight size={20} />
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
    <section className="mx-auto mb-32 grid max-w-[1108px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[610px_220px_220px]">
      <div className="grid rounded-2xl bg-[#435974] p-8 text-white md:grid-cols-[240px_1fr]">
        <div>
          <p className="text-white/70">• Join Community</p>
          <h3 className="mt-8 text-[40px] font-black uppercase leading-tight">
            Become part of {community.title}
          </h3>
        </div>

        <div className="mt-8 border-white/30 md:mt-0 md:border-l md:pl-10">
          <h4 className="text-[24px] font-black uppercase">Community Stats</h4>
          <div className="mt-6 space-y-5 text-[16px]">
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
        <div key={label} className="rounded-xl bg-[#435974] p-8 text-white">
          <span className="inline-flex rounded-full bg-white p-4 text-[#019839]">
            <CalendarDays size={25} />
          </span>
          <h3 className="mt-20 text-[30px] font-black uppercase">{value}</h3>
          <p className="text-[20px] text-white/60">{label}</p>
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

      <h3 className="mt-6 text-[26px] font-black uppercase">{event.title}</h3>

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
    <section className="mx-auto max-w-[1269px] px-10 pb-28">
      <h2 className="mb-16 text-center text-[50px] font-black uppercase">Upcoming Events</h2>

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
    <section className="bg-[#777] px-10 py-24">
      <h2 className="mb-16 text-center text-[50px] font-black uppercase text-white">
        Community Tracks
      </h2>

      {tracks.length === 0 ? (
        <p className="text-center text-[20px] font-medium text-white/80">
          No tracks are linked with this community yet.
        </p>
      ) : (
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 lg:grid-cols-3">
          {tracks.map((track, index) => (
            <div
              key={track._id || track.id || track.title}
              className={`rounded-xl p-3 ${
                index === 0 ? "bg-[#323232] text-white" : "bg-white text-black"
              }`}
            >
              <img
                src={track.image || FALLBACK_TRACK_IMAGE}
                alt={track.title || "Community track"}
                className="h-[363px] w-full rounded-lg object-cover"
              />

              <div className="p-4">
                <p className="flex gap-2 text-sm opacity-80">
                  <MapPin size={18} /> {track.city || "Location TBA"}
                </p>
                <h3 className="mt-4 text-[26px] font-black uppercase">
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

  return (
    <section className="mx-auto max-w-[1100px] px-10 py-32 text-center">
      <h2 className="text-[50px] font-black uppercase">Frequently Asked Questions</h2>
      <p className="mt-4 text-[18px]">
        Got questions before hitting the road? We have got you covered.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <button
            key={faq}
            className="flex min-h-[100px] items-center justify-between rounded-xl border border-[#ccc] px-7 text-left text-[22px] font-medium"
          >
            <span>
              {String(index + 1).padStart(2, "0")}. {faq}
            </span>
            <Plus size={24} />
          </button>
        ))}
      </div>
    </section>
  );
}

function AppCta({ community }: { community: CommunityApiResponse }) {
  return (
    <section
      className="flex h-[502px] items-center justify-center bg-cover bg-center px-10 text-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url('${getCommunityImage(
          community,
        )}')`,
      }}
    >
      <div>
        <h2 className="text-[80px] font-black uppercase">Start Your Ride Today</h2>
        <p className="mt-7 text-[26px]">
          Download the ADCC app and join {community.title}.
        </p>
        <div className="mt-10 flex justify-center gap-5 max-sm:flex-col">
          <button className="rounded-full bg-white px-9 py-4 text-black">
            <span className="block text-xs">GET IT ON</span> <b>Google Play</b>
          </button>
          <button className="rounded-full bg-white px-9 py-4 text-black">
            <span className="block text-xs">DOWNLOAD ON THE</span> <b>App Store</b>
          </button>
        </div>
      </div>
    </section>
  );
}

export default function CommunityDetailPage() {
  const [community, setCommunity] = useState<CommunityApiResponse | null>(null);
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadCommunityPage = async () => {
      setLoading(true);
      setError("");

      try {
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
            setCommunity(null);
            setEvents([]);
            setError("Community details are not available right now.");
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
          setCommunity(null);
          setEvents([]);
          setError("Community details could not be loaded right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCommunityPage();

    return () => {
      cancelled = true;
    };
  }, []);

  const tracks = useMemo(() => getTrackList(community), [community]);

  if (loading) return <LoadingState />;
  if (error || !community) return <ErrorState message={error || "Community not found."} />;

  return (
    <main className="min-h-screen bg-[#eaf4ff] text-black">
      <HeroSection community={community} />
      <AboutSection community={community} />
      <StatsSection community={community} />
      <UpcomingEventsSection events={events} />
      <TracksSection tracks={tracks} />
      <FaqSection community={community} />
      <AppCta community={community} />
      <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
        <Bike size={28} />
      </button>
    </main>
  );
}
