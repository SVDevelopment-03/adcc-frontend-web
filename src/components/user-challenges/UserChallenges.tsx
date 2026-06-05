import { useEffect, useState } from "react";
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
import {
  getChallengesPage,
  type Challenge,
} from "../../services/challengesApi";

const navLinks = ["About Us", "Events", "Community", "Tracks"];

const PAGE_SIZE = 4;
const CHALLENGE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop";
const statusTabs: Array<Challenge["status"]> = ["Active", "Upcoming", "Completed"];

const faqs = [
  "Do I need to be an experienced cyclist to join ADCC rides?",
  "Are there specific tracks for beginners or families?",
  "What gear do I need to bring for a group ride?",
  "Can I participate in races without being a professional?",
  "How do I track my performance or join challenges?",
  "Are there any women-only rides or training sessions?",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en", { notation: value >= 10000 ? "compact" : "standard" }).format(value);

const getDaysText = (challenge: Challenge) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(challenge.endDate);
  endDate.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / 86400000);

  if (challenge.status === "Completed") return "Completed";
  if (!Number.isFinite(diffDays)) return "Date TBA";
  if (diffDays < 0) return "Ended";
  if (diffDays === 0) return "Ends today";
  return `${diffDays} day${diffDays === 1 ? "" : "s"} left`;
};

const getChallengeDescription = (challenge: Challenge) => {
  if (challenge.description) return challenge.description;
  return `${challenge.type} challenge: complete ${challenge.target} ${challenge.unit}`;
};

export default function ChallengesPage() {
  const [status, setStatus] = useState<Challenge["status"]>("Active");
  const [page, setPage] = useState(1);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState([
    { value: "0", label: "Challenge Riders", active: true },
    { value: "0", label: "Active Challenges" },
    { value: "0", label: "Upcoming Challenges" },
    { value: "0", label: "Completed Challenges" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadChallenges = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getChallengesPage({
          status,
          page,
          limit: PAGE_SIZE,
        });

        if (mounted) {
          setChallenges(response.challenges);
          setTotalResults(response.pagination.total);
          setTotalPages(Math.max(1, response.pagination.pages || 1));
        }
      } catch (err) {
        console.error("Failed to load public challenges:", err);
        if (mounted) {
          setChallenges([]);
          setTotalResults(0);
          setTotalPages(1);
          setError("Unable to load challenges right now.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadChallenges();

    return () => {
      mounted = false;
    };
  }, [status, page]);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const [active, upcoming, completed, publicChallenges] = await Promise.all([
          getChallengesPage({ status: "Active", page: 1, limit: 1 }),
          getChallengesPage({ status: "Upcoming", page: 1, limit: 1 }),
          getChallengesPage({ status: "Completed", page: 1, limit: 1 }),
          getChallengesPage({ page: 1, limit: 100 }),
        ]);
        const riders = publicChallenges.challenges.reduce(
          (sum, challenge) => sum + (challenge.participants || 0),
          0,
        );

        if (mounted) {
          setStats([
            { value: formatNumber(riders), label: "Challenge Riders", active: true },
            { value: formatNumber(active.pagination.total), label: "Active Challenges" },
            { value: formatNumber(upcoming.pagination.total), label: "Upcoming Challenges" },
            { value: formatNumber(completed.pagination.total), label: "Completed Challenges" },
          ]);
        }
      } catch (err) {
        console.error("Failed to load challenge stats:", err);
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

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
            "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.1)), url('/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png')",
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
          src="/img/SSYouTube.online_Falcon_daman.png"
          alt="ADCC Flag"
          className="h-[465px] w-full rounded-xl object-cover"
        />
      </section>

      {/* Challenges */}
      <section className="mx-auto max-w-[1260px] px-10 pb-28">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <h2 className="text-[36px] font-black uppercase">Cycling Challenges</h2>

          <div className="flex gap-5">
            {statusTabs.map((tab) => {
              const selected = status === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setStatus(tab);
                    setPage(1);
                  }}
                  className={`rounded-full px-14 py-4 text-[16px] ${
                    selected
                      ? "bg-[#00a84f] font-bold text-white"
                      : "border border-[#cad8e6] text-[#6f7f8f]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mb-6 text-[15px] font-medium">
          {loading ? "Loading challenges..." : `Showing ${totalResults} ${status.toLowerCase()} challenges`}
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {challenges.map((item) => (
            <div
              key={item.id}
              // className={`overflow-hidden rounded-xl border border-[#cad8e6] ${
              //   item.active ? "bg-[#49637f] text-white" : "bg-[#eef7ff]"
              // }`}
              className="group overflow-hidden rounded-xl border border-[#cad8e6] bg-[#eef7ff] transition-all duration-300 hover:bg-[#49637f] hover:text-white"
            >
              <img
                src={item.image || CHALLENGE_FALLBACK_IMAGE}
                alt={item.title}
                className="h-[330px] w-full object-cover"
              />

              <div className="p-8">
                <h3 className="text-[24px] font-black uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 text-[15px]">{getChallengeDescription(item)}</p>

                <div
                  // className={`mt-8 flex items-center justify-between rounded-md px-6 py-5 ${
                  //   item.active ? "bg-[#89a2bf]" : "bg-[#89a2bf]"
                  // } text-white`}
                  className="mt-8 flex items-center justify-between rounded-md bg-[#89a2bf] px-6 py-5 text-white transition-all duration-300 group-hover:bg-[#6f89a7]"
                >
                  <div className="space-y-2 text-[15px]">
                    <p className="flex items-center gap-2">
                      <Clock size={16} /> {getDaysText(item)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users size={16} /> {formatNumber(item.participants)} participants
                    </p>
                    <p className="flex items-center gap-2">
                      <Trophy size={16} /> {item.target} {item.unit}
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

        {!loading && error && (
          <p className="pt-8 text-[16px] font-medium text-red-700">{error}</p>
        )}

        {!loading && !error && challenges.length === 0 && (
          <p className="pt-8 text-[16px] text-black/70">
            No {status.toLowerCase()} challenges found.
          </p>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-[#cad8e6] px-5 py-3 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1)
              .map((item, index, visiblePages) => (
                <span key={item} className="flex items-center gap-3">
                  {index > 0 && item - visiblePages[index - 1] > 1 && (
                    <span className="text-[#00a84f]">...</span>
                  )}
                  <button
                    onClick={() => setPage(item)}
                    className={`h-11 w-11 rounded-full text-[15px] font-semibold ${
                      page === item
                        ? "bg-[#00a84f] text-white"
                        : "text-[#00a84f]"
                    }`}
                  >
                    {item}
                  </button>
                </span>
              ))}
            <button
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              disabled={page === totalPages}
              className="rounded-full border border-[#cad8e6] px-5 py-3 text-[14px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
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
