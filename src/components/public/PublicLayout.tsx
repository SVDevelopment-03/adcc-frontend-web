import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Apple, Bike, LogIn, LogOut, Mail, MapPin, Menu, MessageCircle, Phone, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useLocale } from '../../contexts/LocaleContext';
import { AnimatedButton } from '../ui/AnimatedButton';
import { HeaderWeather } from './HeaderWeather';
import { LanguageSwitcher } from './LanguageSwitcher';
import { APP_STORE_LINKS } from '../../config/appStoreLinks';
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
];

function Logo({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();

  return (
   <img
    src="/images/adcc-logo.png"
    alt="Abu Dhabi Cycling Club"
    onClick={() => navigate("/home")}
    className={compact ? 'h-14 w-34 object-contain sm:h-16 sm:w-38' : 'h-13 w-32 object-contain sm:h-15 sm:w-36 lg:h-17 lg:w-42 xl:h-19 xl:w-45'}
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
    <header className="public-header sticky top-0 z-[100] flex h-20 w-full items-center justify-between bg-white px-5 py-2 shadow-sm sm:h-22 sm:px-6 md:px-10! lg:h-24 lg:px-14! xl:h-28 xl:px-22!">
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
              // className={`inline-block transition-colors duration-300 ease-out hover:text-[#019839] ${
              //   isActive ? 'text-[#019839]' : 'text-black'
              // }`}
              className={`inline-block transition-colors duration-300 ease-out hover:!text-[#019839] ${
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
        <div className="group relative hidden sm:block">
          <AnimatedButton
            showArrow={false}
            hoverDark
            className="h-10 w-[86px] px-5 text-[15px] lg:h-11 lg:w-[94px] xl:h-12 xl:w-[101px] xl:px-7 xl:text-[18px]"
          >
            {t('public.auth.menu')}
          </AnimatedButton>
          <div className="invisible absolute right-0 top-full z-[120] w-[220px] translate-y-2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white p-3 shadow-[0_18px_45px_rgba(0,0,0,0.16)]">
              <button
                type="button"
                onClick={handleAuthAction}
                className={`public-auth-button flex min-h-12 w-full items-center gap-4 rounded-lg px-7 py-3.5 text-[16px] font-semibold text-black transition-colors hover:bg-black hover:text-white focus:bg-black focus:text-white focus:outline-none ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}
              >
                {isAuthenticated ? (
                  <LogOut className={`h-5 w-5 ${isRtl ? 'mr-0 ml-5' : 'ml-5'}`} />
                ) : (
                  <LogIn className={`h-5 w-5 ${isRtl ? 'mr-0 ml-5' : '!ml-5'}`} />
                )}
                <span>{isAuthenticated ? t('public.auth.logout') : t('public.auth.login')}</span>
              </button>
            </div>
          </div>
        </div>
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
                  className={`rounded-md px-4 py-2.5 transition-colors duration-300 ease-out hover:!text-[#019839] ${
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
              className={`public-auth-button mt-3 flex items-center gap-3 rounded-md bg-[#019839] py-3.5 text-[16px] font-bold text-white transition-colors hover:bg-black ${isRtl ? 'flex-row-reverse pl-5 pr-7' : 'pl-7 pr-5'}`}
            >
              {isAuthenticated ? (
                <LogOut className={`h-5 w-5 ${isRtl ? 'mr-0 ml-5' : 'ml-5'}`} />
              ) : (
                <LogIn className={`h-5 w-5 ${isRtl ? 'mr-0 ml-5' : 'ml-5'}`} />
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
  const { t } = useTranslation();
  const href = type === 'google' ? APP_STORE_LINKS.googlePlay : APP_STORE_LINKS.appStore;

  return (
    <a
      href={href}
      className="inline-flex h-[53px] w-[198px] flex-none items-center justify-center gap-[10px] rounded-[100px] bg-white px-[26px] py-0 text-black no-underline shadow-lg transition-opacity hover:opacity-90 sm:h-[57px] sm:w-[213px] sm:px-[34px]"
    >
      {type === 'google' ? <Play className="h-[27px] w-[27px] shrink-0 fill-[#34A853] text-[#34A853] sm:h-[31px] sm:w-[29px]" /> : <Apple className="h-[24px] w-[24px] shrink-0 sm:h-[26px] sm:w-[26px]" />}
      <span className="flex min-w-0 flex-none flex-col items-start justify-center text-left">
        <span className="block whitespace-nowrap text-[8px] font-semibold uppercase leading-[1.05] text-black/60 sm:text-[9px]">
          {type === 'google' ? t('public.footer.getItOn') : t('public.footer.downloadOn')}
        </span>
        <span className="block whitespace-nowrap text-[15px] font-bold leading-[1.1] sm:text-[16px]">
          {type === 'google' ? t('public.footer.googlePlay') : t('public.footer.appStore')}
        </span>
      </span>
    </a>
  );
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
        className="relative flex min-h-[360px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-12 text-center text-white sm:min-h-[430px] sm:px-6 sm:py-16 lg:min-h-[502px]"
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

      <footer className="relative bg-[#EAF4FF] px-4! pt-12! pb-[25px]! sm:px-6! sm:pt-16! md:px-10! lg:px-16! lg:pt-20! xl:px-20! xl:pt-25!">
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
              <li><NavLink to="/aboutus">{t('public.nav.aboutUs')}</NavLink></li>
              <li><NavLink to="/user-tracks">{t('public.footer.rides')}</NavLink></li>
              <li><NavLink to="/user-event">{t('public.nav.events')}</NavLink></li>
              <li><NavLink to="/user-challenges">{t('public.footer.cyclistsCorner')}</NavLink></li>
              <li><NavLink to="/contact-us">{t('public.footer.contactUs')}</NavLink></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[22px] font-black uppercase sm:text-[24px]">{t('public.footer.contactUs')}</h3>
            <ul className="mt-5! space-y-3! text-[16px] leading-6 sm:mt-7! sm:space-y-4! sm:text-[18px]">
              <li className="flex gap-3"><Phone className="mt-0.5 h-5 w-5 shrink-0" /> <span>+971 2 654 5645</span></li>
              <li className="flex gap-3"><MessageCircle className="mt-0.5 h-5 w-5 shrink-0" /> <span>144226</span></li>
              <li className="flex gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0" /> <span>Abu Dhabi, Yas Island, Yas Marina Circuit, Villa 18.</span></li>
              <li className="flex gap-3"><Mail className="mt-0.5 h-5 w-5 shrink-0" /> <span className="break-all">info@adcyclingclub.ae</span></li>
            </ul>
          </div>
        </div>

        <button type="button" aria-label={t('public.footer.cyclingShortcut')} className="mt-10 ml-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#019839] text-white shadow-lg transition-colors hover:bg-black md:absolute md:bottom-24 md:right-10 md:mt-0 md:h-12 md:w-12 lg:right-16 xl:right-20">
          <Bike className="h-5 w-5 md:h-6 md:w-6" />
        </button> 

        <div className="mt-10! border-t border-black/15 pt-[20px]! text-center sm:mt-14! md:mt-20!">
          <span className="inline-block h-[23px] w-[319px] max-w-full font-['Outfit'] text-[18px] font-normal leading-none text-black">
            {t('public.footer.copyright')}
          </span>
        </div>
      </footer>
    </>
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
    </div>
  );
}
