import { useState } from "react";

const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Bebas+Neue&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #EAF4FF; font-family: 'Outfit', sans-serif; color: #000; }
    .bebas { font-family: 'Bebas Neue', sans-serif; font-weight: 400; letter-spacing: 0.02em; }
    a { text-decoration: none; color: inherit; }
    select { appearance: none; -webkit-appearance: none; background: transparent; border: none; outline: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 20px; color: #000; width: 100%; }

    .tracks-journey-card {
      width: 482px;
      height: 214px;
      max-width: 100%;
      border-radius: 12px;
      background: #019839;
      position: relative;
      overflow: visible;
    }

    .tracks-journey-card__image {
      position: absolute;
      width: 347px;
      height: 401px;
      left: 211px;
      top: -187px;
      object-fit: contain;
      transform: matrix(1, 0, 0, 1, 0, 0);
      transform-origin: center;
      z-index: 1;
      pointer-events: none;
    }

    .tracks-journey-card__eyebrow {
      position: absolute;
      left: 20px;
      top: 22px;
      width: 113px;
      min-height: 23px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 16px;
      font-weight: 500;
      line-height: 145%;
      display: flex;
      align-items: center;
      z-index: 2;
    }

    .tracks-journey-card__title {
      position: absolute;
      left: 20px;
      top: 50px;
      width: 211px;
      color: #fff;
      font-size: 26px;
      line-height: 31px;
      text-transform: capitalize;
      z-index: 2;
    }

    .tracks-journey-card__community {
      position: absolute;
      left: 20px;
      top: 142px;
      width: 244.52px;
      height: 41.33px;
      z-index: 3;
    }

    .tracks-journey-card__avatar {
      position: absolute;
      top: 0;
      width: 41.33px;
      height: 41.33px;
      border-radius: 50%;
      border: 2px solid #fff;
      background-image: var(--avatar-bg);
      background-size: cover;
      background-position: center;
    }

    .tracks-journey-card__avatar:nth-child(1) { left: 0; }
    .tracks-journey-card__avatar:nth-child(2) { left: 20.67px; }
    .tracks-journey-card__avatar:nth-child(3) { left: 41.33px; }
    .tracks-journey-card__avatar:nth-child(4) { left: 62px; }
    .tracks-journey-card__avatar:nth-child(5) {
      left: 82.67px;
      background: #FFEFD7;
    }

    .tracks-journey-card__community-text {
      position: absolute;
      left: 94.52px;
      top: 10.5px;
      width: 151px;
      color: #000;
      font-size: 15px;
      font-weight: 500;
      line-height: 19px;
      white-space: nowrap;
    }

    @media (max-width: 620px) {
      .tracks-journey-card {
        height: 214px;
      }

      .tracks-journey-card__image {
        left: 42%;
        top: -150px;
        width: 310px;
        height: 360px;
      }
    }
  `}</style>
);

function TracksJourneyCard() {
  const avatarBackgrounds = [
    "linear-gradient(135deg, #f7c59f 0%, #7aa7ff 100%)",
    "linear-gradient(135deg, #f58b8b 0%, #ffe08a 100%)",
    "linear-gradient(135deg, #78d0b2 0%, #3567b7 100%)",
    "linear-gradient(135deg, #323232 0%, #b8d7ff 100%)",
  ];

  return (
    <div className="tracks-journey-card">
      <img
        src="/img/image 2991.png"
        alt="ADCC cyclist"
        className="tracks-journey-card__image"
      />
      <p className="tracks-journey-card__eyebrow">New to Cycling?</p>
      <h3 className="bebas tracks-journey-card__title">Start Your Journey with ADCC</h3>
      <div className="tracks-journey-card__community" aria-label="+5k in the Community">
        {avatarBackgrounds.map((background, index) => (
          <span
            key={index}
            className="tracks-journey-card__avatar"
            style={{ "--avatar-bg": background } as React.CSSProperties}
          />
        ))}
        <span className="tracks-journey-card__avatar" />
        <span className="tracks-journey-card__community-text">+5k in the Community</span>
      </div>
    </div>
  );
}

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
      <nav style={{ display: "flex", gap: 48 }}>
        {["About Us", "Events", "Community", "Tracks"].map(l => (
          <a key={l} href="#" style={{
            fontWeight: 500, fontSize: 20, color: "#000",
            borderBottom: l === "Tracks" ? "2px solid #019839" : "2px solid transparent",
            paddingBottom: 2
          }}>{l}</a>
        ))}
      </nav>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontSize: 17, fontWeight: 500 }}>🌤 English</span>
        <button style={{
          background: "#000", color: "#fff", border: "none", borderRadius: 30,
          padding: "13px 28px", fontWeight: 700, fontSize: 18, cursor: "pointer",
          fontFamily: "'Outfit',sans-serif"
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
        backgroundImage: "linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)), url('/img/pexels-krizz59-12838 1.png')",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div style={{ position: "absolute", bottom: 90, left: 82 }}>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 22 }}>Home / Tracks</p>
        <h1 className="bebas" style={{ fontSize: 70, color: "#fff", lineHeight: 1, marginTop: 8, textTransform: "uppercase" }}>Tracks</h1>
      </div>
    </section>
  );
}

// ── Explore Intro ─────────────────────────────────────────────────────────────
function ExploreIntro() {
  return (
    <section style={{ background: "#EAF4FF", padding: "80px 82px" }}>
      {/* <div style={{ display: "flex", gap: 48, alignItems: "flex-start" }}> */}
      <div style={{ display: "flex", gap: 48, alignItems: "flex-start", overflow: "visible" }}>
        {/* Left: heading + green card */}
        <div style={{ flex: "0 0 480px" }}>
          <h2 className="bebas" style={{ fontSize: 60, lineHeight: 1.1, textTransform: "capitalize", marginBottom: 64 }}>
            Explore Abu Dhabi's Premier Cycling Tracks
          </h2>
          <TracksJourneyCard />
        </div>

        {/* Right: video thumbnail + description */}
        <div style={{ flex: 1 }}>
          <div style={{
            borderRadius: 12, overflow: "hidden", height: 340, marginBottom: 28,
            backgroundImage: "url('https://images.unsplash.com/photo-1517649763962-0c623066013b?w=700&q=80')",
            backgroundSize: "cover", backgroundPosition: "center",
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <span style={{ fontSize: 22, marginLeft: 4 }}>▶</span>
            </div>
          </div>
          <p style={{ fontSize: 22, lineHeight: 1.55, color: "#000" }}>
            From scenic coastal rides to high-performance cycling circuits, Abu Dhabi offers world-class tracks designed for every rider. Whether you're training for endurance, improving speed, or enjoying a casual ride, discover routes that match your level and ambition.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Why ADCC Tracks ───────────────────────────────────────────────────────────
function WhySection() {
  const features = [
    { num: "//001", title: "Top Infrastructure",      desc: "Ride on well-designed cycling tracks with smooth surfaces and clear markings." },
    { num: "//002", title: "Safe & Dedicated Routes", desc: "Enjoy cycling in a safe environment with dedicated tracks away from traffic, ensuring a secure ride." },
    { num: "//003", title: "Built for All Levels",    desc: "Whether you're a beginner or a competitive cyclist, our tracks are designed to support every level of rider." },
    { num: "//004", title: "Performance Training",    desc: "Great for endurance rides, speed training, and workouts to boost your cycling." },
  ];
  return (
    <section style={{
      background: "linear-gradient(180deg,#025AE8 0%,#013282 100%)",
      padding: "80px 82px", position: "relative", overflow: "hidden"
    }}>
      {/* bg texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=1440&q=80')",
        backgroundSize: "cover", opacity: 0.08
      }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        {/* header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48 }}>
          <h2 className="bebas" style={{ fontSize: 50, color: "#000", lineHeight: 1.2, maxWidth: 300 }}>
            Why Use ADCC Tracks?
          </h2>
          <button style={{
            background: "#019839", color: "#fff", border: "none", borderRadius: 30,
            padding: "13px 28px", fontWeight: 700, fontSize: 18, cursor: "pointer",
            fontFamily: "'Outfit',sans-serif", display: "flex", alignItems: "center", gap: 10
          }}>Explore Tracks <span>→</span></button>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "stretch" }}>
          {/* cycling photo */}
          <div style={{
            flex: "0 0 480px", borderRadius: 12, overflow: "hidden",
            backgroundImage: "url('https://images.unsplash.com/photo-1471897488648-5eae4ac6d485?w=700&q=80')",
            backgroundSize: "cover", backgroundPosition: "center", minHeight: 420
          }} />

          {/* 2x2 feature grid */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: "rgba(0,0,0,0.2)", backdropFilter: "blur(7.5px)",
                borderRadius: 12, padding: "28px 24px"
              }}>
                <p style={{ fontSize: 13, color: "#fff", fontWeight: 400, marginBottom: 14, opacity: 0.8 }}>{f.num}</p>
                <h4 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 12, lineHeight: 1.3 }}>{f.title}</h4>
                <p style={{ fontSize: 15, color: "#fff", lineHeight: 1.6, opacity: 0.9 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Track card ────────────────────────────────────────────────────────────────
function TrackCard({ track }) {
  const isFeatured = track.featured;
  const cardBg = isFeatured ? "#435974" : "#fff";
  const textColor = isFeatured ? "#fff" : "#000";
  const statBg = isFeatured ? "#435974" : "#323232";
  const borderStyle = isFeatured ? "none" : "1px solid rgba(0,0,0,0.3)";

  return (
    <div style={{
      width: 400, borderRadius: 12, overflow: "hidden",
      background: cardBg, border: borderStyle,
      display: "flex", flexDirection: "column"
    }}>
      {/* image */}
      <div style={{
        height: 240, overflow: "hidden", position: "relative",
        background: "#ddd"
      }}>
        <img src={track.img} alt={track.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* info */}
      <div style={{ padding: "20px 14px 24px" }}>
        {/* location */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <span style={{ fontSize: 14 }}>📍</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: isFeatured ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.8)" }}>{track.location}</span>
        </div>
        {/* name */}
        <h3 className="bebas" style={{ fontSize: 24, color: textColor, marginBottom: 16, letterSpacing: 0.5 }}>{track.name}</h3>

        {/* stats row */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
          {[
            { label: "Distance", val: track.distance },
            { label: "Elevation", val: track.elevation },
            { label: "Level", val: track.level },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: statBg,
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 5, padding: "10px 6px", textAlign: "center"
            }}>
              <div style={{ fontSize: 12, color: "#fff", opacity: 0.8, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "'Outfit',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* button */}
        <button style={{
          width: 157, height: 50,
          background: isFeatured ? "#fff" : "transparent",
          border: isFeatured ? "none" : "1px solid rgba(0,0,0,0.5)",
          borderRadius: 30, cursor: "pointer",
          color: isFeatured ? "#435974" : "rgba(0,0,0,0.49)",
          fontSize: 15, fontWeight: 700, fontFamily: "'Outfit',sans-serif",
          transition: "all .2s"
        }}>View Details</button>
      </div>
    </div>
  );
}

// ── Tracks grid ───────────────────────────────────────────────────────────────
const ALL_TRACKS = [
  { id: 1,  name: "Dubai Marina Loop",    location: "Abu Dhabi", distance: "25 km", elevation: "50 m",  level: "Easy",         featured: true,  img: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&q=80" },
  { id: 2,  name: "Yas Island Circuit",   location: "Abu Dhabi", distance: "45 km", elevation: "120 m", level: "Intermediate", featured: false, img: "https://images.unsplash.com/photo-1502904550040-7534597429ae?w=600&q=80" },
  { id: 3,  name: "Sharjah Corniche",     location: "Abu Dhabi", distance: "18 km", elevation: "30 m",  level: "Easy",         featured: false, img: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=600&q=80" },
  { id: 4,  name: "Hatta Mountain Route", location: "Abu Dhabi", distance: "60 km", elevation: "850 m", level: "Intermediate", featured: false, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" },
  { id: 5,  name: "Saadiyat Island Loop", location: "Abu Dhabi", distance: "32 km", elevation: "40 m",  level: "Easy",         featured: false, img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80" },
  { id: 6,  name: "Al Qudra Desert Track",location: "Abu Dhabi", distance: "45 km", elevation: "120 m", level: "Intermediate", featured: false, img: "https://images.unsplash.com/photo-1471897488648-5eae4ac6d485?w=600&q=80" },
  { id: 7,  name: "Corniche Seafront",    location: "Abu Dhabi", distance: "12 km", elevation: "10 m",  level: "Easy",         featured: false, img: "https://images.unsplash.com/photo-1570489460099-2a6e43e4c3f0?w=600&q=80" },
  { id: 8,  name: "Al Ain Desert Loop",   location: "Al Ain",    distance: "70 km", elevation: "400 m", level: "Advanced",     featured: false, img: "https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?w=600&q=80" },
  { id: 9,  name: "Khalifa City Route",   location: "Abu Dhabi", distance: "28 km", elevation: "20 m",  level: "Easy",         featured: false, img: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80" },
  { id: 10, name: "Reem Island Sprint",   location: "Abu Dhabi", distance: "15 km", elevation: "5 m",   level: "Easy",         featured: false, img: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=600&q=80" },
];

const PAGE_SIZE = 6;

function TracksGrid() {
  const [filters, setFilters] = useState({ city: "All Cities", level: "All Levels" });
  const [active, setActive] = useState(filters);
  const [page, setPage] = useState(1);

  const ChevronDown = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 9l6 6 6-6" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const filtered = ALL_TRACKS.filter(t => {
    if (active.city !== "All Cities" && t.location !== active.city) return false;
    if (active.level !== "All Levels" && t.level !== active.level) return false;
    return true;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section style={{ background: "#EAF4FF", padding: "60px 82px 0" }}>
      {/* section title + filters */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
        <h2 className="bebas" style={{ fontSize: 50, lineHeight: 1.15, maxWidth: 440, textTransform: "capitalize" }}>
          Explore Certified Routes Across the UAE
        </h2>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {[
            { key: "city",  label: "All Cities", options: ["All Cities","Abu Dhabi","Dubai","Sharjah","Al Ain"] },
            { key: "level", label: "All Levels",  options: ["All Levels","Easy","Intermediate","Advanced","Elite"] },
          ].map(f => (
            <div key={f.key} style={{
              width: 220, height: 60, background: "#fff",
              border: "1px solid rgba(0,0,0,0.06)", borderRadius: 40,
              display: "flex", alignItems: "center", padding: "0 16px 0 22px", gap: 8
            }}>
              <select value={filters[f.key]} onChange={e => setFilters(p => ({ ...p, [f.key]: e.target.value }))}>
                {f.options.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown />
            </div>
          ))}
          <button onClick={() => { setActive(filters); setPage(1); }} style={{
            height: 60, padding: "0 32px", background: "#019839", color: "#fff",
            border: "none", borderRadius: 40, fontSize: 20, fontWeight: 700,
            cursor: "pointer", fontFamily: "'Outfit',sans-serif"
          }}>Search</button>
        </div>
      </div>

      <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 24 }}>Showing {filtered.length} results</p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "48px 28px" }}>
        {visible.map(t => <TrackCard key={t.id} track={t} />)}
      </div>

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "48px 0 64px" }}>
        {[1, 2, 3, 4, "...........", 10].map((p, i) => {
          const isDots = typeof p === "string";
          const isActive = p === page;
          return (
            <button key={i} onClick={() => !isDots && setPage(p)} style={{
              width: isDots ? "auto" : 47, height: isDots ? "auto" : 47,
              minWidth: isDots ? 0 : 47,
              borderRadius: "50%", border: "none",
              background: isActive ? "#019839" : "transparent",
              color: isActive ? "#fff" : "#019839",
              fontSize: 18, fontWeight: 500, cursor: isDots ? "default" : "pointer",
              fontFamily: "'Outfit',sans-serif", letterSpacing: isDots ? "0.2em" : 0,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>{p}</button>
          );
        })}
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} style={{
          width: 47, height: 47, borderRadius: "50%", border: "none",
          background: "#019839", color: "#fff", cursor: "pointer",
          fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center"
        }}>›</button>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "01. Do I need to be an experienced cyclist to join ADCC rides?",    a: "Not at all! ADCC welcomes riders of all experience levels. We have beginner-friendly rides as well as advanced training sessions to suit everyone." },
  { q: "02. Are there specific tracks for beginners or families?",           a: "Yes! We have several easy, flat tracks such as Corniche Seafront and Saadiyat Island Loop that are perfect for beginners and family outings." },
  { q: "03. What gear do I need to bring for a group ride?",                a: "A road-worthy bike, a helmet, water, and appropriate cycling attire. We recommend lights for early morning or evening rides." },
  { q: "04. Can I participate in races without being a professional?",      a: "Absolutely. Many of our races have categories for recreational riders. Check individual event details for age and skill category breakdowns." },
  { q: "05. How do I track my performance or join challenges?",             a: "Download the ADCC app to log your rides, join challenges, and track your progress alongside thousands of community members." },
  { q: "06. Are there any women-only rides or training sessions?",          a: "Yes! ADCC organises regular women-only rides and training sessions. Check our events calendar for upcoming sessions." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  const left  = FAQS.filter((_, i) => i % 2 === 0);
  const right = FAQS.filter((_, i) => i % 2 !== 0);

  const Item = ({ faq, idx }) => (
    <div
      onClick={() => setOpen(open === idx ? null : idx)}
      style={{
        border: "1px solid #CCC", borderRadius: 12, padding: "0 24px",
        cursor: "pointer", overflow: "hidden",
        transition: "all .25s",
        marginBottom: 16
      }}
    >
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        minHeight: 100, gap: 16
      }}>
        <p style={{ fontSize: 20, fontWeight: 500, color: "rgba(0,0,0,0.8)", lineHeight: 1.4, flex: 1 }}>{faq.q}</p>
        <span style={{
          width: 28, height: 28, borderRadius: "50%",
          border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0, transform: open === idx ? "rotate(45deg)" : "none",
          transition: "transform .2s"
        }}>+</span>
      </div>
      {open === idx && (
        <p style={{ fontSize: 16, color: "rgba(0,0,0,0.65)", lineHeight: 1.7, paddingBottom: 20 }}>{faq.a}</p>
      )}
    </div>
  );

  return (
    <section style={{ background: "#EAF4FF", padding: "80px 82px" }}>
      <h2 className="bebas" style={{ fontSize: 50, textAlign: "center", marginBottom: 12 }}>Frequently Asked Questions</h2>
      <p style={{ fontSize: 17, textAlign: "center", color: "#1D1D1D", marginBottom: 52 }}>
        Got questions before hitting the road? We've got you covered.
      </p>
      <div style={{ display: "flex", gap: 28 }}>
        <div style={{ flex: 1 }}>{left.map((f, i)  => <Item key={i}  faq={f} idx={i * 2} />)}</div>
        <div style={{ flex: 1 }}>{right.map((f, i) => <Item key={i}  faq={f} idx={i * 2 + 1} />)}</div>
      </div>
    </section>
  );
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
              fontFamily: "'Outfit',sans-serif"
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
          <div style={{ display: "flex", background: "#8DDF93", borderRadius: 8, overflow: "hidden", height: 56 }}>
            <input placeholder="Enter your email" style={{
              flex: 1, border: "none", background: "transparent",
              padding: "0 18px", fontSize: 15, fontFamily: "'Outfit',sans-serif", outline: "none"
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
      <div style={{ borderTop: "1px solid #D5D5D5", paddingTop: 22, textAlign: "center", position: "relative" }}>
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
export default function Tracks() {
  return (
    <>
      <FontLoader />
      <div style={{ minWidth: 320 }}>
        <Navbar />
        <Hero />
        <ExploreIntro />
        <WhySection />
        <TracksGrid />
        <FAQ />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
