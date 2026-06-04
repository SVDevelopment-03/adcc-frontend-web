import {
  Cloud,
  Heart,
  Share2,
  CalendarDays,
  MapPin,
  Users,
  Trophy,
  ArrowRight,
  Droplets,
  Cross,
  Wrench,
  ParkingCircle,
  Plus,
  Phone,
  Mail,
  Bike,
  Apple,
} from "lucide-react";

const faqs = [
  "Do I need to be an experienced cyclist to join ADCC rides?",
  "Are there specific tracks for beginners or families?",
  "What gear do I need to bring for a group ride?",
  "Can I participate in races without being a professional?",
  "How do I track my performance or join challenges?",
  "Are there any women-only rides or training sessions?",
];

const facilities = [
  { title: "Water Stations", icon: Droplets },
  { title: "Medical Support", icon: Cross, active: true },
  { title: "Bike Repair", icon: Wrench },
  { title: "Restrooms", icon: Users },
  { title: "Parking", icon: ParkingCircle },
];

const schedule = [
  ["6:00 AM", "Registration Opens", "Check-in and collect your race packet"],
  ["7:00 AM", "Event Start", "The ride begins!"],
  ["11:00 AM", "Awards Ceremony", "Celebration and prizes"],
  ["11:00 AM", "Awards Ceremony", "Celebration and prizes"],
];

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Bebas+Neue&display=swap');

    body { background: #EAF4FF; font-family: 'Outfit', sans-serif; color: #000; }
    .bebas { font-family: 'Bebas Kai', 'Bebas Neue', sans-serif; font-weight: 400; letter-spacing: 0; }
  `}</style>
);

export default function EventDetailPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <FontLoader />

      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
        <img src="/ADCC-Logo.png" className="h-[57px] w-[135px] object-contain" />

        <nav className="hidden lg:flex gap-12 text-[20px] font-medium">
          <span>About Us</span>
          <span>Events</span>
          <span className="text-[#092A25]">Community</span>
          <span>Tracks</span>
        </nav>

        <div className="flex items-center gap-6">
          <Cloud size={24} />
          <span className="text-[17px]">English</span>
          <button className="rounded-full bg-black px-8 py-4 text-[18px] font-bold text-white">
            Menu
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1272px] px-10">
        <div
          className="relative h-[500px] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('/img/pexels-ander-garcia-1317358711-25016478 1.png')",
          }}
        >
          <div className="absolute bottom-20 left-10 text-white">
            <div className="mb-3 flex gap-3">
              <span className="rounded-full bg-white/30 px-5 py-2">Race</span>
              <span className="rounded-full bg-white/30 px-5 py-2">Abu Dhabi</span>
            </div>
            <h1 className="text-[40px] font-black uppercase">
              Abu Dhabi Grand Prix Ride
            </h1>
          </div>
        </div>
      </section>

      <section className="px-10 py-24 text-center">
        <h2 className="text-[60px] font-black uppercase">About This Event</h2>
        <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
          Join us for an unforgettable cycling experience in Abu Dhabi. This
          advanced event is for riders wanting a challenge while enjoying fellow
          enthusiasts. The route covers 42 km of paths showcasing the UAE's best.
          Compete or enjoy the ride; it promises to be exceptional.
        </p>

        <button className="mt-10 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
          Join this Event <ArrowRight size={20} />
        </button>
      </section>

      <section className="mx-auto mb-32 flex h-[270px] max-w-[1192px] gap-3 overflow-x-auto rounded-2xl bg-[#323232] p-[17px] lg:overflow-visible">
        <div className="relative h-[236px] w-[426px] shrink-0 rounded-2xl bg-[#435974] text-white">
          <p className="absolute left-6 top-[19px] flex items-center gap-[7px] text-[18px] font-medium leading-[23px]">
            <span className="h-[9px] w-[9px] rounded-full bg-white" />
            Register Now
          </p>

          <h3 className="bebas absolute left-6 top-[66px] text-[50px] uppercase leading-[36px]">
            Free
          </h3>
          <p className="absolute left-6 top-[110px] text-[14px] leading-5 text-white/60">
            Limited spots available
          </p>

          <div className="absolute left-6 top-[151px] h-[71px] w-[378px] border-t border-white/10">
            <span className="absolute left-[13px] top-[31px] flex items-center gap-[7px] text-[16px] font-medium leading-5">
              <span className="h-[9px] w-[9px] rounded-full bg-white" />
              Organized by
            </span>
            <div className="absolute left-[251px] top-[17px] flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white">
                <Bike size={20} />
              </span>
              <b className="bebas text-[40px] leading-[48px]">ADCC</b>
            </div>
          </div>

          <button className="absolute left-[352px] top-4 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[#C12D32]">
            <Heart size={24} />
          </button>
          <button className="absolute left-[352px] top-[75px] flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[#019839]">
            <Share2 size={24} />
          </button>
        </div>

        {[
          [CalendarDays, "March 15", "Date"],
          [MapPin, "42 km", "Distance"],
          [Users, "156 riders", "Participants"],
          [Trophy, "Advanced", "Level"],
        ].map(([Icon, title, label]) => (
          <div key={title} className="relative h-[236px] w-[171px] shrink-0 overflow-hidden rounded-[10px] bg-[#435974] text-white">
            <span className="absolute left-5 top-5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-white text-[#019839]">
              <Icon size={25} />
            </span>

            <h3 className="bebas absolute left-5 top-[155px] text-[30px] uppercase leading-[36px]">
              {title}
            </h3>
            <p className="absolute left-5 top-[191px] text-[20px] leading-[25px] text-white/60">
              {label}
            </p>
          </div>
        ))}
      </section>

      {/* <section className="bg-gradient-to-b from-[#025AE8] to-[#013282] px-10 py-20"> */}
      <section
        className="bg-cover bg-center bg-no-repeat px-10 py-20"
        style={{
          backgroundImage: "url('/img/image 3518.png')",
        }}
      >
        <div className="mx-auto max-w-[1268px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <h2 className="max-w-[580px] text-[50px] font-black uppercase leading-tight">
              Everything You Need for a Seamless Ride Experience
            </h2>
            <button className="inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 font-bold text-white">
              Get in Touch <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-16 flex gap-5 overflow-x-auto pb-4">
            {facilities.map(({ title, icon: Icon, active }) => (
              <div
                key={title}
                className={`min-w-[260px] rounded-xl p-5 ${
                  active ? "bg-white text-[#333]" : "bg-white/25 text-white"
                }`}
              >
                <div className="flex items-center gap-5">
                  <span
                    className={`rounded-lg p-3 ${
                      active ? "bg-[#019839] text-white" : "bg-white text-[#333]"
                    }`}
                  >
                    <Icon size={28} />
                  </span>
                  <b className="text-[20px]">{title}</b>
                </div>
                {active && <div className="mt-5 h-[5px] bg-[#019839]" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#323232] px-10 py-20 text-white">
        <h2 className="text-center text-[50px] font-black uppercase">
          Abu Dhabi Grand Prix Ride Schedule
        </h2>
        <p className="mx-auto mt-6 max-w-[795px] text-center text-[24px] leading-[30px] text-white/70">
          Join a world-class cycling event at Yas Marina Circuit. From
          registration to the final sprint, every moment promises an
          unforgettable ride.
        </p>

        <div className="mx-auto mt-16 grid max-w-[1268px] grid-cols-1 gap-14 lg:grid-cols-[460px_1fr]">
          <div className="relative">
            <div className="absolute bottom-0 h-[254px] w-full rounded-tl-xl rounded-br-[60px] bg-[#435974]" />
            <img
              src="/img/505801846.png"
              className="relative z-10 h-[478px] w-full rounded-xl object-cover"
            />
          </div>

          <div className="space-y-5">
            {schedule.map(([time, title, desc], index) => (
              <div
                key={index}
                className={`grid grid-cols-[130px_1fr] rounded-xl p-6 ${
                  index === 0 ? "bg-[#435974]" : "bg-[#7891AF]"
                }`}
              >
                <span>{time}</span>
                <div>
                  <h3 className="text-[24px] font-bold">{title}</h3>
                  <p className="text-[18px] text-white/70">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-10 py-32 text-center">
        <h2 className="text-[50px] font-black uppercase">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-[18px]">
          Got questions before hitting the road? We’ve got you covered.
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

      <section
        className="flex h-[502px] items-center justify-center bg-cover bg-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url('https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div>
          <h2 className="text-[80px] font-black uppercase">Start Your Ride Today</h2>
          <p className="mt-7 text-[26px]">
            Download the ADCC app and join the cycling community.
          </p>
          <div className="mt-10 flex justify-center gap-5">
            <button className="rounded-full bg-white px-9 py-4 text-black">
              <span className="text-xs">GET IT ON</span> <b>Google Play</b>
            </button>
            <button className="flex items-center gap-3 rounded-full bg-white px-9 py-4 text-black">
              <Apple size={24} /> <b>App Store</b>
            </button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1268px] px-10 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img src="/ADCC-Logo.png" className="h-[63px] w-[149px] object-contain" />
            <p className="mt-8 max-w-[402px] text-[18px]">
              From weekend warriors to elite athletes, we unite cyclists who
              share a passion for riding. ADCC is where your cycling journey thrives...
            </p>
            <div className="mt-8 flex h-[57px] max-w-[367px] rounded-lg bg-[#8DDF93] p-[6px]">
              <input placeholder="Enter your email" className="flex-1 bg-transparent px-4 outline-none" />
              <button className="rounded-lg bg-[#019839] px-7 text-white">Submit</button>
            </div>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Quick Links</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>About Us</li><li>Rides</li><li>Events</li><li>Cyclist’s Corner</li><li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Contact Us</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3"><Phone size={22} /> +971 2 654 5645</li>
              <li className="flex gap-3"><Phone size={22} /> 144226</li>
              <li className="flex gap-3"><Mail size={22} /> Abu Dhabi, Yas island, yas marina circuit, Villa 18.</li>
              <li className="flex gap-3"><MapPin size={22} /> info@adcyclingclub.ae</li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#d5d5d5] pt-8 text-center text-[18px] text-black/70">
          Copyright 2026. Abu Dhabi Cycling Club
        </div>

        <button className="fixed bottom-10 right-10 rounded-full bg-[#019839] p-4 text-white shadow-lg">
          <Bike size={28} />
        </button>
      </footer>
    </div>
  );
}
