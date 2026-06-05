import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoreItems, StoreItem } from '../../services/storeApi';
import { subscribeToNewsletter } from '../../services/newsletterApi';

const CSS = `
  @keyframes ticker-group-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cardRiseUp {
    from { opacity: 0; transform: translateY(64px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes appImageBloom {
    from {
      opacity: 0;
      transform: scale(0.78);
      filter: blur(10px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }
  @keyframes aboutLeftFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
      filter: blur(8px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }
  @keyframes aboutRightSlideIn {
    from {
      opacity: 0;
      transform: translateX(120px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #EAF4FF; }
  ::-webkit-scrollbar { display: none; }

  .hover-green:hover { color: #019839 !important; }
  .btn-green { transition: background 0.2s; }
  .btn-green:hover { background: #017a2e !important; }
  .card-hover { transition: transform 0.25s, box-shadow 0.25s; }
  .card-hover:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.15) !important; }
  .store-card { transition: transform 0.2s; }
  .store-card:hover { transform: translateY(-4px); }
  .store-rail {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .store-featured-card {
    flex: 0 0 624px;
    width: 624px;
    height: 583px;
    border-radius: 20px;
    background: #D8E5FB;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
  .store-featured-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 72% 50%, rgba(255,255,255,0.56) 0 18%, rgba(255,255,255,0) 39%),
      linear-gradient(90deg, rgba(255,255,255,0.34), rgba(255,255,255,0) 45%);
    pointer-events: none;
  }
  .store-featured-icon {
    position: absolute;
    left: 53px;
    top: 51px;
    width: 40px;
    height: 40px;
    background: #435974;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }
  .store-featured-icon img {
    width: 17.42px;
    height: 15.68px;
    object-fit: contain;
  }
  .store-featured-type {
    position: absolute;
    left: 105px;
    top: 64px;
    width: 162px;
    font-family: 'Outfit', sans-serif;
    font-size: 14.02px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #000;
    z-index: 2;
  }
  .store-featured-action {
    position: absolute;
    right: 40px;
    top: 57px;
    width: 106px;
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    line-height: 28px;
    color: #000;
    border-bottom: 5px solid #019839;
    text-align: right;
    z-index: 2;
  }
  .store-featured-title {
    position: absolute;
    left: 62px;
    top: 211px;
    width: 197px;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 31.1053px;
    line-height: 39px;
    color: #000;
    z-index: 2;
  }
  .store-featured-sub {
    position: absolute;
    left: 62px;
    top: 344px;
    width: 222px;
    font-family: 'Outfit', sans-serif;
    font-size: 14.5177px;
    line-height: 18px;
    color: #000;
    z-index: 2;
  }
  .store-featured-price {
    position: absolute;
    left: 62px;
    top: 502px;
    font-family: 'Bebas Neue', 'Bebas Kai', sans-serif;
    font-size: 42px;
    line-height: 100.7%;
    text-transform: uppercase;
    color: #435974;
    z-index: 2;
  }
  .store-featured-product {
    position: absolute;
    right: 38px;
    top: 96px;
    width: 338px;
    height: 390px;
    object-fit: cover;
    object-position: center;
    border-radius: 18px;
    z-index: 1;
  }
  .store-compact-card {
    flex: 0 0 320px;
    width: 320px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
  }
  .app-feature:hover .feature-icon { transform: scale(1.1); }
  .feature-icon { transition: transform 0.2s; }
  .fade-in { animation: fadeUp 0.6s ease both; }
  .app-phone-mockup {
    opacity: 0;
    transform: scale(0.78);
    transform-origin: center;
    will-change: transform, opacity, filter;
  }
  .app-phone-stage.is-visible .app-phone-mockup {
    animation: appImageBloom 1.25s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .journey-section {
    background: #EAF4FF;
    display: flex;
    gap: 43px;
    overflow: hidden;
    padding: 150px 0 0px 86px;
    // min-height: 430px;
  }
  .journey-copy {
    // min-height: 376px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-shrink: 0;
    position: relative;
    min-width:411px;
    // padding-right:40px
  }
  .journey-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 72px;
    line-height: 1.01;
    text-transform: uppercase;
    color: #000;
    margin: 0;
    
   
  }
  .journey-rider {
    overflow: hidden;
    position: absolute;
    bottom: -116px;
    left: -86px;
}

  // .journey-rider img {
  //   width: 430px;
  //   height: 100%;
  //   object-fit: cover;
  //   object-position: left bottom;
  //   display: block;
  // }
  .journey-content {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 46px;
    margin-bottom:128px;
  }
  .journey-text {
    font-family: 'Outfit', sans-serif;
    font-size: 24px;
    line-height: 30px;
    color: #000;
    margin: 0 0 23px;
    max-width: 700px;
}
.journey-button {
    display: inline-flex;
    align-items: center;
    gap: 25px;
    background: #019839;
    border: 0;
    border-radius: 30px;
    padding: 13px 26px;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-weight: 700;
    font-size: 18px;
    color: #FFF9EF;
    white-space: nowrap;
    min-width: 247px;
    justify-content: center;
}
  // .journey-button-icon {
  //   width: 28px;
  //   height: 28px;
  //   background: rgba(255,255,255,0.25);
  //   border-radius: 50%;
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  //   flex-shrink: 0;
  // }
  .journey-cards {
    min-width: 0;
    display: flex;
    gap: 20px;
    overflow-x: auto;
    padding-bottom: 8px;
    scrollbar-width: none;
  }
  .journey-card {
    flex: 0 0 267px;
    padding:30px 25px 25px;
    height: 340px;
    border-radius: 20px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    transform: translateY(64px);
    will-change: transform, opacity;
    transition: transform 0.25s, box-shadow 0.25s, background 0.25s;
  }
  .journey-cards.is-visible .journey-card {
    animation: cardRiseUp 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .journey-cards.is-visible .journey-card:nth-child(1) { animation-delay: 0.08s; }
  .journey-cards.is-visible .journey-card:nth-child(2) { animation-delay: 0.24s; }
  .journey-cards.is-visible .journey-card:nth-child(3) { animation-delay: 0.40s; }
  .journey-cards.is-visible .journey-card:nth-child(4) { animation-delay: 0.56s; }
  .journey-cards.is-visible .journey-card:hover {
    background: #323232 !important;
    transform: translateY(-8px);
  }
  .platform-card {
    opacity: 0;
    transform: translateY(64px);
    will-change: transform, opacity;
  }
  .platform-cards.is-visible .platform-card {
    animation: cardRiseUp 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .platform-cards.is-visible .platform-card:nth-child(1) { animation-delay: 0.08s; }
  .platform-cards.is-visible .platform-card:nth-child(2) { animation-delay: 0.24s; }
  .platform-cards.is-visible .platform-card:nth-child(3) { animation-delay: 0.40s; }
  .store-animated-card {
    opacity: 0;
    transform: translateY(64px);
    will-change: transform, opacity;
  }
  .store-rail.is-visible .store-animated-card {
    animation: cardRiseUp 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .store-rail.is-visible .store-animated-card:nth-child(1) { animation-delay: 0.08s; }
  .store-rail.is-visible .store-animated-card:nth-child(2) { animation-delay: 0.24s; }
  .store-rail.is-visible .store-animated-card:nth-child(3) { animation-delay: 0.40s; }
  .about-left-image {
    opacity: 0;
    transform: scale(0.9);
    will-change: transform, opacity, filter;
  }
  .about-right-image {
    opacity: 0;
    transform: translateX(120px);
    will-change: transform, opacity;
  }
  .about-section.is-visible .about-left-image {
    animation: aboutLeftFadeIn 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
  .about-section.is-visible .about-right-image {
    animation: aboutRightSlideIn 1.15s cubic-bezier(0.2, 0.8, 0.2, 1) 0.18s both;
  }
  .journey-card-label {
    position: absolute;
    top: 30px;
    left: 25px;
    right: 56px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 26px;
    line-height: 29px;
    text-transform: uppercase;
    color: #FFF9EF;
    white-space: pre-line;
  }
  .journey-card-arrow {
    position: absolute;
    top: 30px;
    right: 25px;
    width: 47px;
    height: 47px;
    background: #FFF9EF;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .journey-card-image {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    height: 220px;
    border-radius: 14px;
    overflow: hidden;
  }
  .journey-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  @media (max-width: 980px) {
    .journey-section {
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 28px;
      padding: 52px 0 52px 52px;
    }
    .journey-copy {
      min-height: 340px;
    }
    .journey-title {
      font-size: 34px;
    }
    .journey-rider {
      width: 240px;
      height: 150px;
      margin-left: -52px;
    }
    .journey-cards {
      padding-right: 52px;
    }
    .journey-card {
      flex-basis: 180px;
      height: 288px;
      border-radius: 12px;
    }
    .journey-card-label {
      top: 18px;
      left: 14px;
      right: 48px;
      font-size: 18px;
    }
    .journey-card-arrow {
      top: 16px;
      right: 14px;
      width: 32px;
      height: 32px;
    }
    .journey-card-image {
      width: calc(100% - 28px);
      height: 180px;
      bottom: 14px;
      border-radius: 10px;
    }
  }

  @media (max-width: 700px) {
    .journey-section {
      grid-template-columns: 1fr;
      gap: 28px;
      padding: 44px 0 44px 24px;
    }
    .journey-copy {
      min-height: auto;
      padding-right: 24px;
    }
    .journey-title {
      font-size: 48px;
      margin-bottom: 18px;
    }
    .journey-rider {
      width: min(100%, 360px);
      height: 170px;
      margin: 4px 0 0 -24px;
    }
    .journey-rider img {
      width: 430px;
    }
    .journey-content {
      gap: 18px;
      padding-top: 0;
    }
    .journey-text {
      max-width: 520px;
      margin: 0 0 18px;
      padding-right: 24px;
    }
    .journey-cards {
      padding-right: 24px;
    }
    .journey-card {
      flex-basis: 168px;
      height: 270px;
    }
    .journey-button {
      font-size: 14px;
      padding: 10px 16px;
    }
    .store-featured-card {
      flex-basis: min(624px, calc(100vw - 48px));
      width: min(624px, calc(100vw - 48px));
      height: 520px;
    }
    .store-featured-icon {
      left: 28px;
      top: 30px;
    }
    .store-featured-type {
      left: 80px;
      top: 43px;
      font-size: 12px;
    }
    .store-featured-action {
      right: 28px;
      top: 36px;
      font-size: 18px;
      line-height: 24px;
      border-bottom-width: 4px;
    }
    .store-featured-title {
      left: 30px;
      top: 160px;
      width: 190px;
      font-size: 28px;
      line-height: 35px;
    }
    .store-featured-sub {
      left: 30px;
      top: 280px;
      width: 220px;
    }
    .store-featured-price {
      left: 30px;
      top: 440px;
      font-size: 38px;
    }
    .store-featured-product {
      right: -16px;
      top: 120px;
      width: 52%;
      height: 300px;
    }
  }
`;

