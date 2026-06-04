import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Apple, Bike, CloudSun, Mail, MapPin, Menu, MessageCircle, Phone, Play } from 'lucide-react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'About Us', to: '/aboutus', match: ['/aboutus'] },
  { label: 'Events', to: '/user-event', match: ['/user-event', '/user-events', '/communities-abu-dhabi-grand-prix-ride'] },
  {
    label: 'Community',
    to: '/user-communities',
    match: [
      '/home',
      '/user-challenges',
      '/user-communities',
      '/communities-abu-dhabi-cycling-community',
      '/communities-march-distance-challenge',
    ],
  },
  { label: 'Tracks', to: '/user-tracks', match: ['/user-tracks', '/communities-al-quadra-cycle-path'] },
];

function Logo({ compact = false }: { compact?: boolean }) {
  return (
   <img src="../../../public/images/adcc-logo.png" className="h-19 w-45"/>
  );
}

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-[100] flex h-28 w-full items-center justify-between bg-white px-8 shadow-sm md:px-16! lg:px-22!">
      <Logo />

      <nav className="hidden items-center gap-10 text-[20px] font-medium lg:flex">
        {navItems.map((item) => {
          const isActive = item.match.some((path) => location.pathname === path);
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className="transition-colors hover:text-[#019839]"
              style={{ color: isActive ? '#019839' : '#000' }}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center gap-7">
        <CloudSun className="h-6 w-6 text-[#F5A623]" />
        <span className="hidden text-[16px] font-medium text-black sm:inline">English</span>
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-12 justify-center items-center gap-2 rounded-full bg-[#019839] px-7 text-[18px] font-bold text-white transition-colors hover:bg-[#017a2e] w-[101px]"
        >
          <Menu className="h-5 w-5 lg:hidden" />
          <span>Menu</span>
        </button>
      </div>

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full border-t border-black/10 bg-white px-8 py-5 shadow-lg lg:hidden">
          <nav className="flex flex-col gap-4 text-[16px] font-medium">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="hover:text-[#019839]"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function StoreButton({ type }: { type: 'google' | 'apple' }) {
  return (
    <button
      type="button"
      className="flex min-h-12 items-center justify-center gap-3 rounded-full bg-white px-6 text-black shadow-lg min-w-[213px]"
    >
      {type === 'google' ? <Play className="h-6 w-6 fill-[#34A853] text-[#34A853]" /> : <Apple className="h-6 w-6" />}
      <span className="text-left">
        <span className="block text-[9px] font-semibold uppercase leading-none text-black/60">
          {type === 'google' ? 'Get it on' : 'Download on the'}
        </span>
        <span className="block text-[16px] font-bold leading-tight">
          {type === 'google' ? 'Google Play' : 'App Store'}
        </span>
      </span>
    </button>
  );
}

function PublicFooter() {
  const [email, setEmail] = useState('');

  return (
    <>
      <section
        className="relative flex min-h-[502px] items-center justify-center overflow-hidden bg-cover bg-center px-6 py-16 text-center text-white"
        style={{
          backgroundImage:
            " url('../../../public/images/footer-image.png')",
            
        }}
      >
        <div className="relative z-10">
          <h2 className="text-[40px] font-black uppercase leading-none tracking-wide md:text-[64px]">Start Your Ride Today</h2>
          <p className="mt-7! text-[18px] md:text-[22px]">Download the ADCC app and join the cycling community.</p>
          <div className="mt-7! flex flex-wrap justify-center gap-4">
            <StoreButton type="google" />
            <StoreButton type="apple" />
          </div>
        </div>
      </section>

      <footer className="relative bg-[#EAF4FF] px-8! py-25! md:px-16! lg:px-20! pb-4!">
        <div className="grid gap-12 lg:grid-cols-[1fr_190px_1fr]">
          <div>
            <Logo compact />
            <p className="mt-9! max-w-[390px] text-[18px] leading-6 text-black">
              From weekend warriors to elite athletes, we unite cyclists who share a passion for riding. ADCC is where
              your cycling journey thrives...
            </p>
            <div className="mt-7! flex h-12 max-w-[330px] overflow-hidden rounded-lg bg-[#8DDF93] p-1">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-4! text-[14px] outline-none placeholder:text-black/45"
              />
              <button type="button" onClick={() => setEmail('')} className="rounded-md bg-[#019839] px-6! text-[14px] font-medium text-white min-w-[103px]">
                Submit
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-[24px] font-black uppercase">Quick Links</h3>
            <ul className="!mt-7 space-y-4! text-[18px]">
              <li><NavLink to="/aboutus">About Us</NavLink></li>
              <li><NavLink to="/user-tracks">Rides</NavLink></li>
              <li><NavLink to="/user-events">Events</NavLink></li>
              <li><NavLink to="/user-challenges">Cyclist's Corner</NavLink></li>
              <li><NavLink to="/contact-us">Contact Us</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[24px] font-black uppercase">Contact Us</h3>
            <ul className="mt-7! space-y-4! text-[18px]">
              <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0" /> +971 2 654 5645</li>
              <li className="flex gap-3"><MessageCircle className="h-5 w-5 shrink-0" /> 144226</li>
              <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0" /> Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18.</li>
              <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0" /> info@adcyclingclub.ae</li>
            </ul>
          </div>
        </div>

        <button type="button" aria-label="Cycling shortcut" className="absolute bottom-24 right-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white shadow-lg md:right-20">
          <Bike className="h-6 w-6" />
        </button>

        <div className="mt-20! border-t border-black/15 pt-6! text-center text-[15px] text-black/70">
          Copyright 2026. Abu Dhabi Cycling Club
        </div>
      </footer>
    </>
  );
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-layout min-h-screen bg-[#EAF4FF] text-black">
      <PublicHeader />
      <main className="public-layout-content">{children}</main>
      <PublicFooter />
    </div>
  );
}
