import {
  Cloud,
  Menu,
  Users,
  Clock,
  Trophy,
  Plus,
  Mail,
  Phone,
  MapPin,
  Bike,
  Apple,
} from "lucide-react";

const navLinks = ["About Us", "Events", "Community", "Tracks"];

const stats = [
  { value: "1,234", label: "Active Riders", active: true },
  { value: "20+", label: "Active Challenges" },
  { value: "1,234", label: "Active Riders" },
  { value: "1,234", label: "Active Riders" },
];

const challenges = [
  {
    title: "December Distance Champion",
    desc: "Ride 1000km this month",
    days: "14 days left",
    participants: "500 participants",
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop",
    active: true,
  },
  {
    title: "Spring Sprint Series",
    desc: "Complete 10 events in 30 days",
    days: "21 days left",
    participants: "320 participants",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Elevation Master",
    desc: "Climb 5000m elevation gain",
    days: "28 days left",
    participants: "180 participants",
    image:
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "March Distance Challenge",
    desc: "Ride 500km this month to earn the champion badge",
    days: "12 days left",
    participants: "234 participants",
    image:
      "https://images.unsplash.com/photo-1525109582930-30d7c7d1444e?q=80&w=1200&auto=format&fit=crop",
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

export default function ChallengesPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      {/* Header */}
      <header className="h-[134px] bg-[#eaf4ff] flex items-center justify-between px-10 md:px-20">
        <div className="flex items-center gap-2">
          <img
            src="/ADCC-Logo.png"
            alt="ADCC Logo"
            className="h-[57px] w-[135px] object-contain"
          />
        </div>

        <nav className="hidden lg:flex items-center gap-12 text-[20px] font-medium">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className={link === "Community" ? "text-[#092A25]" : "text-black"}
            >
              {link}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <Cloud size={24} className="text-[#34495e]" />
          <span className="hidden sm:block text-[17px] font-medium">English</span>
          <button className="rounded-full bg-black px-8 py-4 text-[18px] font-bold text-white">
            Menu
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative h-[635px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.1)), url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div className="absolute bottom-20 left-10 md:left-20 text-white">
          <h1 className="text-[42px] font-black uppercase leading-none tracking-tight">
            Challenges
          </h1>
          <p className="mt-4 text-[18px]">Home / Challenges</p>
        </div>
      </section>

      {/* Intro */}
      <section className="mx-auto grid max-w-[1260px] grid-cols-1 gap-12 px-10 py-28 lg:grid-cols-2">
        <div>
          <h2 className="max-w-[620px] text-[44px] font-black uppercase leading-tight">
            Push your limits with cycling challenges in Abu Dhabi
          </h2>
          <p className="mt-8 max-w-[560px] text-[17px] leading-relaxed">
            Abu Dhabi Cycling Club provides exciting opportunities for endurance
            rides and competitive challenges. Whether chasing distance, speed, or
            competing, our challenges keep you motivated.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl border p-8 ${
                item.active
                  ? "bg-[#49637f] text-white"
                  : "border-[#d7e3ef] bg-[#edf6ff]"
              }`}
            >
              <Users size={32} />
              <h3 className="mt-4 text-[28px] font-black">{item.value}</h3>
              <p className="mt-1 text-[16px]">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flag Image */}
      <section className="mx-auto max-w-[1260px] px-10 pb-28">
        <img
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
          alt="ADCC Flag"
          className="h-[465px] w-full rounded-xl object-cover"
        />
      </section>

      {/* Challenges */}
      <section className="mx-auto max-w-[1260px] px-10 pb-28">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <h2 className="text-[36px] font-black uppercase">Cycling Challenges</h2>

          <div className="flex gap-5">
            <button className="rounded-full bg-[#00a84f] px-14 py-4 text-[16px] font-bold text-white">
              Active
            </button>
            <button className="rounded-full border border-[#cad8e6] px-14 py-4 text-[16px] text-[#a6b2be]">
              Upcoming
            </button>
            <button className="rounded-full border border-[#cad8e6] px-14 py-4 text-[16px] text-[#a6b2be]">
              Completed
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {challenges.map((item) => (
            <div
              key={item.title}
              className={`overflow-hidden rounded-xl border border-[#cad8e6] ${
                item.active ? "bg-[#49637f] text-white" : "bg-[#eef7ff]"
              }`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-[330px] w-full object-cover"
              />

              <div className="p-8">
                <h3 className="text-[24px] font-black uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px]">{item.desc}</p>

                <div
                  className={`mt-8 flex items-center justify-between rounded-md px-6 py-5 ${
                    item.active ? "bg-[#89a2bf]" : "bg-[#89a2bf]"
                  } text-white`}
                >
                  <div className="space-y-2 text-[15px]">
                    <p className="flex items-center gap-2">
                      <Clock size={16} /> {item.days}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={16} /> {item.participants}
                    </p>
                  </div>

                  <button className="rounded-full border border-white px-6 py-3 text-[13px] font-semibold">
                    Join The Challenge
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1100px] px-10 pb-28 text-center">
        <h2 className="text-[34px] font-black uppercase">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-[15px]">
          Got questions before hitting the road? We’ve got you covered.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <button
              key={faq}
              className="flex items-center justify-between rounded-lg border border-[#cad8e6] bg-[#eef7ff] px-7 py-6 text-left text-[16px] font-medium"
            >
              <span>
                {String(index + 1).padStart(2, "0")}. {faq}
              </span>
              <Plus size={18} />
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative flex h-[500px] items-center justify-center bg-cover bg-center text-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.62), rgba(0,0,0,.62)), url('https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div>
          <h2 className="text-[56px] font-black uppercase leading-tight">
            Start Your Ride Today
          </h2>
          <p className="mt-6 text-[19px]">
            Download the ADCC app and join the cycling community
          </p>

          <div className="mt-8 flex justify-center gap-5">
            <button className="flex items-center gap-3 rounded-full bg-white px-7 py-3 text-black">
              <span className="text-xs">GET IT ON</span>
              <b>Google Play</b>
            </button>
            <button className="flex items-center gap-3 rounded-full bg-white px-7 py-3 text-black">
              <Apple size={20} />
              <b>App Store</b>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-[1260px] px-10 py-24">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3">
          <div>
            <img
              src="/ADCC-Logo.png"
              alt="ADCC Logo"
              className="h-[57px] w-[135px] object-contain"
            />
            <p className="mt-8 max-w-[340px] text-[15px] leading-relaxed">
              From weekend warriors to elite athletes, we unite cyclists who
              share a passion for riding. ADCC is where your cycling journey
              thrives...
            </p>

            <div className="mt-7 flex max-w-[360px] rounded-md bg-white p-2">
              <input
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 text-sm outline-none"
              />
              <button className="rounded bg-[#00a84f] px-8 py-3 text-sm font-bold text-white">
                Submit
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[17px] font-black uppercase">Quick Links</h4>
            <ul className="mt-7 space-y-4 text-[15px]">
              {["About Us", "Rides", "Events", "Cyclist’s Corner", "Contact Us"].map(
                (link) => (
                  <li key={link}>{link}</li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-[17px] font-black uppercase">Contact Us</h4>
            <ul className="mt-7 space-y-4 text-[15px]">
              <li className="flex gap-3">
                <Phone size={16} /> +971 2 654 5645
              </li>
              <li className="flex gap-3">
                <Phone size={16} /> 144226
              </li>
              <li className="flex gap-3">
                <MapPin size={16} /> Abu Dhabi, Yas island, yas marina circuit,
                Villa 18.
              </li>
              <li className="flex gap-3">
                <Mail size={16} /> info@adcyclingclub.ae
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-[#cad8e6] pt-7 text-center text-[14px]">
          Copyright 2026. Abu Dhabi Cycling Club
        </div>

        <button className="fixed bottom-10 right-10 rounded-full bg-[#00a84f] p-4 text-white shadow-lg">
          <Bike size={28} />
        </button>
      </footer>
    </div>
  );
}