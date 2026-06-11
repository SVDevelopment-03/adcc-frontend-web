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
import { motion } from "framer-motion";

const navLinks = ["About Us", "Events", "Community", "Tracks"];

const PAGE_SIZE = 4;
const CHALLENGE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=1200&auto=format&fit=crop";
const statusTabs: Array<Challenge["status"]> = ["Active", "Upcoming", "Completed"];

const faqs = [
  {
    q: "Do I need to be an experienced cyclist to join ADCC rides?",
    a: "Not at all! ADCC welcomes riders of all experience levels. We have beginner-friendly rides as well as advanced training sessions to suit everyone.",
  },
  {
    q: "Are there specific tracks for beginners or families?",
    a: "Yes! We have several easy, flat tracks such as Corniche Seafront and Saadiyat Island Loop that are perfect for beginners and family outings.",
  },
  {
    q: "What gear do I need to bring for a group ride?",
    a: "A road-worthy bike, a helmet, water, and appropriate cycling attire. We recommend lights for early morning or evening rides.",
  },
  {
    q: "Can I participate in races without being a professional?",
    a: "Absolutely. Many of our races have categories for recreational riders. Check individual event details for age and skill category breakdowns.",
  },
  {
    q: "How do I track my performance or join challenges?",
    a: "Download the ADCC app to log your rides, join challenges, and track your progress alongside thousands of community members.",
  },
  {
    q: "Are there any women-only rides or training sessions?",
    a: "Yes! ADCC organises regular women-only rides and training sessions. Check our events calendar for upcoming sessions.",
  },
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
    // <div className="min-h-screen bg-[#eaf4ff] text-black">
    <div className="min-h-screen overflow-x-hidden bg-[#eaf4ff] text-black">
      {/* Header */}
      <header className="flex h-[78px] items-center justify-between bg-[#eaf4ff] px-4 sm:h-[96px] sm:px-6 md:px-10 lg:h-[134px] lg:px-20">
        <div className="flex items-center gap-2">
          <img
            src="/ADCC-Logo.png"
            alt="ADCC Logo"
            className="h-auto w-[112px] object-contain sm:w-[125px] lg:h-[57px] lg:w-[135px]"
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

        <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
          <Cloud size={22} className="text-[#34495e]" />
          <span className="hidden sm:block text-[15px] font-medium lg:text-[17px]">English</span>
          <button className="rounded-full bg-black px-5 py-3 text-[14px] font-bold text-white sm:px-6 lg:px-8 lg:py-4 lg:text-[18px]">
            Menu
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative h-[320px] bg-cover bg-center sm:h-[440px] md:h-[540px] lg:h-[635px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,.55), rgba(0,0,0,.1)), url('/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png')",
        }}
      >
        <div className="absolute bottom-10 left-4 right-4 text-white sm:bottom-14 sm:left-6 md:bottom-20 md:left-10 lg:left-20">
          <h1 className="text-[38px] font-black uppercase leading-none tracking-tight sm:text-[42px]">
            {["Challenges"].map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.12,
                }}
                style={{
                  display: "inline-block",
                  marginRight: "14px",
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <p className="mt-3 text-[16px] sm:mt-4 sm:text-[18px] overflow-hidden">
            {["Home", "/", "Challenges"].map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="mr-2 inline-block overflow-hidden"
              >
                <motion.span
                  className="inline-block"
                  initial={{
                    y: "120%",
                    opacity: 0,
                  }}
                  animate={{
                    y: "0%",
                    opacity: 1,
                  }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="grid w-full grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:grid-cols-2 lg:gap-12 lg:px-16 lg:py-28 xl:px-20 2xl:px-24">
        <div>
          <motion.h2
            className="max-w-[620px] text-[32px] font-black uppercase leading-tight sm:text-[38px] lg:text-[44px] overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {["Push", "your", "limits", "with", "cycling", "challenges", "in", "Abu", "Dhabi"].map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="mr-3 inline-block overflow-hidden"
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: {
                      y: "120%",
                      opacity: 0,
                    },
                    visible: {
                      y: "0%",
                      opacity: 1,
                    },
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>
          <p className="mt-5 max-w-[560px] text-[15px] leading-relaxed sm:mt-8 sm:text-[17px]">
            Abu Dhabi Cycling Club provides exciting opportunities for endurance
            rides and competitive challenges. Whether chasing distance, speed, or
            competing, our challenges keep you motivated.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              className={`rounded-xl border p-5 sm:p-6 lg:p-8 ${
                item.active
                  ? "bg-[#49637f] text-white"
                  : "border-[#d7e3ef] bg-[#edf6ff]"
              }`}
            >
              <Users size={32} />
              <h3 className="mt-4 text-[24px] font-black sm:text-[28px]">{item.value}</h3>
              <p className="mt-1 text-[14px] sm:text-[16px]">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flag Image */}
      <section className="w-full px-4 pb-16 sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <motion.img
          src="/img/SSYouTube.online_Falcon_daman.png"
          alt="ADCC Flag"
          initial={{ opacity: 0, y: 120 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          viewport={{ once: true }}
          className="h-[220px] w-full rounded-xl object-cover sm:h-[320px] lg:h-[465px]"
        />
      </section>

      {/* Challenges */}
      <section className="w-full px-4 pb-16 sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center lg:mb-14">
          {/* <h2 className="text-[30px] font-black uppercase sm:text-[36px]">Cycling Challenges</h2> */}
          <motion.h2
            className="text-[30px] font-black uppercase sm:text-[36px] overflow-hidden"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {["Cycling", "Challenges"].map((word, index) => (
              <span
                key={word}
                className="mr-4 inline-block overflow-hidden"
              >
                <motion.span
                  className="inline-block"
                  variants={{
                    hidden: {
                      y: "120%",
                      opacity: 0,
                    },
                    visible: {
                      y: "0%",
                      opacity: 1,
                    },
                  }}
                  transition={{
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:flex md:gap-5"
          >
            {statusTabs.map((tab) => {
              const selected = status === tab;

              return (
                <span
                  key={tab}
                  className="inline-block overflow-hidden rounded-full"
                >
                  <motion.button
                    variants={{
                      hidden: {
                        y: "120%",
                        opacity: 0,
                      },
                      visible: {
                        y: "0%",
                        opacity: 1,
                      },
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={() => {
                      setStatus(tab);
                      setPage(1);
                    }}
                    className={`rounded-full px-5 py-3 text-[15px] sm:px-6 md:px-8 lg:px-14 lg:py-4 lg:text-[16px] ${
                      selected
                        ? "bg-[#00a84f] font-bold text-white"
                        : "border border-[#cad8e6] text-[#6f7f8f]"
                    }`}
                  >
                    {tab}
                  </motion.button>
                </span>
              );
            })}
          </motion.div>
        </div>

        <p className="mb-6 text-[15px] font-medium">
          {loading ? "Loading challenges..." : `Showing ${totalResults} ${status.toLowerCase()} challenges`}
        </p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8"
        >
          {challenges.map((item, index) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: {
                  opacity: 0,
                  y: "120%",
                },
                visible: {
                  opacity: 1,
                  y: "0%",
                },
              }}
              transition={{
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group challenge-card overflow-hidden rounded-xl border border-[#cad8e6] bg-[#eef7ff] transition-all duration-300 hover:bg-[#435974] hover:text-white"
            >
              <div className="adcc-image overflow-hidden">
                <img
                  className="adcc-image__img h-[220px] w-full object-cover sm:h-[280px] lg:h-[330px]"
                  src={item.image || CHALLENGE_FALLBACK_IMAGE}
                  alt={item.title}
                />
              </div>

              <div className="p-5 sm:p-6 lg:p-8">
                <h3 className="text-[21px] font-black uppercase sm:text-[24px]">
                  {item.title}
                </h3>

                <p className="mt-2 text-[15px]">
                  {getChallengeDescription(item)}
                </p>

                <div className="mt-6 flex flex-col gap-5 rounded-md bg-[#89a2bf] px-4 py-5 text-white transition-all duration-300 group-hover:bg-[#435974] sm:mt-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="space-y-2 text-[15px]">
                    <p className="flex items-center gap-2">
                      <Clock size={16} /> {getDaysText(item)}
                    </p>

                    <p className="flex items-center gap-2">
                      <Users size={16} />{" "}
                      {formatNumber(item.participants)} participants
                    </p>

                    <p className="flex items-center gap-2">
                      <Trophy size={16} /> {item.target} {item.unit}
                    </p>
                  </div>

                  <button className="rounded-full border border-white px-5 py-3 text-[13px] font-semibold sm:px-6">
                    Join The Challenge
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!loading && error && (
          <p className="pt-8 text-[16px] font-medium text-red-700">{error}</p>
        )}

        {!loading && !error && challenges.length === 0 && (
          <p className="pt-8 text-[16px] text-black/70">
            No {status.toLowerCase()} challenges found.
          </p>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:mt-12 sm:gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-[#cad8e6] px-4 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3 sm:text-[14px]"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 1)
              .map((item, index, visiblePages) => (
                <span key={item} className="flex items-center gap-2 sm:gap-3">
                  {index > 0 && item - visiblePages[index - 1] > 1 && (
                    <span className="text-[#00a84f]">...</span>
                  )}
                  <button
                    onClick={() => setPage(item)}
                    className={`h-10 w-10 rounded-full text-[14px] font-semibold sm:h-11 sm:w-11 sm:text-[15px] ${
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
              className="rounded-full border border-[#cad8e6] px-4 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:py-3 sm:text-[14px]"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="w-full px-4 pb-16 text-center sm:px-6 md:px-10 lg:px-16 lg:pb-28 xl:px-20 2xl:px-24">
        <motion.h2
          className="text-[30px] font-black uppercase sm:text-[34px] overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {"Frequently Asked Questions".split(" ").map((word, index) => (
            <span
              key={index}
              className="mr-3 inline-block overflow-hidden"
            >
              <motion.span
                className="inline-block"
                variants={{
                  hidden: {
                    y: "120%",
                    opacity: 0,
                  },
                  visible: {
                    y: "0%",
                    opacity: 1,
                  },
                }}
                transition={{
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        <p className="mt-4 text-[15px]">
          Got questions before hitting the road? We’ve got you covered.
        </p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="mt-8 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-2 md:gap-5"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              variants={{
                hidden: {
                  opacity: 0,
                  y: "120%",
                },
                visible: {
                  opacity: 1,
                  y: "0%",
                },
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              role="button"
              tabIndex={0}
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ")
                  setOpenFaq(openFaq === index ? null : index);
              }}
              className="cursor-pointer rounded-lg border border-[#cad8e6] bg-[#eef7ff] px-4 text-left text-[15px] font-medium sm:px-7 sm:text-[16px]"
            >
              <div className="flex min-h-[72px] items-center justify-between gap-4 py-5 sm:min-h-[84px] sm:py-6">
                <span>
                  {String(index + 1).padStart(2, "0")}. {faq.q}
                </span>

                <Plus
                  className={`shrink-0 transition-transform ${
                    openFaq === index ? "rotate-45" : ""
                  }`}
                  size={18}
                />
              </div>

              {openFaq === index && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.35 }}
                  className="pb-5 text-[14px] font-normal leading-6 text-black/65 sm:text-[15px]"
                >
                  {faq.a}
                </motion.p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full px-4 py-14 sm:px-6 md:px-10 lg:px-16 lg:py-24 xl:px-20 2xl:px-24">
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

            <div className="mt-7 flex max-w-[360px] flex-col rounded-md bg-white p-2 sm:flex-row">
              <input
                placeholder="Enter your email"
                className="min-h-11 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none"
              />
              <button className="min-h-11 rounded bg-[#00a84f] px-8 py-3 text-sm font-bold text-white">
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

        <button className="fixed bottom-5 right-5 rounded-full bg-[#00a84f] p-3 text-white shadow-lg sm:bottom-10 sm:right-10 sm:p-4">
          <Bike size={28} />
        </button>
      </footer>
    </div>
  );
}