function useHomePageStyles() {
  useEffect(() => {
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&family=Bebas+Neue&display=swap';
    fontLink.dataset.pageStyle = 'home';

    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    styleEl.dataset.pageStyle = 'home';

    document.head.appendChild(fontLink);
    document.head.appendChild(styleEl);

    return () => {
      fontLink.remove();
      styleEl.remove();
    };
  }, []);
}

/* ─── SVG Assets ─────────────────────────────────────────────────────────────*/

function ADCCLogo({ size = 1, light = false }) {
  const color = light ? '#ffffff' : '#000000';
  const subColor = light ? 'rgba(255,255,255,0.7)' : '#333';
  return (
    <svg width={180 * size} height={75.6 * size} viewBox="0 0 180 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="52" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="46" fill={color} letterSpacing="-1">AB</text>
      <circle cx="102" cy="34" r="16" fill="none" stroke={color} strokeWidth="3.5" />
      <circle cx="102" cy="34" r="4.5" fill={color} />
      <line x1="102" y1="18" x2="102" y2="50" stroke={color} strokeWidth="1.5" />
      <line x1="86" y1="34" x2="118" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="90.7" y1="22.7" x2="113.3" y2="45.3" stroke={color} strokeWidth="1.2" />
      <line x1="113.3" y1="22.7" x2="90.7" y2="45.3" stroke={color} strokeWidth="1.2" />
      <circle cx="138" cy="34" r="16" fill="none" stroke={color} strokeWidth="3.5" />
      <circle cx="138" cy="34" r="4.5" fill={color} />
      <line x1="138" y1="18" x2="138" y2="50" stroke={color} strokeWidth="1.5" />
      <line x1="122" y1="34" x2="154" y2="34" stroke={color} strokeWidth="1.5" />
      <line x1="126.7" y1="22.7" x2="149.3" y2="45.3" stroke={color} strokeWidth="1.2" />
      <line x1="149.3" y1="22.7" x2="126.7" y2="45.3" stroke={color} strokeWidth="1.2" />
      <text x="92" y="52" fontFamily="'Arial Black', sans-serif" fontWeight="900" fontSize="46" fill={color} letterSpacing="-1">HABI</text>
      <text x="6" y="70" fontFamily="Arial, sans-serif" fontSize="10" fill={subColor} letterSpacing="1.5">AD CYCLING CLUB</text>
      <text x="88" y="70" fontFamily="Arial, sans-serif" fontSize="9" fill={subColor} letterSpacing="0.5">نادي أبوظبي للدراجات</text>
    </svg>
  );
}

