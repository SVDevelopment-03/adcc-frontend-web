import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Plus } from "lucide-react";
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

function FaqSection({ faqs }: { faqs: string[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="w-full px-4 pb-16 pt-14 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
      <h2 className="text-[30px] font-normal uppercase sm:text-[38px] lg:text-[46px]">Frequently Asked Questions</h2>
      <p className="mt-3 text-[15px] text-black/70 sm:text-[16px]">Got questions before hitting the road? We've got you covered.</p>
      <div className="mx-auto mt-8 grid max-w-[1098px] grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 md:gap-5">
        {faqs.map((faq, index) => (
          <div
            key={faq}
            role="button"
            tabIndex={0}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpenIndex(openIndex === index ? null : index); }}
            className="cursor-pointer rounded-lg border border-[#cad8e6] bg-[#eef7ff] px-4 text-left text-[15px] font-medium sm:px-7 sm:text-[16px]"
            style={{ fontFamily: "'Outfit', 'Satoshi', sans-serif" }}
          >
            <div className="flex min-h-17 items-center justify-between gap-4 py-5 sm:min-h-20 sm:py-6">
              <span>{faq}</span>
              <Plus size={18} className="shrink-0 transition-transform duration-300" style={{ transform: openIndex === index ? "rotate(45deg)" : "rotate(0deg)" }} />
            </div>
            {openIndex === index && (
              <p className="pb-5 text-[14px] font-normal leading-6 text-black/65 sm:text-[15px]">
                For more information about this topic, please contact our support team or refer to the challenge guidelines.
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

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
  if (error) return <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center"><h1 className="text-[50px] font-normal uppercase">Challenge Details</h1><p className="mt-4 text-[20px] text-black/70">{error}</p></main>;

  return (
    <div className="font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      {/* Hero — full-width, consistent with other inner pages */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(300px, 45vw, 500px)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url(‘${challenge.image || FALLBACK_CHALLENGE.image}’)`,
          }}
          aria-hidden
        />
        <div className="public-hero-content-pos">
          <div className="mb-3">
            <span className="rounded-full bg-white/30 px-5 py-2 text-[14px] font-medium text-white backdrop-blur sm:text-[16px]">
              {challenge.status}
            </span>
          </div>
          <h1 className="text-[30px] font-normal uppercase leading-tight text-white sm:text-[40px] lg:text-[50px]">
            {challenge.title}
          </h1>
        </div>
      </section>

      {/* About */}
      <section className="px-4 py-14 text-center sm:px-6 sm:py-16 md:px-10 lg:py-24">
        <h2 className="text-[28px] font-normal uppercase sm:text-[38px] md:text-[48px] lg:text-[56px]">About This Challenge</h2>
        <p className="mx-auto mt-4 max-w-[851px] text-[14px] leading-relaxed sm:mt-6 sm:text-[17px] md:text-[20px] lg:text-[22px]">
          {challenge.description}
        </p>
        <button className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[16px] font-bold text-white sm:px-8 sm:py-4 sm:text-[18px]">
          Join this Challenge <ArrowRight size={18} />
        </button>
      </section>

      {/* Stats strip */}
      <section className="mx-auto mb-16 grid max-w-[1140px] grid-cols-1 gap-4 rounded-2xl bg-[#323232] p-4 lg:grid-cols-[528px_repeat(3,1fr)]">
        <div className="grid rounded-2xl bg-[#435974] p-5 text-white sm:p-8 md:grid-cols-[190px_1fr]">
          <div>
            <p className="text-[13px] text-white/70 sm:text-[14px]">• Join Challenge</p>
            <h3 className="mt-4 text-[20px] font-normal uppercase leading-tight sm:mt-8 sm:text-[28px] lg:text-[36px]">
              Track your progress. Reach {challenge.target} {challenge.unit}.
            </h3>
          </div>
          <div className="mt-5 border-white/30 sm:mt-8 md:mt-0 md:border-l md:pl-8">
            <h4 className="text-[16px] font-normal uppercase sm:text-[20px] lg:text-[24px]">Rewards</h4>
            <div className="mt-3 grid grid-cols-2 gap-3 text-[13px] text-white/70 sm:mt-4 sm:gap-4 sm:text-[15px]">
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
          <div key={label} className="rounded-xl bg-[#435974] p-5 text-white sm:p-8">
            <span className="inline-flex rounded-full bg-white p-3 text-[#019839]">
              <CalendarDays size={20} />
            </span>
            <h3 className="mt-8 text-[18px] font-normal uppercase sm:mt-16 sm:text-[24px] lg:text-[28px]">{value}</h3>
            <p className="text-[13px] text-white/60 sm:text-[16px] lg:text-[18px]">{label}</p>
          </div>
        ))}
      </section>

      {/* Guide section */}
      <section
        className="bg-cover bg-center bg-no-repeat px-4 py-14 sm:px-6 sm:py-16 md:px-10 lg:py-20"
        style={{ backgroundImage: "url(‘/img/image 3517.png’)", background: "linear-gradient(to bottom, #d8ebff, #adc7df)" }}
      >
        <div className="mx-auto max-w-[1268px]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <h2 className="max-w-[487px] text-[22px] font-normal uppercase leading-tight sm:text-[30px] lg:text-[46px]">
              Your Guide to Completing the Challenge
            </h2>
            <button className="h-fit rounded-full bg-[#019839] px-5 py-2.5 text-[14px] font-bold text-white sm:px-8 sm:py-4 sm:text-[16px]">
              Join this Challenge
            </button>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-14 lg:grid-cols-[554px_1fr_1fr]">
            <img
              src={challenge.image || FALLBACK_CHALLENGE.image}
              alt={challenge.title}
              className="h-[220px] w-full rounded-xl object-cover sm:h-[340px] lg:h-[420px]"
            />
            <div className="grid gap-4 sm:gap-5">
              {steps.slice(0, 2).map((step, index) => (
                <div key={step} className="rounded-xl bg-black/20 p-5 text-white backdrop-blur sm:p-8">
                  <p className="font-satoshi text-xs sm:text-sm">//00{index + 1}</p>
                  <h3 className="font-satoshi mt-4 text-[14px] font-normal leading-snug sm:mt-8 sm:text-[18px] lg:text-[22px]">{step}</h3>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5">
              {steps.slice(2).map((step, index) => (
                <div key={step} className="rounded-xl bg-black/20 p-5 text-white backdrop-blur sm:p-8">
                  <p className="font-satoshi text-xs sm:text-sm">//00{index + 3}</p>
                  <h3 className="font-satoshi mt-4 text-[14px] font-normal leading-snug sm:mt-8 sm:text-[18px] lg:text-[22px]">{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection faqs={faqs} />
    </div>
  );
}
