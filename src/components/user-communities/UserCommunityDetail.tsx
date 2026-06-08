import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const titleCase = (value?: string) =>
  (value || "TBA")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

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
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <p className="text-[22px] font-medium text-black/70">Loading community details...</p>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <h1 className="text-[50px] font-black uppercase">Community Details</h1>
      <p className="mt-4 text-[20px] font-medium text-black/70">{message}</p>
      <button
        type="button"
        onClick={() => navigate("/user-communities")}
        className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white"
      >
        <ArrowLeft size={20} /> Back to Communities
      </button>
    </main>
  );
}

function HeroSection({ community }: { community: CommunityApiResponse }) {
  const tag = community.category || titleCase(Array.isArray(community.type) ? community.type[0] : community.type);
  const location = community.location || community.city || community.area || "Location TBA";

  return (
    <section className="mx-auto max-w-[1272px] px-10">
      <div
        className="relative h-[500px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url('${getCommunityImage(
            community,
          )}')`,
        }}
      >
        <div className="absolute bottom-20 left-10 text-white">
          <div className="mb-3 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/30 px-5 py-2 backdrop-blur">{tag}</span>
            <span className="rounded-full bg-white/30 px-5 py-2 backdrop-blur">{location}</span>
          </div>
          <h1 className="max-w-[820px] text-[40px] font-black uppercase leading-none">
            {community.title}
          </h1>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ community }: { community: CommunityApiResponse }) {
  const type = Array.isArray(community.type) ? community.type.join(", ") : community.type;

  return (
    <section className="mx-auto grid max-w-[1268px] grid-cols-1 items-start gap-12 px-10 py-24 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div>
        <h2 className="text-[60px] font-black uppercase leading-none">About This Community</h2>
        <p className="mt-8 max-w-[820px] text-[24px] leading-[30px]">{community.description}</p>
        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
          Join this Community <ArrowRight size={20} />
        </button>
      </div>

      <div className="rounded-2xl bg-[#435974] p-8 text-white">
        <h3 className="text-[28px] font-black uppercase">Community Info</h3>
        <div className="mt-7 space-y-5 text-[18px] text-white/80">
          <p className="flex justify-between gap-6">
            <span>Type</span>
            <b className="text-right text-white">{type || "TBA"}</b>
          </p>
          <p className="flex justify-between gap-6">
            <span>Category</span>
            <b className="text-right text-white">{community.category || "TBA"}</b>
          </p>
          <p className="flex justify-between gap-6">
            <span>Manager</span>
            <b className="text-right text-white">{community.manager || "TBA"}</b>
          </p>
          <p className="flex justify-between gap-6">
            <span>Founded</span>
            <b className="text-right text-white">{community.foundedYear || "TBA"}</b>
          </p>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ community }: { community: CommunityApiResponse }) {
  const stats = [
    {
      icon: Users,
      value: formatNumber(community.memberCount ?? community.stats?.members),
      label: "Active Members",
    },
    {
      icon: CalendarDays,
      value: formatNumber(community.upcomingEventCount ?? community.eventsCount ?? community.stats?.upcomingEvents),
      label: "Upcoming Events",
    },
    {
      icon: Bike,
      value: String(community.weeklyRides ?? community.stats?.weeklyRides ?? "TBA"),
      label: "Weekly Rides",
    },
    {
      icon: Flag,
      value: String(community.ridesThisMonth ?? community.stats?.ridesThisMonth ?? "TBA"),
      label: "Rides This Month",
    },
  ];

  return (
    <section className="mx-auto mb-24 grid max-w-[1192px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <article key={label} className="rounded-xl bg-[#435974] p-8 text-white">
          <span className="inline-flex rounded-full bg-white p-4 text-[#019839]">
            <Icon size={25} />
          </span>
          <h3 className="mt-16 text-[30px] font-black uppercase">{value}</h3>
          <p className="text-[20px] text-white/60">{label}</p>
        </article>
      ))}
    </section>
  );
}