function CloudyIcon() {
  return (
    <svg width="37" height="37" viewBox="0 0 37 37" fill="none">
      <circle cx="15" cy="13" r="5" fill="#F5A623" />
      <line x1="15" y1="5" x2="15" y2="8" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="15" y1="18" x2="15" y2="21" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="7" y1="13" x2="10" y2="13" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="20" y1="13" x2="23" y2="13" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="9.5" y1="7.5" x2="11.6" y2="9.6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20.5" y1="7.5" x2="18.4" y2="9.6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 26 Q13 21 19 21 Q20 16 26 18 Q32 18 32 24 Q32 30 22 30 Q10 30 10 26 Q10 22 15 22 Q13 24 13 26Z" fill="white" stroke="#b0bec5" strokeWidth="1.2" />
    </svg>
  );
}

function CyclingIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="8" cy="22" r="5" fill="none" stroke="#019839" strokeWidth="2" />
      <circle cx="24" cy="22" r="5" fill="none" stroke="#019839" strokeWidth="2" />
      <circle cx="19" cy="10" r="2" fill="#019839" />
      <path d="M19 12 L16 18 L8 22" stroke="#019839" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M19 12 L24 22" stroke="#019839" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M13 18 L24 18" stroke="#019839" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ArrowRight({ color = '#019839', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── QR Code placeholder ───────────────────────────────────────────────────*/
