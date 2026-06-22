import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
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
import { useParams } from "react-router-dom";
import { EventApiResponse, getEventById, getEventsPage } from "../../services/eventsApi";

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

const formatDate = (date?: string) => {
  if (!date) return "Date TBA";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Date TBA";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(parsed);
};

const formatFee = (event?: GrandPrixEvent | null) => {
  if (!event) return "Loading";
  if (event.registrationFeeType !== "paid") return "Free";
  const amount = event.registrationFeeAmount ?? 0;
  return amount > 0 ? `AED ${amount}` : "Paid";
};

const getImage = (event?: GrandPrixEvent | null) =>
  event?.mainImage || event?.eventImage || event?.galleryImages?.[0] || FALLBACK_HERO_IMAGE;

const getParticipants = (event?: GrandPrixEvent | null) =>
  event?.currentParticipants ?? event?.registrations ?? 0;

const getLevel = (event?: GrandPrixEvent | null) => {
  if (!event) return "Level TBA";
  if (event.difficulty) return event.difficulty;
  const eligibility = Array.isArray(event.eligibility)
    ? event.eligibility[0]
    : event.eligibility;
  return eligibility?.experienceLevel || eligibility?.experinceLevel || "All Levels";
};

const titleCase = (value: string) =>
  value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getStats = (event?: GrandPrixEvent | null): StatCard[] => [
  { icon: CalendarDays, title: formatDate(event?.eventDate), label: "Date" },
  {
    icon: MapPin,
    title: typeof event?.distance === "number" ? `${event.distance} km` : "TBA",
    label: "Distance",
  },
  {
    icon: Users,
    title: `${getParticipants(event)} riders`,
    label: "Participants",
  },
  { icon: Trophy, title: titleCase(getLevel(event)), label: "Level" },
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

const getSchedule = (event?: GrandPrixEvent | null): ScheduleItem[] => {
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
      time: event.eventTime || "Time TBA",
      title: "Event Start",
      description: event.address || event.city || "Location TBA",
    },
    ...(event.endTime
      ? [
          {
            time: event.endTime,
            title: "Event End",
            description: event.status ? `Current status: ${titleCase(event.status)}` : "",
          },
        ]
      : []),
  ];
};

