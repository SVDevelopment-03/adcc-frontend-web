import {
  Cloud, ArrowRight, CalendarDays, Users, MapPin, Gauge,
  Droplets, Cross, Wrench, ParkingCircle, Plus, Phone, Mail, Bike, Apple
} from "lucide-react";

const facilities = [
  { title: "Water Stations", icon: Droplets },
  { title: "Medical Support", icon: Cross, active: true },
  { title: "Bike Repair", icon: Wrench },
  { title: "Restrooms", icon: Users },
  { title: "Parking", icon: ParkingCircle },
];

const events = [
  ["Abu Dhabi Grand Prix Ride", "Race", "March 15, 2026", "156 participants", "42 km", "Abu Dhabi"],
  ["Dubai Marina Sunrise Ride", "Race", "March 20, 2026", "89 participants", "25 km", "Dubai"],
  ["Al Ain Mountain Challenge", "Challenge", "March 28, 2026", "156 participants", "65 km", "Abu Dhabi"],
];

const faqs = [
  "Do I need to be an experienced cyclist to join ADCC rides?",
  "Are there specific tracks for beginners or families?",
  "What gear do I need to bring for a group ride?",
  "Can I participate in races without being a professional?",
  "How do I track my performance or join challenges?",
  "Are there any women-only rides or training sessions?",
];

export default function TrackDetailPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
        <img src="/ADCC-Logo.png" alt="ADCC" className="h-[57px] w-[135px] object-contain" />

        <nav className="hidden lg:flex gap-12 text-[20px] font-medium">
          <span>About Us</span><span>Events</span><span>Community</span><span>Tracks</span>
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
              <span className="rounded-full bg-white/30 px-5 py-2">Abu Dhabi</span>
              <span className="rounded-full bg-white/30 px-5 py-2">Road</span>
            </div>
            <h1 className="text-[40px] font-black uppercase">Al Qudra Cycle Path</h1>
          </div>
        </div>
      </section>

      <section className="px-10 py-24 text-center">
        <h2 className="text-[60px] font-black uppercase">About This Track</h2>
        <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
          The Corniche Coastal Route is an 18 km beginner track, ideal for cyclists
          wanting to enjoy Abu Dhabi’s beauty on a safe, well-maintained route. It offers
          amenities for a comfortable ride, whether training or leisurely.
        </p>

        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
          Start Ride <ArrowRight size={20} />
        </button>
      </section>

      <section className="mx-auto mb-28 grid max-w-[1108px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[430px_repeat(3,1fr)]">
        <div className="rounded-2xl bg-[#435974] p-8 text-white">
          <p className="text-white/70">• Start Your Ride</p>
          <h3 className="mt-8 text-[40px] font-black uppercase leading-tight">
            Track your progress with the ADCC app
          </h3>

          <div className="mt-8 grid grid-cols-2 gap-3 text-[14px] text-white/80">
            <p>Safety Tips</p>
            <p>Always wear a helmet</p>
            <p>Carry sufficient water</p>
            <p>Ride during cooler hours</p>
          </div>
        </div>

        {[
          ["18 km", "Distance"],
          ["Beginner", "Level"],
          ["Loop Track", "Type"],
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

      {/* <section className="bg-gradient-to-b from-[#d8ebff] to-[#adc7df] px-10 py-20"> */}
      <section
        className="bg-cover bg-center bg-no-repeat px-10 py-20"
        style={{
          backgroundImage:
            "url('/img/image 3518.png')",
        }}
      >
        <div className="mx-auto max-w-[1268px]">
          <div className="flex justify-between gap-8">
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
                  <span className={`rounded-lg p-3 ${active ? "bg-[#019839] text-white" : "bg-white text-[#333]"}`}>
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

      <section className="h-[620px] bg-[#2f2f2f] bg-[radial-gradient(circle_at_center,rgba(255,255,255,.08),transparent_60%)]"
        style={{
          backgroundImage:
            "url('/img/image 2977.png')",
        }} />

      <section className="mx-auto max-w-[1269px] px-10 py-32">
        <h2 className="mb-16 text-center text-[50px] font-black uppercase">
          Upcoming Events
        </h2>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {[
            {
              title: events[0][0],
              tag: events[0][1],
              date: events[0][2],
              riders: events[0][3],
              distance: events[0][4],
              city: events[0][5],
              image: "/img/501345306_3950860245127637_1209497623770704531_n. 1.png",
            },
            {
              title: events[1][0],
              tag: events[1][1],
              date: events[1][2],
              riders: events[1][3],
              distance: events[1][4],
              city: events[1][5],
              image: "/img/490796704_1417267435941639_5633845168834004037_n. 1.png",
            },
            {
              title: events[2][0],
              tag: events[2][1],
              date: events[2][2],
              riders: events[2][3],
              distance: events[2][4],
              city: events[2][5],
              image: "/img/503933859_18364437631178203_8919788300453479084_n. 1 (1).png",
            },
          ].map((event) => (
            <div key={event.title}>
              <div className="relative h-[397px] overflow-hidden rounded-[14px] bg-white">
                <img
                  src={event.image}
                  alt={event.title}
                  className="h-full w-full object-cover"
                />

                <span className="absolute right-6 top-6 rounded-full bg-black/40 px-6 py-2 text-white">
                  {event.tag}
                </span>
              </div>

              <h3 className="mt-6 text-[26px] font-black uppercase">
                {event.title}
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-y-4 text-[18px] text-black/70">
                <p className="flex gap-2">
                  <CalendarDays size={20} /> {event.date}
                </p>

                <p className="flex gap-2">
                  <Gauge size={20} /> {event.distance}
                </p>

                <p className="flex gap-2">
                  <Users size={20} /> {event.riders}
                </p>

                <p className="flex gap-2">
                  <MapPin size={20} /> {event.city}
                </p>
              </div>

              <button className="mt-8 rounded-full border border-[#019839] px-8 py-4 font-bold text-[#019839]">
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-10 pb-32 text-center">
        <h2 className="text-[50px] font-black uppercase">Frequently Asked Questions</h2>
        <p className="mt-4 text-[18px]">Got questions before hitting the road? We’ve got you covered.</p>

        <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <button key={faq} className="flex min-h-[100px] items-center justify-between rounded-xl border border-[#ccc] px-7 text-left text-[22px] font-medium">
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
              From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where your cycling journey thrives...
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