function QRCodePlaceholder() {
  return (
   <img src="/images/barcode.png" className=""/>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────────*/
function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { label: 'About Us', href: '#about' },
    { label: 'Events', href: '/user-event' },
    { label: 'Community', href: '#community', active: true },
    { label: 'Challenges', href: '/user-challenges' },
    { label: 'Tracks', href: '#platform' },
  ];
  return (
    <header style={{ width: '100%', height: 134, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 86px', flexShrink: 0, position: 'relative', zIndex: 10 }}>
      <div style={{ width: 180, height: 75.6, flexShrink: 0 }}><ADCCLogo /></div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 48, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {navLinks.map(link => (
          <a key={link.label} href={link.href} className="hover-green" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 20, lineHeight: '27px', color: link.active ? '#019839' : '#000', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'color 0.2s' }}>{link.label}</a>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <CloudyIcon />
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 17, color: '#000', cursor: 'pointer', whiteSpace: 'nowrap' }}>English</span>
        <button onClick={() => setMenuOpen(v => !v)} className="btn-green" style={{ width: 101, height: 49, background: menuOpen ? '#017a2e' : '#019839', borderRadius: 30, border: 'none', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>Menu</button>
      </div>
    </header>
  );
}

/* ─── HERO ───────────────────────────────────────────────────────────────────*/
function HeroSection() {
  const navigate = useNavigate();

  return (
    <section style={{ position: 'relative', width: '100%', height: 806, overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(../../../../../public/images/hero.png)', backgroundSize: 'cover', backgroundPosition: 'center top' }} />
      <div style={{ position: 'absolute', inset: 0, }} />
      <div style={{ position: 'absolute', left: 86, bottom: 360, maxWidth: 520 }}>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 900, fontSize: 72, lineHeight: 1.1, color: '#000000', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: 28, }}>RIDE ABU DHABI START<br />YOUR CYCLING JOURNEY</h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn-green" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 22px', background: '#019839', border: 'none', borderRadius: 30, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18, color: '#fff' }}>
            Download App <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 13h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => navigate('/user-tracks')} style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 22px', background: 'transparent', border: '2px solid #019839', borderRadius: 30, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#019839' }}>
            Explore Tracks <ArrowRight />
          </button>
        </div>
      </div>
      <div style={{ position: 'absolute', right: 40, bottom: 60, width: 60, height: 60, background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', cursor: 'pointer' }}>
        <CyclingIcon />
      </div>
    </section>
  );
}

/* ─── STATS TICKER ───────────────────────────────────────────────────────────*/
function StatsTicker() {
  const stats = [
    { label: "35,000+ Active Members", bg: "#D9E7F9", dark: false },
    { label: "100KM Signature Loop", bg: "#435974", dark: true },
    { label: "250+ Events Hosted Annually", bg: "#D9E7F9", dark: false },
    { label: "1.5 Million+ KM Cycled", bg: "#435974", dark: true },
  ];
  return (
    <div style={{ width: '100%', height: 100, overflow: 'hidden', display: 'flex' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', animation: 'ticker-group-left 18s linear infinite', whiteSpace: 'nowrap' }}>
        {[0, 1].map((groupIndex) => (
          <div key={groupIndex} style={{ minWidth: '100vw', display: 'flex', alignItems: 'stretch', flexShrink: 0 }}>
            {stats.map((s, i) => (
              <div key={`${groupIndex}-${i}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 36px', height: 100, flex: '1 0 auto', background: s.bg }}>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 29, textTransform: 'uppercase', color: s.dark ? '#fff' : '#000' }}>{s.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── CYCLING JOURNEY ────────────────────────────────────────────────────────*/
function CyclingJourneySection() {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cards = [
    { label: "Find Cycling\nTracks", bg: "#777777", img: "../../../public/images/journey-1.png", to:"/user-tracks" },
    { label: "Discover\nEvents", bg: "#777777", img: "../../../public/images/journey-2.png", to:"/user-event" },
    { label: "Join Active\nChallenges", bg: "#777777", img: "../../../public/images/journey-3.png" , to:"//user-challenges"},
    { label: "Connect With\nRiders", bg: "#777777",img: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&q=80" , to:"/login"},
  ];

  useEffect(() => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCardsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(cardsEl);

    return () => observer.disconnect();
  }, []);
  
  return (
    <section className="journey-section">
      <div className="journey-copy">
        <h2 className="journey-title">Begin Your <br/> Cycling Journey</h2>
        <div className="journey-rider">
          <img src="/images/journey.png" alt="ADCC cyclist" />
        </div>
      </div>
      <div className="journey-content">
        <div ref={cardsRef} className={`journey-cards${cardsVisible ? ' is-visible' : ''}`}>
          {cards.map((card, i) => (
            <div key={i} className="card-hover journey-card" style={{ background: card.bg }}
            onClick={()=>navigate(card?.to)}>
              <span className="journey-card-label">{card.label}</span>
              <div className="journey-card-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#C12D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div className="journey-card-image">
                <img src={card.img} alt={card.label.replace('\n', ' ')} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <p className="journey-text">Choose how you want to ride with ADCC. Discover routes, join challenges, and be part of a growing cycling community.</p>
          <button onClick={() => navigate('/user-tracks')} className="btn-green journey-button">
            Explore all Routes
            <span className="journey-button-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── APP SECTION ────────────────────────────────────────────────────────────*/
function AppSection() {
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const features = [
    { icon: '/images/icon-1.png', label: 'Track Performance\nand Rides' },
    { icon: '/images/icon-2.png', label: 'Join Official\nChallenges' },
    { icon: '/images/icon-3.png', label: 'Connect With\nRiders' },
    { icon: '/images/icon-4.png', label: 'Discover Cycling\nRoutes' },
  ];

  useEffect(() => {
    const phoneEl = phoneRef.current;
    if (!phoneEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPhoneVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(phoneEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="app" style={{ background: '#435974', width: '100%', padding: '80px 86px', display: 'flex', alignItems: 'flex-start', gap: 60, position: 'relative', overflow: 'hidden' }}>
      {/* Left text */}
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 80, lineHeight: 1.007, textTransform: 'uppercase', color: '#fff', marginBottom: 32 }}>Everything You Need.<br />In One App.</h2>
        {/* <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: 32 }}>Track your rides, discover routes, join challenges, and stay connected with the cycling community — all from one powerful app.</p> */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 30, color: '#fff', textTransform: 'uppercase', marginBottom: 23, lineHeight: '30px', }}>Download <br/> ADCC APP</p>
          {/* QR */}
          <div style={{ width: 256, height: 256, background: '#fff', borderRadius: 16, padding: 12, marginBottom: 40 }}>
            <QRCodePlaceholder />
          </div>
        </div>
        {/* App store buttons */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ background: '#fff', borderRadius: 100, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 20.5v-17c0-.7.8-1.1 1.4-.7l14 8.5c.6.4.6 1.1 0 1.4l-14 8.5c-.6.4-1.4 0-1.4-.7z" fill="#4FC3F7"/><path d="M3 20.5l9-9L3 3.5v17z" fill="#6EEC84"/><path d="M3 3.5l10 8 4-4-14-4z" fill="#F7CD45"/><path d="M3 20.5l10-8 4 4-14 4z" fill="#E4464D"/><text x="13" y="16" fontFamily="Arial" fontWeight="bold" fontSize="6" fill="#000">▶</text></svg>
            <div><div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: '#555' }}>GET IT ON</div><div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#000' }}>Google Play</div></div>
          </div>
          <div style={{ background: '#fff', borderRadius: 100, padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000"/></svg>
            <div><div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 9, color: '#555' }}>Download on the</div><div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14, color: '#000' }}>App Store</div></div>
          </div>
        </div>
        
      </div>

      {/* Phone mockup center */}
      <div ref={phoneRef} className={`app-phone-stage${phoneVisible ? ' is-visible' : ''}`} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 500 }}>
        {/* Back phone */}
<<<<<<< Updated upstream
        <div className="app-phone-mockup">
          <img src="../../../public/images/mobile.png" alt="App" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
=======
        <div >
          <img src="/images/mobile.png" alt="App" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
>>>>>>> Stashed changes
          </div>
        {/* Front phone */}
      </div>

      {/* Right features */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 36 }}>
        {features.map((f, i) => (
          <div key={i} className="app-feature" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'default' }}>
            <div className="feature-icon" style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={f.icon} alt={f.label.replace('\n', ' ')} style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', textTransform: 'uppercase', lineHeight: 1.2, whiteSpace: 'pre-line' }}>{f.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── COMMUNITY / EAT SLEEP BIKE ────────────────────────────────────────────*/

function CommunitySection() {
    const navigate = useNavigate();

  const icons = [
    { icon: '/images/vegetabl.gif', label: 'Eat' },
    { icon: '/images/moon-night.gif', label: 'Sleep' },
    { icon: '/images/cycling.gif', label: 'Bike' },
    { icon: '/images/sync.gif', label: 'Repeat' },
  ];
  
  return (
    <section id="community" style={{ background: '#EAF4FF', padding: '125px 86px', textAlign: 'center' }}>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, color: '#000', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>For the Cycling Community</p>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 74, color: '#000', textTransform: 'uppercase', letterSpacing: '-0.5px', marginBottom: 48 }}>Eat • Sleep • Bike • Repeat</h2>
      {/* Icon row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 56 }}>
        {icons.map((ic, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <img src={ic.icon} alt={ic.label} style={{ width: 64, height: 64, objectFit: 'contain', display: 'block' }} />
            </div>
            {i < icons.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 24px',}}>
                <div style={{ width: 50, height: 2, background: '#000' }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#000', margin: '0 4px' }} />
                <div style={{ width: 50, height: 2, background: '#000' }} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 28, color: '#000', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 28 }}>Everything you need to ride, track, and stay connected.</p>
      <button 
      onClick={()=>navigate("/login")}
      className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#019839', border: 'none', borderRadius: 30, padding: '14px 28px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#FFF9EF' }}>
        Start Riding
        <span style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight /></span>
      </button>
    </section>
  );
}

/* ─── EXPLORE THE PLATFORM ───────────────────────────────────────────────────*/
function ExplorePlatformSection() {
  const navigate = useNavigate();
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cards = [
    {
      tag: 'EVENTS',
      img: '/images/explore-1.png',
      title: 'Join upcoming rides and cycling events across the city',
      action: 'View Events',
      to: '/user-events',
    },
    {
      tag: 'TRACK',
      img: '/images/explore-2.png',
      title: 'Discover official cycling routes across Abu Dhabi',
      action: 'View Tracks',
      to: '/user-tracks',
    },
    {
      tag: 'CHALLENGE',
            img: '/images/explore-3.png',
      title: 'Track progress and take on community challenges',
      action: 'View Challenges',
      to: '/user-tracks',
    },
  ];

  useEffect(() => {
    const cardsEl = cardsRef.current;
    if (!cardsEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setCardsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(cardsEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="platform" style={{ background: '#EAF4FF', padding: '0 86px 80px' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: '#000', textTransform: 'uppercase', textAlign: 'center', paddingTop: 35, marginBottom: 40, lineHeight: '72px' }}>Explore the Platform</h2>
      <div ref={cardsRef} className={`platform-cards${cardsVisible ? ' is-visible' : ''}`} style={{ display: 'flex', gap: 0, borderRadius: 20, overflow: 'hidden', height: 480 }}>
        {cards.map((card, i) => (
          <div key={i} onClick={() => navigate(card.to)} className="card-hover platform-card" style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer', borderLeft: i > 0 ? '2px solid rgba(255,255,255,0.3)' : 'none' }}>
            <img src={card.img} alt={card.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.75) 100%)' }} />
            {/* Tag */}
            <div style={{ position: 'absolute', top: 43, left: 32, background: '#435974', borderRadius: 20, padding: '5px 14px' }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: 18, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.tag}</span>
            </div>
            {/* Bottom content */}
            <div style={{ position: 'absolute', bottom: 24, left: 32, right: 32 }}>
              <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#F6EFE7', lineHeight: 1.1, textTransform: 'uppercase', marginBottom: 12 }}>{card.title}</p>
              <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, color: '#F6EFE7', cursor: 'pointer' }}>{card.action}</span>
                <div style={{ height: 3, background: '#435974', borderRadius: 2, marginTop: 2 }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── ADCC STORE ─────────────────────────────────────────────────────────────*/
type StoreCardProduct = {
  id: string;
  type: string;
  action: string;
  title: string;
  sub: string;
  price: string;
  bg: string;
  img: string;
};

const STORE_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

function formatStorePrice(item: StoreItem) {
  const currency = item.currency || 'AED';
  const price = Number.isFinite(Number(item.price)) ? Number(item.price).toLocaleString() : item.price;
  return `${currency} ${price}`;
}

function getStoreImage(item: StoreItem) {
  const image = item.coverImage || item.photos?.[0] || '';
  const trimmedImage = image.trim();

  if (!trimmedImage) return STORE_FALLBACK_IMAGE;
  if (/^(https?:|data:|blob:)/i.test(trimmedImage)) return trimmedImage;

  return new URL(trimmedImage.replace(/^\/+/, ''), `${API_BASE_URL}/`).toString();
}

function getStoreSubText(item: StoreItem) {
  const details = [item.condition, item.city].filter(Boolean);
  if (details.length) return details.join(' • ');
  return item.description || 'Available from ADCC store';
}

function StoreSection() {
  const navigate = useNavigate();
  const storeRailRef = useRef<HTMLDivElement | null>(null);
  const [storeCardsVisible, setStoreCardsVisible] = useState(false);
  const [products, setProducts] = useState<StoreCardProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStoreProducts() {
      try {
        setIsLoading(true);
        setLoadError('');
        const items = await getStoreItems({ status: 'Approved', limit: 3 });
        if (!isMounted) return;

        setProducts(
          items.map((item) => ({
            id: item.id || item._id || item.title,
            type: item.category || 'Community Marketplace',
            action: 'View Store',
            title: item.title,
            sub: getStoreSubText(item),
            price: formatStorePrice(item),
            bg: '#D8E5FB',
            img: getStoreImage(item),
          }))
        );
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load store products');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadStoreProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const railEl = storeRailRef.current;
    if (!railEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setStoreCardsVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(railEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section id="store" style={{ background: '#EAF4FF', padding: '0 86px 80px' }}>
      <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: '#000', textTransform: 'uppercase', textAlign: 'center', marginBottom: 40 }}>ADCC Store</h2>
      <div ref={storeRailRef} className={`store-rail${storeCardsVisible ? ' is-visible' : ''}`}>
        {isLoading && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#435974', padding: '36px 0' }}>Loading store products...</div>
        )}
        {!isLoading && loadError && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#C12D32', padding: '36px 0' }}>{loadError}</div>
        )}
        {!isLoading && !loadError && products.length === 0 && (
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#435974', padding: '36px 0' }}>No store products available.</div>
        )}
        {products.map((p, i) => (
          i === 0 ? (
            <div key={p.id} onClick={() => navigate('/user-adcc-store')} className="store-card store-featured-card store-animated-card">
              <div className="store-featured-icon">
                <img src="/images/users.png" alt="" />
              </div>
              <span className="store-featured-type">{p.type}</span>
              <span className="store-featured-action">{p.action}</span>
              <h3 className="store-featured-title">{p.title}</h3>
              <p className="store-featured-sub">{p.sub}</p>
              <img
                className="store-featured-product"
                src={p.img}
                alt={p.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = STORE_FALLBACK_IMAGE;
                }}
              />
              <span className="store-featured-price">{p.price}</span>
            </div>
          ) : (
          <div key={p.id} onClick={() => navigate('/user-adcc-store')} className="store-card store-compact-card store-animated-card" style={{ background: p.bg }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, background: '#435974', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/images/users.png" alt="" />
                </div>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#000', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.type}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, color: '#000', cursor: 'pointer', borderBottom: '3px solid #019839', paddingBottom: 1 }}>{p.action}</span>
              </div>
            </div>
            {/* Title */}
            <div style={{ padding: '16px 20px 4px' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 24, color: '#000', lineHeight: 1.2, marginBottom: 6 }}>{p.title}</h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#444' }}>{p.sub}</p>
            </div>
            {/* Product image */}
            <div style={{ margin: '12px 20px', height: 200, borderRadius: 12, overflow: 'hidden', background: '#c5d5ee' }}>
              <img
                src={p.img}
                alt={p.title}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = STORE_FALLBACK_IMAGE;
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {/* Price + nav arrows */}
            <div style={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#435974', textTransform: 'uppercase' }}>{p.price}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {['←', '→'].map((arrow, j) => (
                  <div key={j} style={{ width: 36, height: 36, border: '1px solid #000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 16, color: '#000', transition: 'background 0.2s' }}>{arrow}</div>
                ))}
              </div>
            </div>
          </div>
          )
        ))}
      </div>
    </section>
  );
}

/* ─── ABOUT SECTION ──────────────────────────────────────────────────────────*/
function AboutSection() {
  const navigate = useNavigate();
  const aboutRef = useRef<HTMLElement | null>(null);
  const [aboutVisible, setAboutVisible] = useState(false);
  const stats = [
    { num: '15K+', label: 'Riders' },
    { num: '100+', label: 'Events' },
    { num: '10+', label: 'Years' },
  ];

  useEffect(() => {
    const aboutEl = aboutRef.current;
    if (!aboutEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => setAboutVisible(entry.isIntersecting),
      { threshold: 0.35 }
    );

    observer.observe(aboutEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={aboutRef} id="about" className={`about-section${aboutVisible ? ' is-visible' : ''}`} style={{ background: '#EAF4FF', padding: '60px 86px 80px', display: 'flex', gap: 60, alignItems: 'center' }}>
      {/* Left image */}
      <div className="about-left-image" style={{ flexShrink: 0, width: 380, height: 560, borderRadius: 20, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}>
        <img src="https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=600&q=80" alt="ADCC Cyclists" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      {/* Right content */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 74, color: '#000', textTransform: 'uppercase', lineHeight: 1.01, marginBottom: 24 }}>About Abu Dhabi<br />Cycling Club</h2>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, color: '#000', lineHeight: 1.6, marginBottom: 40, maxWidth: 600 }}>
          At Abu Dhabi Cycling Club, every ride is a step toward building a stronger, healthier, and more connected society. We are the heart of the UAE's cycling movement uniting enthusiasts, athletes, and families through the shared joy of cycling.
        </p>
        {/* Stats */}
        <div style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
          {stats.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 50, color: '#000', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, color: '#444', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate('/communities-abu-dhabi-cycling-community')} className="btn-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#019839', border: 'none', borderRadius: 30, padding: '14px 28px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#FFF9EF' }}>
          Read More
          <span style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight /></span>
        </button>
      </div>
      {/* Decorative rider image */}
<<<<<<< Updated upstream
      <div className="about-right-image" style={{ flexShrink: 0, width: 280, height: 340, overflow: 'hidden'}}>
        <img src="../../../public/images/right-cycle.png" alt="Rider" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
=======
      <div style={{ flexShrink: 0, width: 280, height: 340, overflow: 'hidden'}}>
        <img src="/images/right-cycle.png" alt="Rider" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
>>>>>>> Stashed changes
      </div>
    </section>
  );
}

/* ─── CTA BANNER ─────────────────────────────────────────────────────────────*/
function CTABanner() {
  return (
    <section style={{ position: 'relative', width: '100%', height: 420, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1508784411316-06c06401e69b?w=1440&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 86px' }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 88, color: '#fff', textTransform: 'uppercase', lineHeight: 1.0, marginBottom: 16 }}>Start Your Ride Today</h2>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, color: 'rgba(255,255,255,0.9)', marginBottom: 36 }}>Download the ADCC app and join the cycling community.</p>
        {/* App store buttons */}
        <div style={{ display: 'flex', gap: 20 }}>
          {[
            { bg: 'white', top: 'GET IT ON', main: 'Google Play', icon: '▶' },
            { bg: 'white', top: 'Download on the', main: 'App Store', icon: '' },
          ].map((btn, i) => (
            <div key={i} style={{ background: btn.bg, borderRadius: 100, padding: '12px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
              <div style={{ fontSize: 24 }}>{i === 0 ? '▶' : ''}</div>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: i === 1 ? 'block' : 'none' }}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" fill="#000" />
              </svg>
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 10, color: '#555' }}>{btn.top}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 18, color: '#000' }}>{btn.main}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FOOTER ─────────────────────────────────────────────────────────────────*/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Footer() {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailMessageType, setEmailMessageType] = useState<'success' | 'error'>('success');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const quickLinks = ['About Us', 'Rides', 'Events', "Cyclist's Corner", 'Contact Us'];
  const contactItems = [
    { icon: '📞', text: '+971 2 654 5645' },
    { icon: '💬', text: '144226' },
    { icon: '✉️', text: 'info@adcyclingclub.ae' },
    { icon: '📍', text: 'Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18.' },
  ];

  const handleEmailSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailMessageType('error');
      setEmailMessage('Please enter your email address.');
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setEmailMessageType('error');
      setEmailMessage('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmittingEmail(true);
      setEmailMessage('');
      await subscribeToNewsletter(normalizedEmail);
      setEmail('');
      setEmailMessageType('success');
      setEmailMessage('Thanks for subscribing.');
    } catch (error) {
      setEmailMessageType('error');
      setEmailMessage(error instanceof Error ? error.message : 'Failed to subscribe.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <footer style={{ background: '#ffffff', borderTop: '1px solid #e5e5e5' }}>
      <div style={{ padding: '60px 86px 30px', display: 'flex', gap: 60 }}>
        {/* Logo + tagline + newsletter */}
        <div style={{ flexShrink: 0, width: 340 }}>
          <div style={{ marginBottom: 24 }}><ADCCLogo size={0.83} /></div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: '#333', lineHeight: 1.6, marginBottom: 32 }}>
            From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where your cycling journey thrives…
          </p>
          {/* Email signup */}
          <div style={{ display: 'flex', background: '#8DDF93', borderRadius: 10, overflow: 'hidden', height: 52 }}>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailMessage) setEmailMessage('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleEmailSubmit();
              }}
              placeholder="Enter your email"
              style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 16px', fontFamily: "'Outfit', sans-serif", fontSize: 15, color: '#333', outline: 'none' }}
            />
            <button disabled={isSubmittingEmail} className="btn-green" onClick={handleEmailSubmit} style={{ background: '#019839', border: 'none', padding: '0 20px', cursor: isSubmittingEmail ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: '#fff', borderRadius: '0 10px 10px 0', opacity: isSubmittingEmail ? 0.72 : 1 }}>{isSubmittingEmail ? 'Saving...' : 'Submit'}</button>
          </div>
          {emailMessage && (
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: emailMessageType === 'success' ? '#019839' : '#C12D32', marginTop: 8 }}>
              {emailMessage}
            </p>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', gap: 60 }}>
          {/* Quick links */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#000', textTransform: 'uppercase', marginBottom: 24 }}>Quick Links</h3>
            <ul style={{ listStyle: 'none' }}>
              {quickLinks.map(l => (
                <li key={l} style={{ marginBottom: 14 }}>
                  <a href="#" className="hover-green" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, color: '#000', textDecoration: 'none', transition: 'color 0.2s' }}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#000', textTransform: 'uppercase', marginBottom: 24 }}>Contact Us</h3>
            <ul style={{ listStyle: 'none' }}>
              {contactItems.map((c, i) => (
                <li key={i} style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{c.icon}</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: '#000', lineHeight: 1.4 }}>{c.text}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Social */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: '#000', textTransform: 'uppercase', marginBottom: 24 }}>Follow Us</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['📘', '📷', '🐦', '▶️'].map((icon, i) => (
                <div key={i} style={{ width: 44, height: 44, background: '#EAF4FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20, transition: 'background 0.2s' }}>{icon}</div>
              ))}
            </div>
            {/* Green badge */}
            <div style={{ marginTop: 32, width: 55, height: 55, background: '#019839', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(1,152,57,0.3)', cursor: 'pointer' }}>
              <ADCCLogo size={0.19} light={true} />
            </div>
          </div>
        </div>
      </div>

      {/* Divider + copyright */}
      <div style={{ borderTop: '1px solid #D5D5D5', margin: '0 86px', padding: '20px 0', textAlign: 'center' }}>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: 'rgba(0,0,0,0.6)' }}>Copyright 2026. Abu Dhabi Cycling Club</span>
      </div>
    </footer>
  );
}

/* ─── HOME PAGE ──────────────────────────────────────────────────────────────*/
export function Home() {
  useHomePageStyles();

  return (
    <div style={{ minHeight: '100vh', background: '#EAF4FF', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <HeroSection />
      <StatsTicker />
      <CyclingJourneySection />
      <AppSection />
      <CommunitySection />
      <ExplorePlatformSection />
      <StoreSection />
      <AboutSection />
      <CTABanner />
      <Footer />
    </div>
  );
}

export default Home;
