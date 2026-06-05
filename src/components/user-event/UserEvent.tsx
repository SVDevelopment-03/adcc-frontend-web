import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { EventApiResponse, GetEventsParams, getEventsPage } from "../../services/eventsApi";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&family=Bebas+Neue&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #EAF4FF; font-family: 'Outfit', sans-serif; color: #000; }
    .bebas { font-family: 'Bebas Kai','Bebas Neue', sans-serif; font-weight: 400; letter-spacing: 0.02em; }
    a { text-decoration: none; color: inherit; }
    select { appearance: none; -webkit-appearance: none; background: transparent; border: none; outline: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 18px; color: #000; width: 100%; padding-right: 28px; }
  `}</style>
);

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      width: "100%", height: 134, background: "#EAF4FF",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 82px", borderBottom: "1px solid rgba(0,0,0,0.06)"
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="bebas" style={{ fontSize: 26, lineHeight: 1, letterSpacing: 2 }}>
          ABU<span style={{ color: "#019839" }}>◉</span>DHABI
        </span>
        <span style={{ fontSize: 10, letterSpacing: 3, color: "#333", textTransform: "uppercase", fontWeight: 500 }}>CYCLING CLUB</span>
        <div style={{ height: 3, background: "#019839", borderRadius: 2, marginTop: 2 }} />
      </div>
      <nav style={{ display: "flex", gap: 48, alignItems: "center" }}>
        {["About Us", "Events", "Community", "Tracks"].map((l) => (
          <a key={l} href="#" style={{
            fontWeight: 500, fontSize: 20, color: "#000",
            borderBottom: l === "Events" ? "2px solid #019839" : "2px solid transparent",
            paddingBottom: 2, transition: "border-color .2s"
          }}>{l}</a>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontSize: 17, fontWeight: 500 }}>🌤 English</span>
        <button style={{
          background: "#000", color: "#fff", border: "none", borderRadius: 30,
          padding: "13px 28px", fontWeight: 700, fontSize: 18, cursor: "pointer"
        }}>Menu</button>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ position: "relative", width: "100%", height: 640, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)), url('/img/pexels-jonathanborba-19431221 1.png')",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div style={{ position: "absolute", bottom: 90, left: 82 }}>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 22 }}>Home / Events</p>
        <h1 className="bebas" style={{ fontSize: 70, color: "#fff", lineHeight: 1, marginTop: 8, textTransform: "uppercase" }}>Events</h1>
      </div>
    </section>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader() {
  return (
    <section style={{ background: "#EAF4FF", padding: "64px 82px 40px", textAlign: "center" }}>
      <h2 className="bebas" style={{ fontSize: 50, lineHeight: 1.2, textTransform: "capitalize", maxWidth: 560, margin: "0 auto 16px" }}>
        Join the Most Exciting Cycling Events in Abu Dhabi
      </h2>
      <p style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.6)", maxWidth: 444, margin: "0 auto", lineHeight: 1.6 }}>
        Explore races, community rides, and challenges by Abu Dhabi Cycling Club. Find events for your location and skill.
      </p>
    </section>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────
interface EventFilters {
  city: string;
  category: string;
  level: string;
  status: string;
}

const DEFAULT_FILTERS: EventFilters = {
  city: "All Cities",
  category: "All Categories",
  level: "All Levels",
  status: "Status",
};

function FilterBar({
  filters,
  setFilters,
  onSearch,
  loading,
}: {
  filters: EventFilters;
  setFilters: Dispatch<SetStateAction<EventFilters>>;
  onSearch: () => void;
  loading: boolean;
}) {
  const dropdownStyle = {
    boxSizing: "border-box", width: 260, height: 66,
    background: "#fff", border: "1px solid rgba(0,0,0,0.05)",
    borderRadius: 40, display: "flex", alignItems: "center",
    padding: "0 20px 0 28px", cursor: "pointer", position: "relative"
  };
  const ChevronDown = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 9l6 6 6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    // <div style={{ padding: "0 82px 24px", display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
    <div style={{ padding: "0 82px 24px", display: "flex", gap: 18, alignItems: "center", gridTemplateColumns: "repeat(3, 403px)" }}>
      {[
        { key: "city", label: "All Cities", options: ["All Cities", "Abu Dhabi", "Dubai", "Sharjah", "Al Ain"] },
        { key: "category", label: "All Categories", options: ["All Categories", "Race", "Community Ride", "Training & Clinics", "Awareness Rides", "Family & Kids", "Corporate Events", "National Events"] },
        { key: "level", label: "All Levels", options: ["All Levels", "beginner", "intermediate", "advanced", "all"] },
        { key: "status", label: "Status", options: ["Status", "Upcoming", "Ongoing", "Completed"] },
      ].map(f => (
        <div key={f.key} style={dropdownStyle}>
          <select value={filters[f.key as keyof EventFilters]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}>
            {f.options.map(o => <option key={o}>{o}</option>)}
          </select>
          <ChevronDown />
        </div>
      ))}
      <button onClick={onSearch} style={{
        width: 156, height: 66, background: "#019839", color: "#fff",
        border: "none", borderRadius: 40, fontSize: 20, fontWeight: 700,
        cursor: "pointer", fontFamily: "'Satoshi',sans-serif", transition: "opacity .2s"
      }}>{loading ? "Loading..." : "Search"}</button>
    </div>
  );
}

// ── Event card ────────────────────────────────────────────────────────────────
function EventCard({ event }: { event: EventApiResponse }) {
  const tag = event.category || "Event";
  const image = event.eventImage || event.mainImage || event.galleryImages?.[0] || "https://images.unsplash.com/photo-1471897488648-5eae4ac6d485?w=600&q=80";
  const participants = event.currentParticipants ?? event.registrations ?? 0;
  const tagColors = {
    Race: "#1a6dff", Leisure: "#9b59b6", Challenge: "#e67e22", Community: "#019839"
  };
  return (
    // <div style={{ width: 403, display: "flex", flexDirection: "column", gap: 0 }}>
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* image box */}
      <div style={{
        width: "100%", height: 260, borderRadius: 14, overflow: "hidden",
        position: "relative", background: "#ddd"
      }}>
        <img src={image} alt={event.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{
          position: "absolute", top: 16, right: 16,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(15px)",
          borderRadius: 30, padding: "9px 18px",
          color: "#fff", fontFamily: "'Satoshi',sans-serif", fontSize: 15, fontWeight: 500
        }}>{tag}</span>
      </div>

      {/* info */}
      <div style={{ paddingTop: 20 }}>
        <h3 className="bebas" style={{ fontSize: 24, marginBottom: 14, letterSpacing: 0.5 }}>{event.title}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px", marginBottom: 20 }}>
          <Meta icon="📅" text={formatEventDate(event.eventDate)} />
          <Meta icon="⚡" text={typeof event.distance === "number" ? `${event.distance} km` : "Distance TBA"} />
          <Meta icon="👥" text={`${participants} participants`} />
          <Meta icon="📍" text={event.city || event.address || "Location TBA"} />
        </div>
        <button style={{
          width: 157, height: 50, border: "1.5px solid #019839",
          borderRadius: 30, background: "transparent",
          color: "#019839", fontSize: 16, fontWeight: 700,
          cursor: "pointer", fontFamily: "'Satoshi',sans-serif",
          transition: "all .2s"
        }}
          onMouseEnter={e => { e.target.style.background = "#019839"; e.target.style.color = "#fff"; }}
          onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#019839"; }}
        >View Details</button>
      </div>
    </div>
  );
}

function Meta({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 16, fontWeight: 500, color: "rgba(0,0,0,0.7)" }}>{text}</span>
    </div>
  );
}

// ── Events grid ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

function EventsGrid() {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [events, setEvents] = useState<EventApiResponse[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const queryParams = useMemo<GetEventsParams>(() => {
    const params: GetEventsParams = { page, limit: PAGE_SIZE };
    if (activeFilters.city !== "All Cities") params.city = activeFilters.city;
    if (activeFilters.category !== "All Categories") params.category = activeFilters.category;
    if (activeFilters.level !== "All Levels") params.level = activeFilters.level;
    if (activeFilters.status !== "Status") params.status = activeFilters.status;
    return params;
  }, [activeFilters, page]);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");
    getEventsPage(queryParams)
      .then((data) => {
        if (cancelled) return;
        setEvents(data.events || []);
        setTotalResults(data.pagination.total || 0);
        setTotalPages(Math.max(1, data.pagination.pages || 1));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load events:", err);
        setEvents([]);
        setTotalResults(0);
        setTotalPages(1);
        setError("Events could not be loaded right now.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [queryParams]);

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} loading={loading} onSearch={() => { setActiveFilters(filters); setPage(1); }} />
      <div style={{ padding: "0 82px" }}>
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>
          {loading ? "Loading events..." : `Showing ${events.length} of ${totalResults} results`}
        </p>
        {error && <p style={{ fontSize: 16, color: "#C12D32", marginBottom: 20 }}>{error}</p>}
        {/* <div style={{ display: "flex", flexWrap: "wrap", gap: "48px 28px" }}> */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "48px 28px",
            rowGap: 48,
          }}
        >
          {events.map(e => <EventCard key={e._id || e.id || e.slug || e.title} event={e} />)}
        </div>
        <Pagination page={page} total={totalPages} setPage={setPage} />
      </div>
    </>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, total, setPage }: { page: number; total: number; setPage: Dispatch<SetStateAction<number>> }) {
  const pages = buildPagination(page, total);
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "48px 0 64px" }}>
      {pages.map((p, i) => {
        const isActive = p === page;
        const isDots = typeof p === "string";
        return (
          <button key={i} onClick={() => !isDots && setPage(p)} style={{
            width: isDots ? "auto" : 47, height: isDots ? "auto" : 47,
            minWidth: isDots ? 0 : 47,
            borderRadius: "50%", border: "none",
            background: isActive ? "#019839" : "transparent",
            color: isActive ? "#fff" : "#019839",
            fontSize: 18, fontWeight: 500, cursor: isDots ? "default" : "pointer",
            fontFamily: "'Satoshi',sans-serif",
            letterSpacing: isDots ? "0.2em" : 0,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>{p}</button>
        );
      })}
      {/* next arrow */}
      <button onClick={() => setPage(p => Math.min(p + 1, total))} style={{
        width: 47, height: 47, borderRadius: "50%", border: "none",
        background: "#019839", color: "#fff", cursor: "pointer",
        fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center"
      }}>›</button>
    </div>
  );
}

function buildPagination(page: number, total: number): Array<number | string> {
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, page, page - 1, page + 1].filter(p => p >= 1 && p <= total));
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: Array<number | string> = [];

  sorted.forEach((p, index) => {
    if (index > 0 && p - sorted[index - 1] > 1) result.push("...");
    result.push(p);
  });

  return result;
}

function formatEventDate(value?: string) {
  if (!value) return "Date TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBA";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ position: "relative", overflow: "hidden", height: 502 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), url('https://images.unsplash.com/photo-1570489460099-2a6e43e4c3f0?w=1440&q=80')",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", textAlign: "center", padding: "0 24px"
      }}>
        <h2 className="bebas" style={{ fontSize: 94, color: "#fff", lineHeight: 1, textTransform: "uppercase" }}>
          Start Your Ride Today
        </h2>
        <p style={{ fontSize: 24, color: "#fff", marginTop: 12, marginBottom: 36 }}>
          Download the ADCC app and join the cycling community.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Google Play", "App Store"].map(s => (
            <button key={s} style={{
              background: "#fff", border: "none", borderRadius: 100,
              padding: "14px 32px", fontWeight: 600, fontSize: 16, cursor: "pointer",
              fontFamily: "'Satoshi',sans-serif", display: "flex", alignItems: "center", gap: 10
            }}>{s}</button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#EAF4FF", padding: "60px 82px 32px" }}>
      <div style={{ display: "flex", gap: 64, marginBottom: 48 }}>
        <div style={{ flex: "0 0 340px" }}>
          <div style={{ marginBottom: 16 }}>
            <span className="bebas" style={{ fontSize: 24, letterSpacing: 2 }}>ABU◉DHABI<br/>CYCLING CLUB</span>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "#000", maxWidth: 340, marginBottom: 24 }}>
            From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          <div style={{ display: "flex", background: "#8DDF93", borderRadius: 8, overflow: "hidden", width: 340, height: 56 }}>
            <input placeholder="Enter your email" style={{
              flex: 1, border: "none", background: "transparent",
              padding: "0 18px", fontSize: 15, fontFamily: "'Satoshi',sans-serif", outline: "none"
            }} />
            <button style={{
              background: "#019839", color: "#fff", border: "none",
              padding: "0 22px", fontSize: 15, cursor: "pointer", fontFamily: "'Outfit',sans-serif"
            }}>Submit</button>
          </div>
        </div>
        <div>
          <div className="bebas" style={{ fontSize: 22, textTransform: "uppercase", marginBottom: 18 }}>Quick Links</div>
          {["About Us", "Rides", "Events", "Cyclist's Corner", "Contact Us"].map(l => (
            <p key={l} style={{ fontSize: 16, marginBottom: 10 }}><a href="#" style={{ color: "#000" }}>{l}</a></p>
          ))}
        </div>
        <div>
          <div className="bebas" style={{ fontSize: 22, textTransform: "uppercase", marginBottom: 18 }}>Contact Us</div>
          {[
            { icon: "📞", text: "+971 2 654 5645" },
            { icon: "💬", text: "144226" },
            { icon: "✉️", text: "info@adcyclingclub.ae" },
            { icon: "📍", text: "Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18." },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 17 }}>{c.icon}</span>
              <span style={{ fontSize: 16, lineHeight: 1.4 }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderTop: "1px solid #D5D5D5", paddingTop: 22, display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.7)" }}>Copyright 2026. Abu Dhabi Cycling Club</p>
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.7)" }}>Copyright 2026. Abu Dhabi Cycling Club</p>
        <button style={{
          position: "absolute", right: 0, top: -28,
          width: 55, height: 55, borderRadius: "50%",
          background: "#019839", border: "none", cursor: "pointer",
          color: "#fff", fontSize: 22
        }}>↑</button>
      </div>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function Events() {
  return (
    <>
      <FontLoader />
      <div style={{ minWidth: 320, overflowX: "hidden" }}>
        <Navbar />
        <Hero />
        <SectionHeader />
        <EventsGrid />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
