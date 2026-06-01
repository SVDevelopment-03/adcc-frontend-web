import {
  Cloud, ArrowRight, CalendarDays, Plus, Phone, Mail, MapPin,
  Bike, Apple, Trophy
} from "lucide-react";

const steps = [
  "Register for the challenge before the deadline",
  "Track all rides using the ADCC mobile app",
  "Complete the challenge goal within the time period",
  "Only outdoor rides count towards your progress",
];

const faqs = [
  "Do I need to be an experienced cyclist to join ADCC rides?",
  "Are there specific tracks for beginners or families?",
  "What gear do I need to bring for a group ride?",
  "Can I participate in races without being a professional?",
  "How do I track my performance or join challenges?",
  "Are there any women-only rides or training sessions?",
];

export default function ChallengeDetailPage() {
  return (
    <div className="min-h-screen bg-[#eaf4ff] text-black">
      <header className="h-[134px] flex items-center justify-between px-10 md:px-20">
        <img src="/ADCC-Logo.png" alt="ADCC" className="h-[57px] w-[135px] object-contain" />

        <nav className="hidden lg:flex gap-12 text-[20px] font-medium">
          <span>About Us</span>
          <span>Events</span>
          <span>Community</span>
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
              "linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?q=80&w=1600&auto=format&fit=crop')",
          }}
        >
          <div className="absolute bottom-20 left-10 text-white">
            <span className="rounded-full bg-white/30 px-5 py-2">Active</span>
            <h1 className="mt-4 text-[40px] font-black uppercase">
              March Distance Challenge
            </h1>
          </div>
        </div>
      </section>

      <section className="px-10 py-24 text-center">
        <h2 className="text-[60px] font-black uppercase">About This Challenge</h2>
        <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
          The Corniche Coastal Route is an 18 km beginner track. Ideal for cyclists
          wanting to enjoy Abu Dhabi’s beauty on a safe, well-maintained route. It offers
          amenities for a comfortable ride, whether training or leisurely.
        </p>

        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
          Start Ride <ArrowRight size={20} />
        </button>
      </section>

      <section className="mx-auto mb-28 grid max-w-[1140px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[528px_repeat(3,1fr)]">
        <div className="grid rounded-2xl bg-[#435974] p-8 text-white md:grid-cols-[190px_1fr]">
          <div>
            <p className="text-white/70">• Join Challenge</p>
            <h3 className="mt-8 text-[40px] font-black uppercase leading-tight">
              Track your ride. Reach 200 km.
            </h3>
          </div>

          <div className="mt-8 border-white/30 md:mt-0 md:border-l md:pl-8">
            <h4 className="text-[24px] font-black uppercase">Rewards</h4>
            <div className="mt-6 grid grid-cols-2 gap-5 text-[16px] text-white/70">
              <p>ADCC Jersey + Medal</p>
              <p>Digital Badge</p>
              <p>Leaderboard Recognition</p>
            </div>
          </div>
        </div>

        {[
          ["342", "Participants"],
          ["March 31", "Ends"],
          ["ADCC Jersey", "Prize"],
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

      <section className="bg-gradient-to-b from-[#d8ebff] to-[#adc7df] px-10 py-20">
        <div className="mx-auto max-w-[1268px]">
          <div className="flex flex-col justify-between gap-8 md:flex-row">
            <h2 className="max-w-[487px] text-[50px] font-black uppercase leading-tight">
              Your Guide to Completing the Challenge
            </h2>
            <button className="h-fit rounded-full bg-[#019839] px-8 py-4 font-bold text-white">
              Join this Challenge
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[554px_1fr_1fr]">
            <img
              src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop"
              alt="Challenge"
              className="h-[439px] w-full rounded-xl object-cover"
            />

            <div className="grid gap-6">
              {steps.slice(0, 2).map((step, index) => (
                <div key={step} className="rounded-xl bg-black/20 p-8 text-white backdrop-blur">
                  <p className="text-sm">//00{index + 1}</p>
                  <h3 className="mt-8 text-[24px] font-semibold leading-[30px]">
                    {step}
                  </h3>
                </div>
              ))}
            </div>

            <div className="grid gap-6">
              {steps.slice(2).map((step, index) => (
                <div key={step} className="rounded-xl bg-black/20 p-8 text-white backdrop-blur">
                  <p className="text-sm">//00{index + 3}</p>
                  <h3 className="mt-8 text-[24px] font-semibold leading-[30px]">
                    {step}
                  </h3>
                </div>
              ))}
            </div>
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