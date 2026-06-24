import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      <h1 className="text-[50px] font-normal uppercase">{TARGET_TRACK_TITLE}</h1>
      <p className="mt-4 text-[20px] font-medium text-black/70">{message}</p>
    </main>
  );
}

function HeroSection({ track }: { track: Track }) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(300px, 45vw, 500px)" }}
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
            {track.city || "Location TBA"}
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
  return (
    <section className="px-10 py-24 text-center max-md:px-5 max-md:py-14 max-sm:px-4 max-sm:py-10">
      <h2 className="text-[28px] font-normal uppercase sm:text-[38px] md:text-[48px] lg:text-[60px]">About This Track</h2>
      <p className="mx-auto mt-4 max-w-[851px] text-[14px] leading-relaxed sm:mt-6 sm:text-[17px] md:text-[20px] lg:text-[24px]">
        {track.shortDescription || (track as any).description || track.safetyNotes || "Track details are coming soon."}
      </p>

      <button className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[15px] font-bold text-white sm:mt-8 sm:px-8 sm:py-4 sm:text-[18px]">
        Start Ride <ArrowRight size={18} />
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
    <section className="mx-auto mb-16 grid max-w-[1108px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:mb-28 lg:grid-cols-[430px_repeat(3,1fr)]">
      <div className="rounded-2xl bg-[#435974] p-5 text-white sm:p-8">
        <p className="text-[13px] text-white/70 sm:text-[14px]">• Start Your Ride</p>
        <h3 className="mt-4 text-[22px] font-normal uppercase leading-tight sm:mt-8 sm:text-[30px] lg:text-[36px]">
          Track your progress with the ADCC app
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-3 text-[13px] text-white/80 sm:mt-8 sm:text-[14px]">
          <p>Safety Notes</p>
          <p>{track.safetyNotes || "Follow posted track guidance"}</p>
          <p>Helmet Required</p>
          <p>{track.helmetRequired ? "Yes" : "No"}</p>
          <p>Night Riding</p>
          <p>{track.nightRidingAllowed ? "Allowed" : "Not listed"}</p>
        </div>
      </div>

      {stats.map(([value, label]) => (
        <div key={label} className="rounded-xl bg-[#435974] p-5 text-white sm:p-8">
          <span className="inline-flex rounded-full bg-white p-3 text-[#019839] sm:p-4">
            <CalendarDays size={20} className="sm:hidden" />
            <CalendarDays size={25} className="hidden sm:block" />
          </span>
          <h3 className="mt-10 text-[22px] font-normal uppercase sm:mt-20 sm:text-[26px] lg:text-[30px]">{value}</h3>
          <p className="text-[13px] text-white/60 sm:text-[17px] lg:text-[20px]">{label}</p>
        </div>
      ))}
    </section>
  );
}

function FacilitiesSection({ facilities }: { facilities: FacilityCard[] }) {
  if (facilities.length === 0) return null;

  return (
    <section
      className="bg-cover bg-center bg-no-repeat px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:py-20"
      style={{
        backgroundImage: `url('${FACILITIES_BG}')`,
      }}
    >
      <div className="mx-auto max-w-[1268px]">
        <div className="flex justify-between gap-8 max-lg:flex-col">
          <h2 className="max-w-[580px] text-[26px] font-normal uppercase leading-tight sm:text-[34px] lg:text-[44px]">
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
  const eventId = event._id || event.id;

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

      <Link
        to={
          eventId
            ? `/user-event/${encodeURIComponent(eventId)}`
            : "/user-event"
        }
        className="mt-[27px] flex h-[50px] w-[157px] items-center justify-center rounded-[30px] border border-[#019839] bg-transparent text-[16px] font-bold capitalize leading-[22px] text-[#019839] transition-colors hover:bg-[#019839] hover:text-white"
      >
        View Details
      </Link>
    </div>
  );
}

function UpcomingEventsSection({ events }: { events: EventApiResponse[] }) {
  return (
    <section className="mx-auto max-w-[1269px] px-10 py-32 max-md:px-5 max-md:py-16 max-sm:px-4 max-sm:py-12">
      <h2 className="mb-8 text-center text-[26px] font-normal uppercase sm:text-[34px] md:text-[42px] lg:text-[50px] lg:mb-16">Upcoming Events</h2>

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggle = useCallback((idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  }, []);

  return (
    <section className="w-full px-4 pb-16 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
      <h2 className="text-[30px] font-normal uppercase sm:text-[38px] lg:text-[46px]">Frequently Asked Questions</h2>
      <p className="mt-3 text-[15px] text-black/70 sm:text-[16px]">Got questions before hitting the road? We've got you covered.</p>

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
            <div className="flex min-h-[68px] items-center justify-between gap-4 py-5 sm:min-h-[80px] sm:py-6">
              <span>{faq}</span>
              <Plus
                size={18}
                className="shrink-0 transition-transform duration-300"
                style={{ transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)" }}
              />
            </div>
            {openIndex === index && (
              <p className="pb-5 text-[14px] font-normal leading-6 text-black/65 sm:text-[15px]">
                For more information about this topic, please contact our support team or refer to the track guidelines.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TrackDetailPage() {
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
            setError("The selected track details could not be loaded right now.");
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
  }, [selectedTrackId]);

  const facilities = useMemo(() => normalizeFacilities(track), [track]);

  if (loading) return <LoadingState />;
  if (error || !track) return <ErrorState message={error || "Track not found."} />;

  return (
    <main className="font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      <HeroSection track={track} />
      <AboutSection track={track} />
      <StatsSection track={track} />
      <FacilitiesSection facilities={facilities} />
      <TrackMediaSection track={track} />
      <UpcomingEventsSection events={events} />
      <FaqSection track={track} />
      <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
        <Bike size={28} />
      </button>
    </main>
  );
}
