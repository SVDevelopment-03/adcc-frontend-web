import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronUp, LogIn, LogOut, Mail, MapPin, Menu, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import { HeaderWeather } from './HeaderWeather';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AppStoreButton } from './AppStoreButton';
import { subscribeToNewsletter } from '../../services/newsletterApi';

interface PublicLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { labelKey: 'public.nav.home', to: '/home', match: ['/home'] },
  { labelKey: 'public.nav.aboutUs', to: '/aboutus', match: ['/aboutus'] },
  { labelKey: 'public.nav.events', to: '/user-event', match: ['/user-event', '/user-events', '/communities-abu-dhabi-grand-prix-ride'] },
  {
    labelKey: 'public.nav.community',
    to: '/user-communities',
    match: [
      '/user-communities',
      '/communities-abu-dhabi-cycling-community',
      '/communities-march-distance-challenge',
    ],
  },
  { labelKey: 'public.nav.challenges', to: '/user-challenges', match: ['/user-challenges'] },
  { labelKey: 'public.nav.tracks', to: '/user-tracks', match: ['/user-tracks', '/communities-al-quadra-cycle-path'] },
  { labelKey: 'public.footer.contactUs', to: '/contact-us', match: ['/contact-us'] },
];

function Logo({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();

  return (
   <img
    src="/images/adcc-logo.png"
    alt="Abu Dhabi Cycling Club"
    onClick={() => navigate("/home")}
    className={compact ? 'h-14 w-34 object-contain sm:h-16 sm:w-38 cursor-pointer' : 'h-13 w-32 object-contain sm:h-15 sm:w-36 lg:h-17 lg:w-42 xl:h-19 xl:w-45 cursor-pointer'}
   />
  );
}

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const { isRtl } = useLocale();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await logout();
      navigate('/home');
      return;
    }

    navigate('/login');
  };

  return (
    <header className="public-header sticky top-0 z-[100] flex h-20 w-full items-center justify-between bg-[#EAF4FF] px-5 py-2 shadow-sm sm:h-22 sm:px-6 md:px-10! lg:h-24 lg:px-14! xl:h-28 xl:px-22!">
      <style>{`
        @media (max-width: 640px) {
          .public-header {
            min-height: 92px !important;
            padding: 14px 22px !important;
          }
          .public-header-logo-wrap img {
            width: 132px !important;
            height: auto !important;
            display: block !important;
          }
          .public-header-actions {
            gap: 14px !important;
          }
          .public-menu-toggle {
            width: 46px !important;
            height: 46px !important;
          }
          .public-mobile-menu {
            padding: 16px 22px 20px !important;
          }
          .public-mobile-menu nav {
            gap: 6px !important;
          }
          .public-mobile-menu a {
            padding: 8px 4px !important;
            line-height: 1.25 !important;
          }
          .public-auth-button {
            padding: 13px 18px !important;
          }
          .public-mobile-menu button {
            margin-top: 12px !important;
            padding: 13px 18px !important;
          }
        }
        .pub-nav-link {
          border-radius: 6px;
          padding: 4px 12px;
          transition: background-color 0.25s ease;
        }
        .pub-nav-link:hover {
          background-color: #fff;
        }
        .pub-footer-link {
          position: relative;
          display: inline-block;
        }
        .pub-footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1.5px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        .pub-footer-link:hover::after {
          width: 100%;
        }
      `}</style>
      <div className="public-header-logo-wrap">
        <Logo />
      </div>

      <nav className="hidden items-center gap-6 text-[17px] font-medium xl:flex 2xl:gap-10 2xl:text-[20px]">
        {navItems.map((item) => {
          const isActive = item.match.some(
            (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
          );
          return (
            <NavLink
              key={item.labelKey}
              to={item.to}
              className={`pub-nav-link inline-block ${
                isActive ? '!text-[#019839]' : '!text-black'
              }`}
            >
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>

      <div className="public-header-actions flex items-center gap-3 sm:gap-4 lg:gap-5 xl:gap-7">
        <HeaderWeather />
        <LanguageSwitcher />
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label={t('public.auth.toggleMenu')}
          onClick={() => setMenuOpen((value) => !value)}
          className="public-menu-toggle flex h-11 w-11 items-center justify-center rounded-full bg-[#019839] text-white transition-colors hover:bg-black sm:h-11 sm:w-11 xl:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="public-mobile-menu absolute left-0 right-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto border-t border-black/10 bg-white px-5 py-5 shadow-lg sm:px-6 md:px-10 xl:hidden">
          <nav className="flex flex-col gap-2 text-[16px] font-semibold">
            {navItems.map((item) => {
              const isActive = item.match.some(
                (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
              );
              return (
                <NavLink
                  key={item.labelKey}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  className={`pub-nav-link px-4 py-2.5 ${
                    isActive ? '!text-[#019839]' : '!text-black'
                  }`}
                >
                  {t(item.labelKey)}
                </NavLink>
              );
            })}
            <LanguageSwitcher className="block md:hidden px-4 py-2" />
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void handleAuthAction();
              }}
              className={`public-auth-button mt-3 flex items-center gap-3 rounded-md bg-[#019839] py-3.5 ps-7 pe-5 text-[16px] font-bold text-white transition-colors hover:bg-black ${isRtl ? 'flex-row-reverse' : ''}`}
            >
              {isAuthenticated ? (
                <LogOut className="h-5 w-5 shrink-0" />
              ) : (
                <LogIn className="h-5 w-5 shrink-0" />
              )}
              <span>{isAuthenticated ? t('public.auth.logout') : t('public.auth.login')}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

function StoreButton({ type }: { type: 'google' | 'apple' }) {
  return <AppStoreButton type={type} />;
}

function PublicFooter() {
  const [email, setEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [emailMessageType, setEmailMessageType] = useState<'success' | 'error'>('success');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const { t } = useTranslation();

  const handleNewsletterSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailMessageType('error');
      setEmailMessage(t('public.footer.emailRequired'));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailMessageType('error');
      setEmailMessage(t('public.footer.emailInvalid'));
      return;
    }

    try {
      setIsSubmittingEmail(true);
      setEmailMessage('');
      await subscribeToNewsletter(normalizedEmail, 'public-footer');
      setEmail('');
      setEmailMessageType('success');
      setEmailMessage(t('public.footer.thanks'));
    } catch (error) {
      setEmailMessageType('error');
      setEmailMessage(
        error instanceof Error ? error.message : t('public.footer.subscribeError'),
      );
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <>
      <section
        className="public-footer-cta relative flex min-h-[360px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-12 text-center text-white sm:min-h-[430px] sm:px-6 sm:py-16 lg:min-h-[502px]"
        style={{
          backgroundImage:
            " url('/images/footer-image.png')",
        }}
      >
        <div className="relative z-10 w-full max-w-[760px]">
          <h2 className="text-[36px] font-black uppercase leading-none tracking-wide sm:text-[44px] md:text-[56px] lg:text-[64px]">{t('public.footer.ctaTitle')}</h2>
          <p className="mt-5! text-[16px] leading-6 sm:mt-7! sm:text-[18px] md:text-[22px]">{t('public.footer.ctaSubtitle')}</p>
          <div className="mt-6! flex flex-col items-center justify-center gap-3 sm:mt-7! sm:flex-row sm:flex-wrap sm:gap-4">
            <StoreButton type="google" />
            <StoreButton type="apple" />
          </div>
        </div>
      </section>

      <footer className="public-footer relative bg-[#EAF4FF] px-4! pt-12! pb-[26px]! sm:px-6! sm:pt-16! md:px-10! lg:px-16! lg:pt-20! xl:px-20! xl:pt-25!">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1fr)_190px_minmax(280px,1fr)] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo compact />
            <p className="mt-6! max-w-[390px] text-[16px] leading-6 text-black sm:mt-8! sm:text-[18px] lg:mt-9!">
              {t('public.footer.brandText')}
            </p>
            <div className="mt-6! flex h-12 w-full max-w-[360px] overflow-hidden rounded-lg bg-[#8DDF93] p-1 max-[380px]:h-auto max-[380px]:flex-col sm:mt-7!">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailMessage) setEmailMessage('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleNewsletterSubmit();
                  }
                }}
                placeholder={t('public.footer.emailPlaceholder')}
                disabled={isSubmittingEmail}
                aria-label={t('public.footer.emailPlaceholder')}
                className="min-h-10 min-w-0 flex-1 bg-transparent px-4! text-[14px] outline-none placeholder:text-black/45 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void handleNewsletterSubmit()}
                disabled={isSubmittingEmail}
                className="min-h-10 rounded-md bg-[#019839] px-5! text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[103px] sm:px-6!"
              >
                {isSubmittingEmail ? t('public.footer.saving') : t('public.footer.submit')}
              </button>
            </div>
            {emailMessage && (
              <p
                className={`mt-2! max-w-[360px] text-[13px] ${
                  emailMessageType === 'success' ? 'text-[#019839]' : 'text-[#C12D32]'
                }`}
              >
                {emailMessage}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-[22px] font-black uppercase sm:text-[24px]">{t('public.footer.quickLinks')}</h3>
            <ul className="!mt-5 space-y-3! text-[16px] sm:!mt-7 sm:space-y-4! sm:text-[18px]">
              <li><NavLink to="/aboutus" className="pub-footer-link">{t('public.nav.aboutUs')}</NavLink></li>
              <li><NavLink to="/user-tracks" className="pub-footer-link">{t('public.footer.rides')}</NavLink></li>
              <li><NavLink to="/user-event" className="pub-footer-link">{t('public.nav.events')}</NavLink></li>
              <li><NavLink to="/user-challenges" className="pub-footer-link">{t('public.footer.cyclistsCorner')}</NavLink></li>
              <li><NavLink to="/contact-us" className="pub-footer-link">{t('public.footer.contactUs')}</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[22px] font-black uppercase sm:text-[24px]">{t('public.footer.contactUs')}</h3>
            <ul className="mt-5! space-y-3! text-[16px] leading-6 sm:mt-7! sm:space-y-4! sm:text-[18px]">
              <li className="flex gap-3"> 
                <Phone className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href="tel:+97126545645"
                  className="transition-colors hover:text-[#019839]"
                >
                  +971 2 654 5645 
                </a>
              </li>
              {/* <li className="flex gap-3"><MessageCircle className="mt-0.5 h-5 w-5 shrink-0" /> <span>144226</span></li> */}
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Abu%20Dhabi%2C%20Yas%20Island%2C%20Yas%20Marina%20Circuit%2C%20Villa%2018"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#019839]"
                >
                  Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18.
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href="mailto:info@adcyclingclub.ae"
                  className="break-all transition-colors hover:text-[#019839]"
                >
                  info@adcyclingclub.ae
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10! border-t border-black/15 pt-[20px]! text-center sm:mt-14! md:mt-20!">
          <span className="inline-block h-[23px] w-fit max-w-full whitespace-nowrap text-[clamp(14px,4.6vw,18px)] font-normal leading-none text-black">
            {t('public.footer.copyright')}
          </span>
        </div>
      </footer>
    </>
  );
}

function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className="fixed bottom-8 end-8 z-[200] flex h-12 w-12 items-center justify-center rounded-full bg-[#019839] text-white shadow-lg transition-all duration-300 hover:bg-black hover:scale-110 focus:outline-none"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  );
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="public-layout min-h-screen bg-[#EAF4FF] text-black">
      <PublicHeader />
      <main className="public-layout-content">{children}</main>
      <PublicFooter />
      <ScrollToTopButton />
    </div>
  );
}
