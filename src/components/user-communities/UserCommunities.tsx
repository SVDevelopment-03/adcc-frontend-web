import {
  Cloud,
  Search,
  ChevronDown,
  Users,
  CalendarDays,
  Plus,
  Phone,
  Mail,
  MapPin,
  Bike,
  Apple,
  ChevronRight,
} from "lucide-react";

const navLinks = ["About Us", "Events", "Community", "Tracks"];

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Bebas+Neue&display=swap');

    body { background: #EAF4FF; font-family: 'Outfit', sans-serif; color: #000; }
    .bebas { font-family: 'Bebas Kai', 'Bebas Neue', sans-serif; font-weight: 400; letter-spacing: 0; }
  `}</style>
);

const communities = [
  {
    title: "Dubai Riders",
    members: "2,456 members",
    events: "45 events",
    image:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Family Cyclists UAE",
    members: "1,234 members",
    events: "28 events",
    image:
      "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Youth Cycling Academy",
    members: "542 members",
    events: "18 events",
    image:
      "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?q=80&w=1200&auto=format&fit=crop",
  },
  {
    title: "Abu Dhabi Cyclists",
    members: "1,890 members",
    events: "38 events",
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

export default function CommunitiesPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <FontLoader />

      <header className="h-[134px] bg-[#eaf4ff] flex items-center justify-between px-10 md:px-20">
        <img
          src="/ADCC-Logo.png"
          alt="ADCC Logo"
          className="h-[57px] w-[135px] object-contain"
        />

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
          <Cloud size={24} />
          <span className="hidden sm:block text-[17px] font-medium">English</span>
          <button className="rounded-full bg-black px-8 py-4 text-[18px] font-bold text-white">
            Menu
          </button>
        </div>
      </header>

      <section
        className="relative h-[640px] bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,.5), rgba(0,0,0,.5)), url('/img/pexels-jonathanborba-19431223 1.png')",
        }}
      >
        <div className="absolute bottom-20 left-10 md:left-20 text-white">
          <h1 className="text-[60px] font-black uppercase leading-none">
            Communities
          </h1>
          <p className="mt-4 text-[24px]">Home / Communities</p>
        </div>
      </section>

      {/* <section className="mx-auto grid max-w-[1268px] grid-cols-1 gap-10 px-10 py-20 lg:relative lg:block lg:h-[565px] lg:py-0"> */}
      {/* <section className="mx-auto grid max-w-[1268px] grid-cols-1 items-center gap-[42px] px-10 py-20 lg:grid-cols-[634px_592px]"> */}
      <section className="mx-auto grid max-w-[1268px] grid-cols-1 items-center gap-[42px] px-10 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,592px)]">
        {/* <div className="max-w-[634px] lg:absolute lg:left-0 lg:top-[206px] lg:w-[634px]"> */}
        <div className="max-w-[634px]">
          <h2 className="bebas max-w-[634px] text-[42px] leading-[50px] capitalize md:text-[52px] md:leading-[62px] lg:text-[60px] lg:leading-[72px]">
            Connect with Cycling Communities Across Abu Dhabi
          </h2>
          <p className="mt-6 max-w-[610px] text-[18px] leading-[24px] md:text-[22px] md:leading-[28px] lg:mt-[44px] lg:text-[24px] lg:leading-[30px]">
            Abu Dhabi Cycling Club unites riders through communities focused on
            cycling. Whether for fitness, competition, or fun, find a group that
            suits you.
          </p>
        </div>

        {/* <div className="h-auto w-full max-w-[592px] overflow-hidden rounded-[10px] lg:absolute lg:right-0 lg:top-[125px] lg:h-[440px] lg:w-[592px]"> */}
        {/* <div className="h-[440px] w-full max-w-[592px] overflow-hidden rounded-[10px]"> */}
        <div className="h-[440px] w-full overflow-hidden rounded-[10px]">
          <img
            src="/img/Frame 2147226625.png"
            alt="Cycling community"
            className="h-auto w-full object-cover lg:h-full"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1268px] px-10 pb-28">
        <h2 className="text-center text-[50px] font-black uppercase">
          Explore Communities
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_260px_260px_156px]">
          <div className="flex h-[66px] items-center rounded-full bg-white px-8">
            <input
              placeholder="Search Communities"
              className="flex-1 bg-transparent text-[22px] outline-none"
            />
            <Search size={24} />
          </div>

          <button className="flex h-[66px] items-center justify-between rounded-full bg-white px-8 text-[22px]">
            All Cities <ChevronDown size={24} />
          </button>

          <button className="flex h-[66px] items-center justify-between rounded-full bg-white px-8 text-[22px]">
            All Types <ChevronDown size={24} />
          </button>

          <button className="h-[66px] rounded-full bg-[#019839] text-[22px] font-bold text-white">
            Search
          </button>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {communities.map((item) => (
            <div
              key={item.title}
              className="relative h-[467px] overflow-hidden rounded-[10px] bg-black"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute bottom-10 left-8 text-white">
                <h3 className="text-[30px] font-black uppercase">
                  {item.title}
                </h3>

                <div className="mt-5 flex gap-4">
                  <span className="flex h-10 items-center gap-2 rounded-full bg-white/20 px-5 backdrop-blur-md">
                    <Users size={18} /> {item.members}
                  </span>
                  <span className="flex h-10 items-center gap-2 rounded-full bg-white/20 px-5 backdrop-blur-md">
                    <CalendarDays size={18} /> {item.events}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-center justify-center gap-8 text-[#019839] text-[20px] font-medium">
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white">
            1
          </button>
          <button>2</button>
          <button>3</button>
          <button>4</button>
          <span className="tracking-[0.25em]">..........</span>
          <button>10</button>
          <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white">
            <ChevronRight size={22} />
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-10 pb-28 text-center">
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
            "linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url('https://images.unsplash.com/photo-1511994298241-608e28f14fde?q=80&w=1600&auto=format&fit=crop')",
        }}
      >
        <div>
          <h2 className="text-[80px] font-black uppercase leading-none">
            Start Your Ride Today
          </h2>
          <p className="mt-7 text-[26px]">
            Download the ADCC app and join the cycling community.
          </p>

          <div className="mt-10 flex justify-center gap-5">
            <button className="rounded-full bg-white px-9 py-4 text-black">
              <span className="text-xs">GET IT ON</span>{" "}
              <b className="text-lg">Google Play</b>
            </button>
            <button className="flex items-center gap-3 rounded-full bg-white px-9 py-4 text-black">
              <Apple size={24} /> <b className="text-lg">App Store</b>
            </button>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-[1268px] px-10 py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
          <div>
            <img
              src="/ADCC-Logo.png"
              alt="ADCC Logo"
              className="h-[63px] w-[149px] object-contain"
            />
            <p className="mt-8 max-w-[402px] text-[18px] leading-[23px]">
              From weekend warriors to elite athletes, we unite cyclists who
              share a passion for riding. ADCC is where your cycling journey
              thrives...
            </p>

            <div className="mt-8 flex h-[57px] max-w-[367px] rounded-lg bg-[#8DDF93] p-[6px]">
              <input
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-4 text-[16px] outline-none"
              />
              <button className="rounded-lg bg-[#019839] px-7 text-white">
                Submit
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Quick Links</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li>About Us</li>
              <li>Rides</li>
              <li>Events</li>
              <li>Cyclist’s Corner</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[24px] font-black uppercase">Contact Us</h4>
            <ul className="mt-8 space-y-4 text-[18px]">
              <li className="flex gap-3">
                <Phone size={22} /> +971 2 654 5645
              </li>
              <li className="flex gap-3">
                <Phone size={22} /> 144226
              </li>
              <li className="flex gap-3">
                <Mail size={22} /> Abu Dhabi, Yas island, yas marina circuit,
                Villa 18.
              </li>
              <li className="flex gap-3">
                <MapPin size={22} /> info@adcyclingclub.ae
              </li>
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
