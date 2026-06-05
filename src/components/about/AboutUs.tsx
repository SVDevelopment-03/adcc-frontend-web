import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublicStats } from "../../services/publicStatsApi";
// ─── Google Fonts ────────────────────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700&display=swap');
    @import url('https://fonts.cdnfonts.com/css/satoshi');

    /* Bebas Kai fallback via Bebas Neue */
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

    :root {
      --green:   #019839;
      --black:   #000000;
      --white:   #FFFFFF;
      --bg:      #EAF4FF;
      --cream:   #FFF9EF;
      --red-light: #FFEFEF;
      --blue-dark: #013282;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body { background: var(--bg); font-family: 'Outfit', sans-serif; color: var(--black); }

    .bebas { font-family: 'Bebas Neue', 'Bebas Kai', sans-serif; font-weight: 400; letter-spacing: 0.02em; }

    .btn-green {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--green); color: var(--cream);
      border: none; border-radius: 30px; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 18px;
      padding: 13px 28px; transition: opacity .2s;
    }
    .btn-green:hover { opacity: .88; }
    .btn-green svg { transform: rotate(180deg); }

    .journey-card {
      flex: 0 0 480px;
      width: 480px;
      height: 352px;
      border-radius: 12px;
      overflow: visible;
      background: rgba(0, 0, 0, 0.15);
      position: relative;
    }

    .journey-card__image {
      position: absolute;
      width: 418px;
      height: 484px;
      left: 208px;
      top: -107px;
      object-fit: contain;
      transform: none;
      transform-origin: center;
      z-index: 1;
      pointer-events: none;
    }

    .value-card {
      background: #777777;
      transition: background 0.25s ease;
    }

    .value-card:hover {
      background: #323232;
    }
      
    .journey-card__eyebrow {
      position: absolute;
      left: 20px;
      top: 22px;
      width: 113px;
      min-height: 23px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Outfit', sans-serif;
      font-size: 16px;
      font-weight: 500;
      line-height: 145%;
      display: flex;
      align-items: center;
      z-index: 2;
    }

    .journey-card__title {
      position: absolute;
      left: 20px;
      top: 50px;
      width: 167px;
      color: #fff;
      font-size: 40px;
      line-height: 48px;
      text-transform: capitalize;
      z-index: 2;
    }

    .journey-card__community {
      position: absolute;
      left: 20px;
      top: 214px;
      width: 238.52px;
      height: 41.33px;
      z-index: 3;
    }

    .journey-card__avatar {
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

    .journey-card__avatar:nth-child(1) { left: 0; }
    .journey-card__avatar:nth-child(2) { left: 20.67px; }
    .journey-card__avatar:nth-child(3) { left: 41.33px; }
    .journey-card__avatar:nth-child(4) { left: 62px; }
    .journey-card__avatar:nth-child(5) {
      left: 82.67px;
      background: #FFF9EF;
    }

    .journey-card__community-text {
      position: absolute;
      left: 94.52px;
      top: 10.5px;
      width: 145px;
      color: #000;
      font-family: 'Outfit', sans-serif;
      font-size: 15px;
      font-weight: 500;
      line-height: 19px;
      white-space: nowrap;
    }

    .journey-card__button {
      position: absolute;
      left: 20px;
      top: 275px;
      width: 223px;
      height: 49px;
      border: 0;
      border-radius: 30px;
      background: #019839;
      color: #FFF9EF;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 23px;
      font-family: 'Outfit', sans-serif;
      font-size: 18px;
      font-weight: 700;
      line-height: 125%;
      cursor: pointer;
      z-index: 3;
    }

    .journey-card__button svg { transform: rotate(180deg); }

    @media (max-width: 1220px) {
      .mission-content {
        flex-wrap: wrap;
      }

      .journey-card {
        flex-basis: min(480px, 100%);
      }
    }

    @media (max-width: 620px) {
      .journey-card {
        width: 100%;
        flex-basis: 100%;
        height: 320px;
      }

      .journey-card__image {
        left: 45%;
        top: -78px;
        width: 360px;
        height: 420px;
      }

      .journey-card__community { top: 196px; }
      .journey-card__button { top: 261px; }
    }
  `}</style>
);

// ─── Arrow icon ───────────────────────────────────────────────────────────────
const Arrow = ({ color = "#fff" }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M4 10H16M16 10L10 4M16 10L10 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function JourneyCard() {
  const navigate = useNavigate();

  const avatarBackgrounds = [
    "linear-gradient(135deg, #f7c59f 0%, #7aa7ff 100%)",
    "linear-gradient(135deg, #f58b8b 0%, #ffe08a 100%)",
    "linear-gradient(135deg, #78d0b2 0%, #3567b7 100%)",
    "linear-gradient(135deg, #323232 0%, #b8d7ff 100%)",
  ];

  return (
    <div className="journey-card">
      <img
        src="/img/image 2991.png"
        alt="ADCC cyclist"
        className="journey-card__image"
      />

      <p className="journey-card__eyebrow">New to Cycling?</p>
      <h3 className="bebas journey-card__title">Start Your Journey with ADCC</h3>

      <div className="journey-card__community" aria-label="+5k in the Community">
        {avatarBackgrounds.map((background, index) => (
          <span
            key={index}
            className="journey-card__avatar"
            style={{ "--avatar-bg": background } as React.CSSProperties}
          />
        ))}
        <span className="journey-card__avatar" />
        <span className="journey-card__community-text">+5k in the Community</span>
      </div>

      <button
        className="journey-card__button"
        onClick={() => navigate("/contact-us")}
      >
        Get In Touch <Arrow />
      </button>

    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      width: "100%", height: 134,
      background: "#EAF4FF",
      display: "flex", alignItems: "center",
      justifyContent: "space-between",
      padding: "0 82px",
      borderBottom: "1px solid rgba(0,0,0,0.06)"
    }}>
      {/* Logo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span className="bebas" style={{ fontSize: 28, lineHeight: 1, letterSpacing: 2 }}>ABU<span style={{ color: var_green }}>◉</span>DHABI</span>
        <span style={{ fontSize: 11, letterSpacing: 3, color: "#333", textTransform: "uppercase", fontWeight: 500 }}>CYCLING CLUB</span>
        <div style={{ height: 3, background: var_green, borderRadius: 2, marginTop: 2 }} />
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", gap: 48, alignItems: "center" }}>
        {["About Us", "Events", "Community", "Tracks"].map((l) => (
          <a key={l} href="#"
            style={{
              fontFamily: "'Outfit',sans-serif", fontWeight: 500, fontSize: 20,
              color: "#000", textDecoration: "none",
              borderBottom: l === "About Us" ? "2px solid #019839" : "2px solid transparent",
              paddingBottom: 2, transition: "border-color .2s"
            }}
          >{l}</a>
        ))}
      </nav>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontSize: 17, fontWeight: 500 }}>🌤 English</span>
        <button className="btn-green" style={{ borderRadius: 30, fontSize: 18, padding: "13px 28px" }}>Menu</button>
      </div>
    </header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ position: "relative", width: "100%", height: 640, overflow: "hidden" }}>
      {/* bg image gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 100%)",
        // backgroundImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 100%), url('https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=1440&q=80')",
        backgroundImage: "linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.45) 100%), url('/img/Frame 2147226602.png')",
        backgroundSize: "cover", backgroundPosition: "center top"
      }} />
      <div style={{ position: "absolute", bottom: 90, left: 82 }}>
        <h1 className="bebas" style={{ fontSize: 70, color: "#fff", lineHeight: 1, marginTop: 8, textTransform: "uppercase" }}>About Us</h1>
        <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 22, fontFamily: "'Satoshi',sans-serif" }}>Home / About us</p>
      </div>
    </section>
  );
}

// ─── STATS + INTRO ────────────────────────────────────────────────────────────
function StatsSection() {
  const navigate = useNavigate();
  const [activeMembers, setActiveMembers] = useState<number | null>(null);
  const [organizedEvents, setOrganizedEvents] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    getPublicStats()
      .then((stats) => {
        if (cancelled) return;
        setActiveMembers(stats.members.active);
        setOrganizedEvents(stats.events.completed);
      })
      .catch((error) => {
        console.error("Failed to load public stats:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { val: formatPublicStat(activeMembers, "5K+"),  label: "Active Riders &\nMembers" },
    { val: formatPublicStat(organizedEvents, "100+"), label: "Cycling Events\nOrganized" },
    { val: "20+",  label: "Community Rides\nMonthly" },
    { val: "2017", label: "Established in\nAbu Dhabi" },
  ];
  return (
    <section style={{ background: "#EAF4FF", padding: "80px 82px" }}>
      <div style={{ display: "flex", gap: 64, alignItems: "flex-start" }}>
        {/* Headline */}
        <div style={{ flex: "0 0 520px" }}>
          <h2 className="bebas" style={{ fontSize: 50, lineHeight: 1.25, textTransform: "uppercase", maxWidth: 500 }}>
            We are cyclists committed to pushing limits and inspiring a stronger cycling community.
          </h2>
          {/* small cycling photo */}
          <div style={{
            marginTop: 32, borderRadius: 12, overflow: "hidden",
            width: "100%", maxWidth: 460, height: 220,
            background: "#ddd",
            backgroundImage: "url('/img/DSC04620.jpg 1.png')",
            backgroundSize: "cover", backgroundPosition: "center"
          }} />
        </div>

        {/* Stats grid + text */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 48px" }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                borderLeft: "2px solid #1F509A", paddingLeft: 20, paddingBottom: 36
              }}>
                <div className="bebas" style={{ fontSize: 50, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 18, color: "#444", marginTop: 6, whiteSpace: "pre-line", lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 22, lineHeight: 1.5, maxWidth: 480, marginBottom: 28, color: "rgba(0,0,0,0.8)" }}>
            Abu Dhabi Cycling Club unites riders of all levels with community rides and training programs.
          </p>
          <button className="btn-green" onClick={() => navigate("/contact-us")}>Get In Touch <Arrow /></button>
        </div>
      </div>
    </section>
  );
}

function formatPublicStat(value: number | null, fallback: string) {
  if (value === null) return fallback;
  if (value >= 1000) {
    const formatted = value >= 10000 ? Math.round(value / 1000) : Number((value / 1000).toFixed(1));
    return `${formatted}K+`;
  }
  return `${value}+`;
}

// ─── MISSION / VISION + JOURNEY CARD ─────────────────────────────────────────
function MissionSection() {
  return (
    // <section style={{ background: "#EAF4FF", padding: "0 82px 80px" }}>
    <section
      style={{
        backgroundImage: "url('/img/image 3517.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "80px 82px",
      }}
    >
    
      {/* Headline row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
        <div>
          <h2 className="bebas" style={{ fontSize: 50, lineHeight: 1.2, maxWidth: 480, textTransform: "capitalize" }}>
            Driving the Future of Cycling in Abu Dhabi
          </h2>
        </div>
        <p style={{ maxWidth: 430, fontSize: 22, fontWeight: 500, lineHeight: 1.5, color: "rgba(0,0,0,0.8)", paddingTop: 8 }}>
          At Abu Dhabi Cycling Club, our mission is to inspire riders, develop athletes, and build a thriving cycling culture across the emirate.
        </p>
      </div>

      <div className="mission-content" style={{ display: "flex", gap: 28, alignItems: "stretch" }}>
        {/* Mission + Vision cards */}
        <div style={{ flex: "0 0 600px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 01. Mission */}
          <div style={{ background: "#fff", borderRadius: 18, padding: "28px 32px" }}>
            <div className="bebas" style={{ fontSize: 20, marginBottom: 10 }}>01. Our Mission</div>
            <p style={{ fontSize: 15, color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}>
              To promote cycling as a healthy lifestyle and competitive sport by creating opportunities for riders to train, participate in events, and connect with the cycling community across Abu Dhabi.
            </p>
          </div>
          {/* 02. Vision */}
          <div style={{ border: "1px solid rgba(0,0,0,0.22)", borderRadius: 18, padding: "28px 32px" }}>
            <div className="bebas" style={{ fontSize: 20, marginBottom: 10 }}>02. Our Vision</div>
            <p style={{ fontSize: 15, color: "rgba(0,0,0,0.6)", lineHeight: 1.6 }}>
              To become the leading cycling club in the UAE, known for excellence, inclusivity, and producing championship-level athletes who represent Abu Dhabi on the world stage.
            </p>
          </div>
        </div>

        <JourneyCard />
      </div>
    </section>
  );
}

// ─── BLUE BANNER ─────────────────────────────────────────────────────────────
// function BlueBanner() {
//   return (
//     <section style={{
//       background: "linear-gradient(180deg,#025AE8 0%,#013282 100%)",
//       padding: "80px 82px",
//       position: "relative", overflow: "hidden"
//     }}>
//       <div style={{
//         position: "absolute", inset: 0,
//         backgroundImage: "url('https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1440&q=80')",
//         backgroundSize: "cover", backgroundPosition: "center",
//         opacity: 0.15
//       }} />
//       {/* content placeholder — in reality this section shows a tiled image layout */}
//       <div style={{ position: "relative", zIndex: 2, color: "#fff", textAlign: "center" }}>
//         <p style={{ fontSize: 16, opacity: .7, marginBottom: 8 }}>Our community in action</p>
//         <h2 className="bebas" style={{ fontSize: 48, lineHeight: 1.1 }}>United by the Ride,<br/>Driven by Passion</h2>
//       </div>
//     </section>
//   );
// }

// ─── VALUES ───────────────────────────────────────────────────────────────────
function ValuesSection() {
  const navigate = useNavigate();
  const values = [
    { num: "//001", title: "Community",  bg: "#323232", text: "Cycling unites people. Our rides and events welcome riders of all levels." },
    { num: "//001", title: "Excellence", bg: "#777777", text: "We help cyclists enhance endurance, speed, and performance." },
    { num: "//001", title: "Inclusivity",bg: "#777777", text: "Cycling is a lifestyle that inspires dedication and love for the ride." },
    { num: "//001", title: "Achievement",bg: "#777777", text: "We promote cycling as a healthy activity that encourages active lifestyles." },
  ];
  return (
    <section style={{ background: "#EAF4FF", padding: "80px 82px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
        <div>
          <p style={{fontFamily: "'Satoshi',sans-serif", fontSize: 15, fontWeight: 500, marginBottom: 8, color: "#000" }}>Our values</p>
          <h2 className="bebas" style={{ fontSize: 50, lineHeight: 1.2, maxWidth: 480, textTransform: "capitalize" }}>
            The Principles That Drive Our Cycling Community
          </h2>
        </div>
        <button className="btn-green" onClick={() => navigate("/user-communities")}>Discover the Community <Arrow /></button>
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {values.map((v, i) => (
          <div key={i} className="value-card"
            style={{
            flex: 1, borderRadius: 12,
            padding: "24px 20px 28px", minHeight: 240,
            backdropFilter: "blur(15px)"
          }}>
            <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 500, color: "#fff", marginBottom: 56 }}>{v.num}</div>
            <div className="bebas" style={{ fontSize: 28, color: "#fff", marginBottom: 10 }}>{v.title}</div>
            <p style={{fontFamily: "'Satoshi',sans-serif", fontSize: 16, color: "#fff", lineHeight: 1.55, opacity: .9 }}>{v.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── COACHES ─────────────────────────────────────────────────────────────────
function CoachesSection() {
  const cards = [
    { label: "Club Players",   img: "/img/image 2998.png" },
    { label: "Club Coaches",   img: "/img/image 2999.png" },
    { label: "Club Mechanics", img: "/img/image 2997.png" },
  ];
  return (
    <section style={{ background: "#EAF4FF", padding: "0 82px 80px" }}>
      <h2 className="bebas" style={{
        fontSize: 50, lineHeight: 1.2, textAlign: "center", maxWidth: 640,
        margin: "0 auto 40px", textTransform: "capitalize"
      }}>
        Meet the Coaches Driving Abu Dhabi's Cycling Community
      </h2>
      <div style={{
        display: "flex", borderRadius: 16, overflow: "hidden",
        height: 488, background: "#fff"
      }}>
        {cards.map((c, i) => (
          <div key={i} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <img src={c.img} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 180,
              background: "linear-gradient(360deg,#000 0%,transparent 100%)"
            }} />
            <span className="bebas" style={{
              position: "absolute", bottom: 24, left: 20,
              color: "#fff", fontSize: 26, letterSpacing: 1, fontFamily: "'Bebas Neue','Bebas Kai',sans-serif",
            }}>{c.label}</span>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <button className="btn-green">Explore Coaches <Arrow /></button>
      </div>
    </section>
  );
}

// ─── CTA BANNER ──────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section style={{ position: "relative", overflow: "hidden", height: 502 }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,0,0,.25),rgba(0,0,0,.25)), url('/img/Rectangle 34625231.png')",
        backgroundSize: "cover", backgroundPosition: "center"
      }} />
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", textAlign: "center",
        padding: "0 24px"
      }}>
        <h2 className="bebas" style={{ fontSize: 94, color: "#fff", lineHeight: 1, textTransform: "uppercase" }}>
          Start Your Ride Today
        </h2>
        {/* <p style={{ fontSize: 24, color: "#fff", marginTop: 16, marginBottom: 36, opacity: .95 }}> */}
        <p style={{ fontFamily: "'Satoshi',sans-serif", fontSize: 26, color: "#fff", marginTop: 16, marginBottom: 36, opacity: .95 }}>
          Download the ADCC app and join the cycling community.
        </p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Google Play", "App Store"].map(s => (
            <button key={s} style={{
              background: "#fff", border: "none", borderRadius: 100,
              padding: "14px 32px", fontFamily: "'Outfit',sans-serif",
              fontWeight: 600, fontSize: 16, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10
            }}>
              {s === "Google Play" ? "▶" : ""} {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: "#EAF4FF", padding: "60px 82px 32px" }}>
      <div style={{ display: "flex", gap: 64, marginBottom: 48 }}>
        {/* Brand */}
        <div style={{ flex: "0 0 340px" }}>
          <div style={{ marginBottom: 20 }}>
            <span className="bebas" style={{ fontSize: 26, letterSpacing: 2 }}>ABU◉DHABI<br/>CYCLING CLUB</span>
          </div>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#000", maxWidth: 320, marginBottom: 24 }}>
            From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          {/* email subscribe */}
          <div style={{
            display: "flex", background: "#8DDF93", borderRadius: 8,
            overflow: "hidden", width: 340, height: 56
          }}>
            <input placeholder="Enter your email" style={{
              flex: 1, border: "none", background: "transparent",
              padding: "0 18px", fontSize: 16, fontFamily: "'Outfit',sans-serif",
              outline: "none", color: "#333"
            }} />
            <button style={{
              background: "#019839", color: "#fff", border: "none",
              padding: "0 24px", fontFamily: "'Outfit',sans-serif", fontSize: 16,
              cursor: "pointer", borderRadius: "0 8px 8px 0"
            }}>Submit</button>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="bebas" style={{ fontSize: 24, textTransform: "uppercase", marginBottom: 18 }}>Quick Links</div>
          {["About Us", "Rides", "Events", "Cyclist's Corner", "Contact Us"].map(l => (
            <p key={l} style={{ fontSize: 17, marginBottom: 10 }}><a href="#" style={{ color: "#000", textDecoration: "none" }}>{l}</a></p>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div className="bebas" style={{ fontSize: 24, textTransform: "uppercase", marginBottom: 18 }}>Contact Us</div>
          {[
            { icon: "📞", text: "+971 2 654 5645" },
            { icon: "💬", text: "144226" },
            { icon: "✉️", text: "info@adcyclingclub.ae" },
            { icon: "📍", text: "Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18." },
          ].map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span style={{ fontSize: 17, lineHeight: 1.4 }}>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #D5D5D5", paddingTop: 24, textAlign: "center", position: "relative" }}>
        <p style={{ fontSize: 17, color: "rgba(0,0,0,0.7)" }}>Copyright 2026. Abu Dhabi Cycling Club</p>
        {/* scroll-to-top */}
        <button style={{
          position: "absolute", right: 0, top: 16,
          width: 55, height: 55, borderRadius: "50%",
          background: "#019839", border: "none", cursor: "pointer",
          color: "#fff", fontSize: 22
        }}>↑</button>
      </div>
    </footer>
  );
}

// ─── Hack: CSS variable in JSX ────────────────────────────────────────────────
const var_green = "#019839";

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function AboutUs() {
  return (
    <>
      <FontLoader />
      <div style={{ minWidth: 320, overflowX: "hidden" }}>
        <Navbar />
        <Hero />
        <StatsSection />
        <MissionSection />
        {/* <BlueBanner /> */}
        <ValuesSection />
        <CoachesSection />
        <CTABanner />
        <Footer />
      </div>
    </>
  );
}
