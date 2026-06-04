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

const eventStats: StatCard[] = [
  { icon: CalendarDays, title: "March 15", label: "Date" },
  { icon: MapPin, title: "42 km", label: "Distance" },
  { icon: Users, title: "156 riders", label: "Participants" },
  { icon: Trophy, title: "Advanced", label: "Level" },
];

const facilities: Facility[] = [
  { title: "Water Stations", icon: Droplets },
  { title: "Medical Support", icon: Cross, active: true },
  { title: "Bike Repair", icon: Wrench },
  { title: "Restrooms", icon: Users },
  { title: "Parking", icon: ParkingCircle },
];

const schedule: ScheduleItem[] = [
  {
    time: "6:00 AM",
    title: "Registration Opens",
    description: "Check-in and collect your race packet",
  },
  {
    time: "7:00 AM",
    title: "Event Start",
    description: "The ride begins!",
  },
  {
    time: "11:00 AM",
    title: "Awards Ceremony",
    description: "Celebration and prizes",
  },
  {
    time: "11:00 AM",
    title: "Awards Ceremony",
    description: "Celebration and prizes",
  },
];

const faqs = [
  "Do I need to be an experienced cyclist to join ADCC rides?",
  "Are there specific tracks for beginners or families?",
  "What gear do I need to bring for a group ride?",
  "Can I participate in races without being a professional?",
  "How do I track my performance or join challenges?",
  "Are there any women-only rides or training sessions?",
];

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Bebas+Neue&display=swap');

    .grand-prix-page {
      --green: #019839;
      --blue-gray: #435974;
      --dark: #323232;
      width: calc(100% + 11rem);
      margin-left: -5.5rem;
      margin-right: -5.5rem;
      overflow-x: hidden;
      overflow-y: visible;
      background: #EAF4FF;
      color: #000;
      font-family: 'Outfit', sans-serif;
    }

    .grand-prix-page * {
      box-sizing: border-box;
    }

    .grand-prix-bebas {
      font-family: 'Bebas Kai', 'Bebas Neue', sans-serif;
      font-weight: 400;
      letter-spacing: 0;
    }

    .grand-prix-shell {
      width: min(1272px, calc(100vw - 32px));
      margin: 0 auto;
    }

    .public-layout-content > div.grand-prix-page > section.grand-prix-section {
      display: block !important;
    }

  `}</style>
);

function HeroSection() {
  return (
    <section className="grand-prix-section grand-prix-shell pt-0">
      <div className="relative h-[500px] overflow-hidden bg-[#111] max-md:h-[420px]">
        <img
          src="/img/pexels-ander-garcia-1317358711-25016478 1.png"
          alt="Cyclists riding during the Abu Dhabi Grand Prix Ride"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute bottom-[102px] left-[43px] flex gap-[10px] max-sm:left-5">
          <span className="rounded-full bg-white/30 px-[21px] py-2 text-[16px] font-medium leading-5 text-white backdrop-blur">
            Race
          </span>
          <span className="rounded-full bg-white/30 px-[20px] py-2 text-[16px] font-medium leading-5 text-white backdrop-blur">
            Abu Dhabi
          </span>
        </div>

        <h1 className="grand-prix-bebas absolute bottom-[56px] left-[43px] text-[40px] uppercase leading-none text-white max-sm:left-5 max-sm:text-[34px]">
          Abu Dhabi Grand Prix Ride
        </h1>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="grand-prix-section px-4 pt-[103px] text-center">
      <h2 className="grand-prix-bebas text-[60px] uppercase leading-[72px] max-md:text-[44px] max-md:leading-[52px]">
        About This Event
      </h2>
      <p className="mx-auto mt-[23px] max-w-[851px] text-[24px] font-normal leading-[30px] text-black max-md:text-[18px] max-md:leading-[28px]">
        Join us for an unforgettable cycling experience in Abu Dhabi. This
        advanced event is for riders wanting a challenge while enjoying fellow
        enthusiasts. The route covers 42 km of paths showcasing the UAE's best.
        Compete or enjoy the ride; it promises to be exceptional.
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

function RegisterCard() {
  return (
    <article className="relative h-[236px] w-[426px] shrink-0 rounded-2xl bg-[#435974] text-white max-sm:w-[calc(100vw-56px)]">
      <p className="absolute left-6 top-[19px] flex items-center gap-[7px] text-[18px] font-medium leading-[23px]">
        <span className="h-[9px] w-[9px] rounded-full bg-white" />
        Register Now
      </p>

      <h3 className="grand-prix-bebas absolute left-6 top-[66px] text-[50px] uppercase leading-[36px]">
        Free
      </h3>
      <p className="absolute left-6 top-[110px] text-[14px] leading-5 text-white/60">
        Limited spots available
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

function StatsStrip() {
  return (
    <section className="grand-prix-section mx-auto mt-[60px] h-[270px] w-[1192px] max-w-[calc(100vw-32px)] overflow-x-auto rounded-2xl bg-[#323232] p-[17px] lg:overflow-visible">
      <div className="flex w-max gap-3">
        <RegisterCard />
        {eventStats.map(({ icon: Icon, title, label }) => (
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

function FacilitiesSection() {
  return (
    <section
      // className="mt-[130px] h-[401px] overflow-hidden bg-cover bg-center bg-no-repeat px-4 text-white max-lg:h-auto max-lg:py-16"
      className="grand-prix-section mt-[130px] min-h-[401px] bg-cover bg-center bg-no-repeat px-4 pb-10 text-white max-lg:py-16"
      style={{ backgroundImage: "url('/img/image 3518.png')" }}
    >
      {/* <div className="grand-prix-shell relative h-full"> */}
      <div className="grand-prix-shell relative">
        <div className="flex items-start justify-between pt-16 max-lg:flex-col max-lg:gap-8 max-lg:pt-0">
          <h2 className="grand-prix-bebas max-w-[579px] text-[50px] uppercase leading-[60px] max-md:text-[38px] max-md:leading-[46px]">
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

function ScheduleSection() {
  return (
    <section
      id="grand-prix-schedule"
      className="grand-prix-section relative z-10 block w-full bg-[#323232] px-4 pb-[78px] pt-[69px] text-white"
    >
      <h2 className="grand-prix-bebas mx-auto max-w-[621px] text-center text-[50px] uppercase leading-[60px] max-md:text-[38px] max-md:leading-[46px]">
        Abu Dhabi Grand Prix Ride Schedule
      </h2> 
      <p className="mx-auto mt-[22px] max-w-[795px] text-center text-[24px] leading-[30px] text-white/70 max-md:text-[18px] max-md:leading-[28px]">
        Join a world-class cycling event at Yas Marina Circuit. From
        registration to the final sprint, every moment promises an unforgettable
        ride.
      </p>

      <div className="grand-prix-shell mt-11 grid grid-cols-[460px_1fr] gap-[53px] max-lg:grid-cols-1">
        <div className="relative h-[478px] w-full max-w-[460px] max-lg:mx-auto">
          <div className="absolute bottom-0 left-0 h-[254px] w-full rounded-tl-xl rounded-br-xl rounded-tr-[60px] rounded-bl-[60px] bg-[#435974]" />
          <img
            src="/img/505801846.png"
            alt="Abu Dhabi Grand Prix Ride participant"
            className="absolute left-0 top-0 h-[478px] w-full rounded-xl object-cover"
          />
        </div>

        <div className="space-y-[16px]">
          {schedule.map((item, index) => (
            <article
              key={`${item.time}-${item.title}-${index}`}
              className={`grid min-h-[98px] grid-cols-[149px_1fr] items-center rounded-xl px-[19px] text-white max-sm:grid-cols-1 max-sm:gap-2 max-sm:py-5 ${
                index === 0 ? "bg-[#435974]" : "bg-[#7891AF]"
              }`}
            >
              <time className="text-[18px] font-medium leading-[23px]">
                {item.time}
              </time>
              <div>
                <h3 className="text-[24px] font-bold leading-[30px]">
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

function FaqSection() {
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
  return (
    <div className="grand-prix-page">
      <FontLoader />
      <HeroSection />
      <AboutSection />
      <StatsStrip />
      <FacilitiesSection />
      <ScheduleSection />
      <FaqSection />
    </div>
  );
}
