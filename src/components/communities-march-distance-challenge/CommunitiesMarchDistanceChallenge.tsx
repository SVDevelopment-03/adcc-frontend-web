import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Cloud, ArrowRight, CalendarDays, Plus, Phone, Mail, MapPin,
  Bike, Apple, Trophy
} from "lucide-react";
import { Challenge, getChallengeById } from "../../services/challengesApi";

const FALLBACK_CHALLENGE: Challenge = {
  id: "march-distance-challenge",
  title: "March Distance Challenge",
  description: "Build consistency throughout March, track every outdoor ride with the ADCC app and complete the distance goal before the challenge ends.",
  type: "Distance",
  target: 200,
  unit: "km",
  startDate: "2026-03-01",
  endDate: "2026-03-31",
  participants: 342,
  completions: 0,
  status: "Active",
  rewardBadge: "",
  rewardBadgeName: "ADCC Jersey + Medal",
  featured: true,
  image: "/img/pexels-ander-garcia-1317358711-25016478 1.png",
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
};

export default function ChallengeDetailPage() {
  const { challengeId = "" } = useParams<{ challengeId: string }>();
  const selectedChallengeId = challengeId.trim();
  const [challenge, setChallenge] = useState<Challenge>(FALLBACK_CHALLENGE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!selectedChallengeId) {
      setChallenge(FALLBACK_CHALLENGE);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    getChallengeById(selectedChallengeId)
      .then((data) => {
        if (!cancelled) setChallenge(data);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load selected challenge:", err);
        setError("The selected challenge details could not be loaded right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedChallengeId]);

  const reward = challenge.rewardBadgeName || challenge.rewardBadge || "Completion Badge";
  const steps = useMemo(() => [
    `Register before ${formatDate(challenge.endDate)}`,
    "Track all rides using the ADCC mobile app",
    `Complete ${challenge.target} ${challenge.unit} within the challenge period`,
    `Only eligible ${challenge.type.toLowerCase()} activities count towards your progress`,
  ], [challenge]);
  const faqs = useMemo(() => [
    `How do I join ${challenge.title}?`,
    `What is the ${challenge.target} ${challenge.unit} target?`,
    `When does ${challenge.title} end?`,
    `Which activities count for this ${challenge.type.toLowerCase()} challenge?`,
    `How do I track my progress in the ADCC app?`,
    `What reward will I receive after completing ${challenge.title}?`,
  ], [challenge]);

  if (loading) return <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center"><p className="text-[22px] text-black/70">Loading challenge details...</p></main>;
  if (error) return <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center"><h1 className="text-[50px] font-black uppercase">Challenge Details</h1><p className="mt-4 text-[20px] text-black/70">{error}</p></main>;

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
            backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url('${challenge.image || FALLBACK_CHALLENGE.image}')`,
          }}
        >
          <div className="absolute bottom-20 left-10 text-white">
            <span className="rounded-full bg-white/30 px-5 py-2">{challenge.status}</span>
            <h1 className="mt-4 text-[40px] font-black uppercase">
              {challenge.title}
            </h1>
          </div>
        </div>
      </section>

      <section className="px-10 py-24 text-center">
        <h2 className="text-[60px] font-black uppercase">About This Challenge</h2>
        <p className="mx-auto mt-8 max-w-[851px] text-[24px] leading-[30px]">
          {challenge.description}
        </p>

        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white">
          Join this Challenge <ArrowRight size={20} />
        </button>
      </section>

      <section className="mx-auto mb-28 grid max-w-[1140px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[528px_repeat(3,1fr)]">
        <div className="grid rounded-2xl bg-[#435974] p-8 text-white md:grid-cols-[190px_1fr]">
          <div>
            <p className="text-white/70">• Join Challenge</p>
            <h3 className="mt-8 text-[40px] font-black uppercase leading-tight">
              Track your progress. Reach {challenge.target} {challenge.unit}.
            </h3>
          </div>

          <div className="mt-8 border-white/30 md:mt-0 md:border-l md:pl-8">
            <h4 className="text-[24px] font-black uppercase">Rewards</h4>
            <div className="mt-6 grid grid-cols-2 gap-5 text-[16px] text-white/70">
              <p>{reward}</p>
              <p>Digital Badge</p>
              <p>Leaderboard Recognition</p>
            </div>
          </div>
        </div>

        {[
          [String(challenge.participants), "Participants"],
          [formatDate(challenge.endDate), "Ends"],
          [reward, "Prize"],
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
        className="bg-gradient-to-b from-[#d8ebff] to-[#adc7df] bg-cover bg-center bg-no-repeat px-10 py-20"
        style={{ backgroundImage: "url('/img/image 3517.png')" }}
      >
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
              src={challenge.image || FALLBACK_CHALLENGE.image}
              alt={challenge.title}
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
