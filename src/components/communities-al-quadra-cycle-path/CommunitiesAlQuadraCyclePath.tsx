import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bike,
  CalendarDays,
  Cross,
  Droplets,
  Gauge,
  MapPin,
  ParkingCircle,
  Plus,
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

const getTrackId = (track?: Track | null) => ((track as any)?._id || track?.id || "") as string;

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

const getFaqs = (track: Track) => [
  `Where is ${track.title} located?`,
  `What is the distance of ${track.title}?`,
  `What is the difficulty level of ${track.title}?`,
  `Is helmet use required on ${track.title}?`,
  `Can I ride ${track.title} at night?`,
  `Which facilities are available on ${track.title}?`,
];

function LoadingState() {
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <p className="text-[22px] font-medium text-black/70">Loading track details...</p>
    </main>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center text-black">
      <h1 className="text-[50px] font-black uppercase">{TARGET_TRACK_TITLE}</h1>
      <p className="mt-4 text-[20px] font-medium text-black/70">{message}</p>
    </main>
  );
}

function HeroSection({ track }: { track: Track }) {
  return (
    <section className="mx-auto max-w-[1272px] px-10">
      <div
        className="relative h-[500px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('${getTrackImage(
            track,
          )}')`,
        }}
      >
        <div className="absolute bottom-20 left-10 text-white">
          <div className="mb-3 flex gap-3">
            <span className="rounded-full bg-white/30 px-5 py-2">
              {track.city || "Location TBA"}
            </span>
            <span className="rounded-full bg-white/30 px-5 py-2">
              {titleCase(track.trackType)}
            </span>
          </div>
          <h1 className="text-[40px] font-black uppercase">{track.title}</h1>
        </div>
      </div>
    </section>
  );
}

function AboutSection({ track }: { track: Track }) {
  return (
    <section className="px-10 py-24 text-center">
      <h2 className="text-[60px] font-black uppercase">About This Track</h2>
      <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
        {track.shortDescription || (track as any).description || track.safetyNotes || "Track details are coming soon."}
      </p>

      <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
        Start Ride <ArrowRight size={20} />
      </button>
    </section>
  );
}

function StatsSection({ track }: { track: Track }) {
  const stats = [
    [`${track.distance ?? "TBA"}${typeof track.distance === "number" ? " km" : ""}`, "Distance"],
    [titleCase(track.difficulty), "Level"],
    [titleCase(track.trackType), "Type"],
  ];

  return (
    <section className="mx-auto mb-28 grid max-w-[1108px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[430px_repeat(3,1fr)]">
      <div className="rounded-2xl bg-[#435974] p-8 text-white">
        <p className="text-white/70">• Start Your Ride</p>
        <h3 className="mt-8 text-[40px] font-black uppercase leading-tight">
          Track your progress with the ADCC app
        </h3>

        <div className="mt-8 grid grid-cols-2 gap-3 text-[14px] text-white/80">
          <p>Safety Notes</p>
          <p>{track.safetyNotes || "Follow posted track guidance"}</p>
          <p>Helmet Required</p>
          <p>{track.helmetRequired ? "Yes" : "No"}</p>
          <p>Night Riding</p>
          <p>{track.nightRidingAllowed ? "Allowed" : "Not listed"}</p>
        </div>
      </div>

      {stats.map(([value, label]) => (
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

function FacilitiesSection({ facilities }: { facilities: FacilityCard[] }) {
  if (facilities.length === 0) return null;

  return (
    <section
      className="bg-cover bg-center bg-no-repeat px-10 py-20"
      style={{
        backgroundImage: `url('${FACILITIES_BG}')`,
      }}
    >
      <div className="mx-auto max-w-[1268px]">
        <div className="flex justify-between gap-8 max-lg:flex-col">
          <h2 className="max-w-[580px] text-[50px] font-black uppercase leading-tight">
            Everything You Need for a Seamless Ride Experience
          </h2>
          <button className="h-fit rounded-full bg-[#019839] px-8 py-4 font-bold text-white">
            Get in Touch
          </button>
        </div>

        <div className="mt-14 flex gap-5 overflow-x-auto pb-4">
          {facilities.map(({ title, icon: Icon, active }) => (
            <div
              key={title}
              className={`min-w-[260px] rounded-xl p-5 ${
                active ? "bg-white text-[#333]" : "bg-white/30 text-white"
              }`}
            >
              <div className="flex items-center gap-5">
                <span
                  className={`rounded-lg p-3 ${
                    active ? "bg-[#019839] text-white" : "bg-white text-[#333]"
                  }`}
                >
                  <Icon size={26} />
                </span>
                <b className="text-[20px]">{title}</b>
              </div>
              {active && <div className="mt-5 h-[5px] bg-[#019839]" />}
            </div>
          ))}
        </div>
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
  const image =
    event.eventImage ||
    event.mainImage ||
    event.galleryImages?.[0] ||
    FALLBACK_EVENT_IMAGE;
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
    <section className="mx-auto max-w-[1269px] px-10 py-32">
      <h2 className="mb-16 text-center text-[50px] font-black uppercase">Upcoming Events</h2>

      {events.length === 0 ? (
        <p className="text-center text-[20px] font-medium text-black/60">
          No upcoming events are linked with this track yet.
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
  const faqs = getFaqs(track);

  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-32 text-center">
      <h2 className="text-[50px] font-black uppercase">Frequently Asked Questions</h2>
      <p className="mt-4 text-[18px]">Got questions before hitting the road? We have got you covered.</p>

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

function AppCta({ track }: { track: Track }) {
  return (
    <section
      className="flex h-[502px] items-center justify-center bg-cover bg-center px-10 text-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url('${getTrackImage(
          track,
        )}')`,
      }}
    >
      <div>
        <h2 className="text-[80px] font-black uppercase">Start Your Ride Today</h2>
        <p className="mt-7 text-[26px]">Download the ADCC app and ride {track.title}.</p>
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

export default function TrackDetailPage() {
  const [track, setTrack] = useState<Track | null>(null);
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadTrackPage = async () => {
      setLoading(true);
      setError("");

      try {
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
            setTrack(null);
            setEvents([]);
            setError("Track details are not available right now.");
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
          setTrack(null);
          setEvents([]);
          setError("Track details could not be loaded right now.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTrackPage();

    return () => {
      cancelled = true;
    };
  }, []);

  const facilities = useMemo(() => normalizeFacilities(track), [track]);

  if (loading) return <LoadingState />;
  if (error || !track) return <ErrorState message={error || "Track not found."} />;

  return (
    <main className="min-h-screen bg-[#eaf4ff] text-black">
      <HeroSection track={track} />
      <AboutSection track={track} />
      <StatsSection track={track} />
      <FacilitiesSection facilities={facilities} />
      <TrackMediaSection track={track} />
      <UpcomingEventsSection events={events} />
      <FaqSection track={track} />
      <AppCta track={track} />
      <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
        <Bike size={28} />
      </button>
    </main>
  );
}