const getFaqs = (event?: GrandPrixEvent | null) => {
  if (!event) return [];
  const fee = formatFee(event);
  const level = titleCase(getLevel(event));
  const location = event.city || event.address || "the event location";
  return [
    `When is ${event.title} scheduled?`,
    `Where is ${event.title} taking place?`,
    `What is the ${level} rider level for this event?`,
    `Is registration ${fee.toLowerCase()} for ${event.title}?`,
    `How many riders can participate in ${event.title}?`,
    `What should I know before riding in ${location}?`,
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
      font-family: 'Bebas Kai', sans-serif;
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
      width: min(1268px, calc(100vw - 32px));
      margin: 0 auto;
    }

    .public-layout-content > div.grand-prix-page > section.grand-prix-section {
      display: block !important;
    }

  `}</style>
);

function HeroSection({ event }: { event: GrandPrixEvent }) {
  const tags = [event.category, event.city].filter(Boolean);

  return (
    <section className="grand-prix-section grand-prix-shell pt-0">
      <div className="relative h-[500px] overflow-hidden bg-[#111] max-md:h-[420px]">
        <img
          src={getImage(event)}
          alt={event.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute bottom-[102px] left-[43px] flex gap-[10px] max-sm:left-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/30 px-[21px] py-2 text-[16px] font-medium leading-5 text-white backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="grand-prix-bebas absolute bottom-[56px] left-[43px] text-[40px] uppercase leading-none text-white max-sm:left-5 max-sm:text-[34px]">
          {event.title}
        </h1>
      </div>
    </section>
  );
}

function AboutSection({ event }: { event: GrandPrixEvent }) {
  return (
    <section className="grand-prix-section px-4 pt-[103px] text-center">
      <h2 className="grand-prix-bebas text-[60px] uppercase leading-[72px] max-md:text-[44px] max-md:leading-[52px]">
        About This Event
      </h2>
      <p className="mx-auto mt-[23px] max-w-[851px] text-[24px] font-normal leading-[30px] text-black max-md:text-[18px] max-md:leading-[28px]">
        {event.description}
      </p>
      <button
        type="button"
        className="mt-5 inline-flex h-[49px] items-center justify-center gap-[14px] rounded-full bg-[#019839] px-[28px] text-[18px] font-bold leading-none text-white transition hover:bg-[#017a2e]"
      >
        Join this Event
        <ArrowRight className="h-5 w-5" />
      </button>
    </section>
  );
}

function RegisterCard({ event }: { event: GrandPrixEvent }) {
  const total = event.maxParticipants ?? 0;
  const joined = getParticipants(event);
  const spotsText =
    total > 0 ? `${Math.max(total - joined, 0)} spots available` : "Open registration";

  return (
    <article className="relative h-[236px] w-[426px] shrink-0 rounded-2xl bg-[#435974] text-white max-sm:w-[calc(100vw-56px)]">
      <p className="absolute left-6 top-[19px] flex items-center gap-[7px] text-[18px] font-medium leading-[23px]">
        <span className="h-[9px] w-[9px] rounded-full bg-white" />
        Register Now
      </p>

      <h3 className="grand-prix-bebas absolute left-6 top-[66px] text-[50px] uppercase leading-[36px]">
        {formatFee(event)}
      </h3>
      <p className="absolute left-6 top-[110px] text-[14px] leading-5 text-white/60">
        {spotsText}
      </p>

      <div className="absolute bottom-[14px] left-6 right-6 h-[71px] border-t border-white/10">
        <span className="absolute left-[13px] top-[31px] flex items-center gap-[7px] text-[16px] font-medium leading-5">
          <span className="h-[9px] w-[9px] rounded-full bg-white" />
          Organized by
        </span>
        <div className="absolute right-0 top-[17px] flex h-12 items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839]">
            <Bike className="h-5 w-5" />
          </span>
          <b className="grand-prix-bebas text-[40px] leading-[48px]">ADCC</b>
        </div>
      </div>

      <button
        type="button"
        aria-label="Save event"
        className="absolute right-6 top-4 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[#C12D32]"
      >
        <Heart className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label="Share event"
        className="absolute right-6 top-[75px] flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[#019839]"
      >
        <Share2 className="h-6 w-6" />
      </button>
    </article>
  );
}

function StatsStrip({ event, stats }: { event: GrandPrixEvent; stats: StatCard[] }) {
  return (
    <section className="grand-prix-section mx-auto mt-[60px] h-[270px] w-[1192px] max-w-[calc(100vw-32px)] overflow-x-auto rounded-2xl bg-[#323232] p-[17px] lg:overflow-visible">
      <div className="flex w-max gap-3">
        <RegisterCard event={event} />
        {stats.map(({ icon: Icon, title, label }) => (
          <article
            key={title}
            className="relative h-[236px] w-[171px] shrink-0 overflow-hidden rounded-[10px] bg-[#435974] text-white"
          >
            <span className="absolute left-5 top-5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[#019839]">
              <Icon className="h-[25px] w-[25px]" />
            </span>
            <h3 className="grand-prix-bebas absolute left-5 top-[155px] whitespace-nowrap text-[30px] uppercase leading-[36px]">
              {title}
            </h3>
            <p className="absolute left-5 top-[191px] text-[20px] leading-[25px] text-white/60">
              {label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function FacilitiesSection({ facilities }: { facilities: Facility[] }) {
  if (facilities.length === 0) return null;

  return (
    <section
        className="grand-prix-section mt-[130px] bg-cover bg-center bg-no-repeat py-16 text-white"
      style={{ backgroundImage: "url('/img/image 3518.png')" }}
    >
      {/* <div className="grand-prix-shell relative h-full"> */}
      {/* <div className="grand-prix-shell relative "> */}
      <div className="grand-prix-shell relative px-4">
        <div className="flex items-start justify-between pt-16 max-lg:flex-col max-lg:gap-8 max-lg:pt-0">
          <h2 className="grand-prix-bebas max-w-[579px] text-[50px] uppercase leading-[60px] text-[#000000] max-md:text-[38px] max-md:leading-[46px]">
            Everything You Need for a Seamless Ride Experience
          </h2>
          <button
            type="button"
            className="mt-[35px] inline-flex h-[50px] items-center justify-center gap-[14px] rounded-full bg-[#019839] px-[27px] text-[18px] font-bold leading-none text-white transition hover:bg-[#017a2e] max-lg:mt-0"
          >
            Get in Touch
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-[42px] flex gap-5 overflow-x-auto pb-4">
          {facilities.map(({ title, icon: Icon, active }) => (
            <article
              key={title}
              className={`relative h-[97px] w-[260px] shrink-0 rounded-[10px] ${
                active ? "bg-white text-[#333]" : "bg-white/25 text-white"
              }`}
            >
              <span
                className={`absolute left-[19px] top-5 flex h-[50px] w-[50px] items-center justify-center rounded-[10px] ${
                  active ? "bg-[#019839] text-white" : "bg-white text-[#333]"
                }`}
              >
                <Icon className="h-[30px] w-[30px]" />
              </span>
              <b className="absolute left-[92px] top-5 flex h-[50px] max-w-[125px] items-center text-[20px] font-bold leading-[25px]">
                {title}
              </b>
              {active && (
                <span className="absolute bottom-0 left-0 h-[5px] w-full bg-[#019839]" />
              )}
            </article>
          ))}
        </div>
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
  if (schedule.length === 0) return null;

  return (
    <section
      id="grand-prix-schedule"
      className="grand-prix-section relative z-10 block w-full bg-[#323232] px-4 pb-[78px] pt-[69px] text-white"
    >
      <h2 className="grand-prix-bebas mx-auto max-w-[621px] text-center text-[50px] uppercase leading-[60px] max-md:text-[38px] max-md:leading-[46px]">
        {event.title} Schedule
      </h2>

      <p className="mx-auto mb-[45px] mt-[22px] max-w-[795px] text-center text-[24px] leading-[30px] text-white/70 max-md:text-[18px] max-md:leading-[28px]">
        {event.address || event.city || "Event schedule details"}
      </p>

      {/* <div className="grand-prix-shell mt-[45px] grid grid-cols-[460px_736px] gap-[53px] max-lg:grid-cols-1"> */}
      <div className="grand-prix-shell mt-[45px] grid grid-cols-1 gap-[53px] lg:grid-cols-[460px_minmax(0,1fr)]">
        <div className="relative h-[478px] w-full max-w-[460px] max-lg:mx-auto">
          <div className="absolute bottom-0 left-0 h-[254px] w-full rounded-tl-xl rounded-br-xl rounded-tr-[60px] rounded-bl-[60px] bg-[#435974]" />

          <img
            src={event.galleryImages?.[1] || SCHEDULE_IMAGE}
            alt={`${event.title} participant`}
            className="absolute bottom-0 left-[41px] h-[478px] w-[377px] object-contain"
          />

          <div className=" left-[60px] top-[265px] z-20 flex items-center">
          {/* <div className="left-[60px]  z-20 flex h-[58.33px] items-center"> */}
            {[
              "/img/Ellipse 2 (1).png",
              "/img/Ellipse 3 (1).png",
              "/img/Ellipse 4 (1).png",
              "/img/Ellipse 5 (1).png",
            ].map((src) => (
              <img
                key={src}
                src={src}
                alt="Rider"
                className="-ml-[29.16px] h-[58.33px] w-[58.33px] rounded-full border-2 border-white object-cover first:ml-0"
              />
            ))}

            <div className="-ml-[29.16px] flex h-[58.33px] w-[58.33px] items-center justify-center rounded-full bg-white font-sans text-[20.83px] font-normal uppercase leading-[27px] text-black">
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
              <time className="text-[18px] font-normal leading-[23px]">
                {item.time}
              </time>

              <div>
                <h3 className="text-[24px] font-medium leading-[30px]">
                  {item.title}
                </h3>

                <p className="mt-1 text-[18px] leading-[23px] text-white/70">
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
  if (faqs.length === 0) return null;

  return (
    <section className="grand-prix-section px-4 pb-[130px] pt-[120px] text-center">
      <h2 className="grand-prix-bebas text-[50px] uppercase leading-[60px] max-md:text-[38px] max-md:leading-[46px]">
        Frequently Asked Questions
      </h2>
      <p className="mx-auto mt-4 max-w-[563px] text-[18px] font-medium leading-[23px] text-black/70">
        Got questions before hitting the road? We've got you covered.
      </p>

      <div className="mx-auto mt-[46px] grid max-w-[1098px] grid-cols-2 gap-x-[30px] gap-y-[30px] max-lg:grid-cols-1">
        {faqs.map((faq, index) => (
          <button
            type="button"
            key={faq}
            className="flex min-h-[100px] items-center justify-between rounded-xl border border-black/10 bg-transparent px-[29px] text-left text-[22px] font-medium leading-[28px] text-black transition hover:border-[#019839] max-sm:px-5 max-sm:text-[18px]"
          >
            <span>
              {String(index + 1).padStart(2, "0")}. {faq}
            </span>
            <Plus className="h-6 w-6 shrink-0" />
          </button>
        ))}
      </div>
    </section>
  );
}

export default function CommunitiesAbuDhabiGrandPrixRide() {
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
          setError("The selected event details could not be loaded right now.");
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
  }, [selectedEventId]);

  const stats = useMemo(() => getStats(event), [event]);
  const facilities = useMemo(() => getFacilities(event), [event]);
  const schedule = useMemo(() => getSchedule(event), [event]);
  const faqs = useMemo(() => getFaqs(event), [event]);

  return (
    <div className="grand-prix-page">
      <FontLoader />
      {loading && (
        <section className="grand-prix-section grand-prix-shell py-24 text-center">
          <p className="text-[22px] font-medium text-black/70">Loading event details...</p>
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