function LocationSection({ community }: { community: CommunityApiResponse }) {
  const details = [
    ["Location", community.location],
    ["City", community.city],
    ["Area", community.area],
    ["Country", community.country],
    ["Purpose", community.purposeType],
    ["Terrain", community.terrain],
  ].filter(([, value]) => value);

  if (details.length === 0) return null;

  return (
    <section className="bg-[#d8ebff] px-10 py-20">
      <div className="mx-auto max-w-[1268px]">
        <h2 className="text-center text-[50px] font-black uppercase">Community Details</h2>
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-white p-7">
              <p className="text-[16px] font-medium text-black/50">{label}</p>
              <h3 className="mt-3 text-[24px] font-black uppercase">{value}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TracksSection({ tracks }: { tracks: CommunityTrack[] }) {
  if (tracks.length === 0) return null;

  return (
    <section className="bg-[#777] px-10 py-24">
      <h2 className="mb-16 text-center text-[50px] font-black uppercase text-white">
        Linked Tracks
      </h2>
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 lg:grid-cols-3">
        {tracks.map((track, index) => (
          <article
            key={track._id || track.id || track.title}
            className={`rounded-xl p-3 transition-colors duration-200 ${
              index === 0
                ? "bg-[#435974] text-white hover:bg-[#323232]"
                : "bg-white text-black hover:bg-[#323232] hover:text-white"
            }`}
          >
            <img
              src={resolveAsset(track.image) || FALLBACK_TRACK_IMAGE}
              alt={track.title || "Community track"}
              className="h-[300px] w-full rounded-lg object-cover"
            />
            <div className="p-4">
              <p className="flex gap-2 text-sm opacity-80">
                <MapPin size={18} /> {track.city || "Location TBA"}
              </p>
              <h3 className="mt-4 text-[26px] font-black uppercase">{track.title || "Track"}</h3>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Distance", typeof track.distance === "number" ? `${track.distance} km` : "TBA"],
                  ["Type", track.trackType || track.category || "TBA"],
                  ["Level", titleCase(track.difficulty)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded border border-white/20 bg-[#323232] p-3 text-white">
                    <p className="text-[14px]">{label}</p>
                    <b className="text-[16px]">{value}</b>
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventCard({ event }: { event: EventApiResponse }) {
  const image = event.eventImage || event.mainImage || event.galleryImages?.[0] || FALLBACK_EVENT_IMAGE;
  const participants = event.currentParticipants ?? event.registrations ?? 0;

  return (
    <article>
      <div className="relative h-[360px] overflow-hidden rounded-[14px] bg-white">
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
          <Gauge size={20} /> {typeof event.distance === "number" ? `${event.distance} km` : "Distance TBA"}
        </p>
        <p className="flex gap-2">
          <Users size={20} /> {participants} participants
        </p>
        <p className="flex gap-2">
          <MapPin size={20} /> {event.city || event.address || "Location TBA"}
        </p>
      </div>
    </article>
  );
}

function EventsSection({ events }: { events: EventApiResponse[] }) {
  return (
    <section className="mx-auto max-w-[1269px] px-10 py-28">
      <h2 className="mb-16 text-center text-[50px] font-black uppercase">Community Events</h2>
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

function GallerySection({ community }: { community: CommunityApiResponse }) {
  const images = (community.gallery || []).map(resolveAsset).filter(Boolean);
  if (images.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1268px] px-10 pb-28">
      <h2 className="mb-12 text-center text-[50px] font-black uppercase">Gallery</h2>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {images.slice(0, 6).map((image, index) => (
          <div key={image} className="relative h-[260px] overflow-hidden rounded-xl bg-black/10">
            <img src={image} alt={`${community.title} gallery ${index + 1}`} className="h-full w-full object-cover" />
          </div>
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
        <h2 className="text-[80px] font-black uppercase leading-none">Start Your Ride Today</h2>
        <p className="mt-7 text-[26px]">Download the ADCC app and join {community.title}.</p>
      </div>
    </section>
  );
}

export default function UserCommunityDetail() {
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
        setError("Community ID is missing.");
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
          setError("Community details could not be loaded right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCommunity();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const tracks = useMemo(() => normalizeTracks(community), [community]);

  if (loading) return <LoadingState />;
  if (error || !community) return <ErrorState message={error || "Community not found."} />;

  return (
    <main className="min-h-screen bg-[#eaf4ff] text-black">
      <div className="mx-auto max-w-[1272px] px-10 pb-6">
        <button
          type="button"
          onClick={() => navigate("/user-communities")}
          className="inline-flex items-center gap-2 text-[18px] font-bold text-[#019839]"
        >
          <ArrowLeft size={20} /> Back to Communities
        </button>
      </div>
      <HeroSection community={community} />
      <AboutSection community={community} />
      <StatsSection community={community} />
      <LocationSection community={community} />
      <TracksSection tracks={tracks} />
      <EventsSection events={events} />
      <GallerySection community={community} />
      <AppCta community={community} />
      <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
        <ImageIcon size={28} />
      </button>
    </main>
  );
}
