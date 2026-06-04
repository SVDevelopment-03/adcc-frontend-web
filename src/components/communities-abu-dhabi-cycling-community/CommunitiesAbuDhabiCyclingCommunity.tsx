import {
  Cloud, ArrowRight, CalendarDays, Users, MapPin, Gauge,
  Plus, Phone, Mail, Bike, Apple
} from "lucide-react";

const faqs = [
  "Do I need to be an experienced cyclist to join ADCC rides?",
  "Are there specific tracks for beginners or families?",
  "What gear do I need to bring for a group ride?",
  "Can I participate in races without being a professional?",
  "How do I track my performance or join challenges?",
  "Are there any women-only rides or training sessions?",
];

const upcomingEvents = [
  {
    title: "Abu Dhabi Grand Prix Ride",
    tag: "Race",
    date: "March 15, 2026",
    riders: "156 participants",
    distance: "42 km",
    city: "Abu Dhabi",
    image: "/img/Frame 2147226042.png",
  },
  {
    title: "Dubai Marina Sunrise Ride",
    tag: "Race",
    date: "March 20, 2026",
    riders: "89 participants",
    distance: "25 km",
    city: "Dubai",
    image: "/img/490796704_1417267435941639_5633845168834004037_n. 1.png",
  },
  {
    title: "Al Ain Mountain Challenge",
    tag: "Challenge",
    date: "March 28, 2026",
    riders: "156 participants",
    distance: "65 km",
    city: "Abu Dhabi",
    image: "/img/503933859_18364437631178203_8919788300453479084_n. 1.png",
  },
];

const trackCards = [
  {
    title: "Dubai Marina Loop",
    city: "Abu Dhabi",
    distance: "25 km",
    elevation: "50 m",
    level: "Easy",
    active: true,
    image: "/img/pexels-stephen-noulton-421904730-17272198 1 (1).png",
  },
  {
    title: "Yas Island Circuit",
    city: "Abu Dhabi",
    distance: "45 km",
    elevation: "120 m",
    level: "Intermediate",
    image: "/img/image 3049.png",
  },
  {
    title: "Sharjah Corniche",
    city: "Abu Dhabi",
    distance: "18 km",
    elevation: "30 m",
    level: "Easy",
    image: "/img/image 3049.png",
  },
];

export default function CommunityDetailPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
        <img src="/ADCC-Logo.png" alt="ADCC" className="h-[57px] w-[135px] object-contain" />

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
            <span className="rounded-full bg-white/30 px-5 py-2">Official</span>
            <h1 className="mt-4 text-[40px] font-black uppercase">
              Abu Dhabi Cycling Community
            </h1>
          </div>
        </div>
      </section>

      <section className="px-10 py-24 text-center">
        <h2 className="text-[60px] font-black uppercase">About This Community</h2>
        <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
          The cycling community of Abu Dhabi unites cyclists of all levels to explore the
          best routes. Join us for group rides, social events, and community challenges.
          Whether a beginner or experienced, you’ll find your place here.
        </p>

        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
          Join this Community <ArrowRight size={20} />
        </button>
      </section>

      <section className="mx-auto mb-32 grid max-w-[1108px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[610px_220px_220px]">
        <div className="grid rounded-2xl bg-[#435974] p-8 text-white md:grid-cols-[240px_1fr]">
          <div>
            <p className="text-white/70">• Join Community</p>
            <h3 className="mt-8 text-[40px] font-black uppercase leading-tight">
              Become part of our growing cycling family
            </h3>
          </div>

          <div className="mt-8 border-white/30 md:mt-0 md:border-l md:pl-10">
            <h4 className="text-[24px] font-black uppercase">Community Stats</h4>
            <div className="mt-6 space-y-5 text-[16px]">
              <p className="flex justify-between"><span>Weekly Rides</span><b>12+</b></p>
              <p className="flex justify-between"><span>Avg Group Size</span><b>25 riders</b></p>
              <p className="flex justify-between"><span>Total Distance</span><b>45,000 km</b></p>
            </div>
          </div>
        </div>

        {[
          ["2456", "Active Members"],
          ["145", "Events Organized"],
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

      <section className="mx-auto max-w-[1269px] px-10 pb-28">
        <h2 className="mb-16 text-center text-[50px] font-black uppercase">
          Upcoming Events
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <div key={event.title}>
              <div className="relative h-[397px] overflow-hidden rounded-[14px] bg-white">
                <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
                <span className="absolute right-6 top-6 rounded-full bg-black/40 px-6 py-2 text-white">
                  {event.tag}
                </span>
              </div>

              <h3 className="mt-6 text-[26px] font-black uppercase">{event.title}</h3>

              <div className="mt-5 grid grid-cols-2 gap-y-4 text-[18px] text-black/70">
                <p className="flex gap-2"><CalendarDays size={20} /> {event.date}</p>
                <p className="flex gap-2"><Gauge size={20} /> {event.distance}</p>
                <p className="flex gap-2"><Users size={20} /> {event.riders}</p>
                <p className="flex gap-2"><MapPin size={20} /> {event.city}</p>
              </div>

              <button className="mt-8 rounded-full border border-[#019839] px-8 py-4 font-bold text-[#019839]">
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#777] px-10 py-24">
        <h2 className="mb-16 text-center text-[50px] font-black uppercase text-white">
          Upcoming Events
        </h2>

        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 lg:grid-cols-3">
          {trackCards.map((track) => (
            <div
              key={track.title}
              className={`rounded-xl p-3 ${track.active ? "bg-[#323232] text-white" : "bg-white text-black"}`}
            >
              <img src={track.image} alt={track.title} className="h-[363px] w-full rounded-lg object-cover" />

              <div className="p-4">
                <p className="flex gap-2 text-sm opacity-80"><MapPin size={18} /> {track.city}</p>
                <h3 className="mt-4 text-[26px] font-black uppercase">{track.title}</h3>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Distance", track.distance],
                    ["Elevation", track.elevation],
                    ["Level", track.level],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded border border-white/20 bg-[#323232] p-3 text-white">
                      <p className="text-[14px]">{label}</p>
                      <b className="text-[16px]">{value}</b>
                    </div>
                  ))}
                </div>

                <button
                  className={`mt-8 rounded-full px-8 py-4 font-bold ${
                    track.active
                      ? "bg-[#019839] text-white"
                      : "border border-black/50 text-black/50"
                  }`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-10 py-32 text-center">
        <h2 className="text-[50px] font-black uppercase">Frequently Asked Questions</h2>
        <p className="mt-4 text-[18px]">
          Got questions before hitting the road? We’ve got you covered.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <button
              key={faq}
              className="flex min-h-[100px] items-center justify-between rounded-xl border border-[#ccc] px-7 text-left text-[22px] font-medium"
            >
              <span>{String(index + 1).padStart(2, "0")}. {faq}</span>
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
          <p className="mt-7 text-[26px]">Download the ADCC app and join the cycling community.</p>
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
            <img src="/ADCC-Logo.png" alt="ADCC" className="h-[63px] w-[149px] object-contain" />
            <p className="mt-8 max-w-[402px] text-[18px]">
              From weekend warriors to elite athletes, we unite cyclists who share a passion
              for riding. ADCC is where your cycling journey thrives...
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