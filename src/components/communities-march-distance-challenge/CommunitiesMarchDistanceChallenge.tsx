import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Award, CalendarDays, Plus, Star, Trophy, Users } from "lucide-react";
import { Challenge, getChallengeById } from "../../services/challengesApi";
import { getAppStoreLink } from "../../utils/appStoreLink";

const STATUS_TAB_KEYS: Record<string, string> = {
  Active: "active",
  Upcoming: "upcoming",
  Completed: "completed",
};

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

const formatDate = (value: string, dateTbaLabel: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return dateTbaLabel;
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
};

function FaqSection({ faqs }: { faqs: string[] }) {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="w-full px-4 pb-16 pt-14 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
      <h2 className="text-[30px] font-normal uppercase sm:text-[38px] lg:text-[46px]">{t("public.tracks.faq.title")}</h2>
      <p className="mt-3 text-[15px] text-black/70 sm:text-[16px]">{t("public.tracks.faq.subtitle")}</p>
      <div className="mx-auto mt-6 grid max-w-[1098px] grid-cols-1 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-2 md:gap-5">
        {faqs.map((faq, index) => (
          <div
            key={index}
            role="button"
            tabIndex={0}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpenIndex(openIndex === index ? null : index); }}
            className="cursor-pointer overflow-hidden rounded-xl border border-[#ccc] px-4 text-start text-[16px] font-medium sm:px-6 sm:text-[20px]"
          >
            <div className="flex min-h-16 items-center justify-between gap-3 py-3 sm:min-h-25 sm:gap-4 sm:py-4">
              <span>{faq}</span>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-black text-[16px] font-normal leading-none transition-transform duration-300 sm:h-7 sm:w-7 sm:text-[18px] ${openIndex === index ? "rotate-45" : ""}`}>
                +
              </span>
            </div>
            {openIndex === index && (
              <p className="pb-5 text-[16px] font-normal leading-5 text-black/65 sm:leading-7">
                {t("public.challenges.detail.faq.answer")}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ChallengeDetailPage() {
  const { t } = useTranslation();
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
        setError(t("public.challenges.detail.loadError"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [selectedChallengeId, t]);

  const reward = challenge.rewardBadgeName || challenge.rewardBadge || t("public.challenges.detail.completionBadgeFallback");
  const steps = useMemo(() => [
    t("public.challenges.detail.steps.register", { date: formatDate(challenge.endDate, t("public.common.dateTBA")) }),
    t("public.challenges.detail.steps.trackRides"),
    t("public.challenges.detail.steps.complete", { target: challenge.target, unit: challenge.unit }),
    t("public.challenges.detail.steps.eligibleActivities", { type: challenge.type.toLowerCase() }),
  ], [challenge, t]);
  const faqs = useMemo(() => [
    t("public.challenges.detail.faq.questions.join", { title: challenge.title }),
    t("public.challenges.detail.faq.questions.target", { target: challenge.target, unit: challenge.unit }),
    t("public.challenges.detail.faq.questions.end", { title: challenge.title }),
    t("public.challenges.detail.faq.questions.activities", { type: challenge.type.toLowerCase() }),
    t("public.challenges.detail.faq.questions.trackProgress"),
    t("public.challenges.detail.faq.questions.reward", { title: challenge.title }),
  ], [challenge, t]);
  const statusLabel = STATUS_TAB_KEYS[challenge.status]
    ? t(`public.challenges.tabs.${STATUS_TAB_KEYS[challenge.status]}`)
    : challenge.status;

  if (loading) return <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center"><p className="text-[22px] text-black/70">{t("public.challenges.detail.loading")}</p></main>;
  if (error) return <main className="min-h-[420px] bg-[#eaf4ff] px-10 py-24 text-center"><h1 className="text-[50px] font-normal uppercase">{t("public.challenges.detail.errorHeading")}</h1><p className="mt-4 text-[20px] text-black/70">{error}</p></main>;

  const heroImage = (challenge.image || FALLBACK_CHALLENGE.image).replace(/^['"]+|['"]+$/g, "");

  return (
    <div className="font-satoshi min-h-screen bg-[#eaf4ff] text-black">
      <style>{`.challenge-guide-section { background-image: url('/img/image 3518.png'); background-size: cover; background-position: center; background-repeat: no-repeat; }`}</style>
      {/* Hero — full-width, consistent with other inner pages */}
      <section
        className="relative w-full overflow-hidden public-hero-bleed"
        style={{ height: "100vh", minHeight: 480 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,.4),rgba(0,0,0,.4)),url("${heroImage}")`,
          }}
          aria-hidden
        />
        <div className="public-hero-content-pos">
          <div className="mb-3">
            <span className="rounded-full bg-white/30 px-5 py-2 text-[14px] font-medium text-white backdrop-blur sm:text-[16px]">
              {statusLabel}
            </span>
          </div>
          <h1 className="text-[34px] font-normal uppercase leading-tight text-white sm:text-[40px] lg:text-[50px]">
            {challenge.title}
          </h1>
        </div>
      </section>

      {/* About */}
      <section className="px-4 py-14 text-center sm:px-6 sm:py-16 md:px-10 lg:py-24">
        <h2 className="text-[28px] font-normal uppercase sm:text-[38px] md:text-[48px] lg:text-[56px]">{t("public.challenges.detail.aboutHeading")}</h2>
        <p className="mx-auto mt-4 max-w-[851px] text-[14px] leading-relaxed sm:mt-6 sm:text-[17px] md:text-[20px] lg:text-[22px]">
          {challenge.description}
        </p>
        <a
          href={getAppStoreLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#019839] px-6 py-3 text-[16px] font-bold text-white sm:px-8 sm:py-4 sm:text-[18px]"
        >
          {t("public.challenges.detail.joinButton")} <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
        </a>
      </section>

      {/* Stats strip */}
      <section className="mx-auto mb-16 max-w-[min(1192px,calc(100vw-2rem))] rounded-2xl bg-[#A2BFDB] p-4 lg:mb-28">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,180px)]">
          <div className="rounded-2xl bg-[#435974] p-5 text-white sm:p-8">
            <p className="text-[13px] text-white/70 sm:text-[14px]">• {t("public.common.joinChallenge")}</p>
            <div className="mt-4 sm:mt-8 sm:flex sm:gap-8">
              <h3 className="flex-1 text-[22px] font-bold uppercase leading-tight sm:text-[26px] lg:text-[32px]">
                {t("public.challenges.detail.trackProgress", { target: challenge.target, unit: challenge.unit })}
              </h3>
              <div className="my-5 h-px bg-white/20 sm:my-0 sm:h-auto sm:w-px sm:self-stretch" />
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/60 sm:text-[12px]">{t("public.challenges.detail.rewardsHeading")}</h4>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:mt-4 sm:gap-y-4">
                  {([
                    [Trophy, reward],
                    [Award, t("public.challenges.detail.rewardDigitalBadge")],
                    [Star, t("public.challenges.detail.rewardLeaderboard")],
                  ] as [typeof Trophy, string][]).map(([Icon, label]) => (
                    <p key={label} className="flex items-center gap-2 text-[12px] text-white/80 sm:text-[14px]">
                      <Icon size={13} className="shrink-0 opacity-70" />
                      {label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {([
            [Users, String(challenge.participants), t("public.challenges.detail.stats.participants")],
            [CalendarDays, formatDate(challenge.endDate, t("public.common.dateTBA")), t("public.challenges.detail.stats.ends")],
            [Trophy, reward, t("public.challenges.detail.stats.prize")],
          ] as [typeof Users, string, string][]).map(([Icon, value, label]) => (
            <div key={label} className="rounded-xl bg-[#435974] p-5 text-white sm:p-8">
              <span className="inline-flex rounded-full bg-white p-3 text-[#019839] sm:p-4">
                <Icon size={20} className="sm:hidden" />
                <Icon size={25} className="hidden sm:block" />
              </span>
              <h3 className="mt-10 text-[22px] font-normal uppercase sm:mt-20 sm:text-[26px] lg:text-[30px]">{value}</h3>
              <p className="text-[13px] text-white/60 sm:text-[17px] lg:text-[20px]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guide section */}
      <section className="challenge-guide-section px-4 py-14 sm:px-6 sm:py-16 md:px-10 lg:py-20">
        <div className="mx-auto max-w-[1268px]">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <h2 className="max-w-[487px] text-[22px] font-normal uppercase leading-tight sm:text-[30px] lg:text-[46px]">
              {t("public.challenges.detail.guideHeading")}
            </h2>
            <a
              href={getAppStoreLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-fit items-center gap-3 self-center rounded-full bg-[#019839] px-5 py-2.5 text-[16px] font-bold text-white sm:px-8 sm:py-4 md:self-auto"
            >
              {t("public.challenges.detail.joinButton")} <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
            </a>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:mt-14 lg:grid-cols-[554px_1fr_1fr]">
            <img
              src={challenge.image || FALLBACK_CHALLENGE.image}
              alt={challenge.title}
              className="h-[220px] w-full rounded-xl object-cover sm:h-[340px] lg:h-[420px]"
            />
            <div className="grid gap-4 sm:gap-5">
              {steps.slice(0, 2).map((step, index) => (
                <div key={step} className="font-satoshi rounded-xl bg-black/20 p-5 text-white backdrop-blur sm:p-8">
                  <p className="text-xs sm:text-sm">//00{index + 1}</p>
                  <h3 className="mt-4 text-[14px] font-normal leading-snug sm:mt-8 sm:text-[18px] lg:text-[22px]">{step}</h3>
                </div>
              ))}
            </div>
            <div className="grid gap-4 sm:gap-5">
              {steps.slice(2).map((step, index) => (
                <div key={step} className="font-satoshi rounded-xl bg-black/20 p-5 text-white backdrop-blur sm:p-8">
                  <p className="text-xs sm:text-sm">//00{index + 3}</p>
                  <h3 className="mt-4 text-[14px] font-normal leading-snug sm:mt-8 sm:text-[18px] lg:text-[22px]">{step}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {/* <FaqSection faqs={faqs} /> */}
    </div>
  );
}
