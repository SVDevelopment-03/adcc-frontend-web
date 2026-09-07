import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Facebook,
  Instagram,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { HeaderWeather } from "./HeaderWeather";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AppStoreButton } from "./AppStoreButton";
import { subscribeToNewsletter } from "../../services/newsletterApi";

interface PublicLayoutProps {
  children: React.ReactNode;
}

interface NavChild {
  labelKey: string;
  to: string;
  match: string[];
}

interface NavItem {
  labelKey: string;
  match: string[];
  to?: string;
  children?: NavChild[];
}

const navItems: NavItem[] = [
  { labelKey: "public.nav.home", to: "/", match: ["/", "/home"] },
  { labelKey: "public.nav.aboutUs", to: "/aboutus", match: ["/aboutus"] },
  {
    labelKey: "public.nav.events",
    to: "/user-event",
    match: ["/user-event", "/user-events"],
  },
  {
    labelKey: "public.nav.community",
    to: "/user-communities",
    match: ["/user-communities"],
  },
  {
    labelKey: "public.nav.challenges",
    to: "/user-challenges",
    match: ["/user-challenges"],
  },
  {
    labelKey: "public.nav.tracks",
    to: "/user-tracks",
    match: ["/user-tracks"],
  },
  {
    labelKey: "public.nav.store",
    match: ["/user-adcc-store", "/user-marketplace"],
    children: [
      {
        labelKey: "public.nav.clubStore",
        to: "/user-adcc-store",
        match: ["/user-adcc-store"],
      },
      {
        labelKey: "public.nav.marketplace",
        to: "/user-marketplace",
        match: ["/user-marketplace"],
      },
    ],
  },
  {
    labelKey: "public.footer.contactUs",
    to: "/contact-us",
    match: ["/contact-us"],
  },
];

const socialLinks = [
  {
    labelKey: "public.footer.social.twitter",
    href: "https://twitter.com/adcyclingclub",
    Icon: Twitter,
  },
  {
    labelKey: "public.footer.social.facebook",
    href: "https://www.facebook.com/adcyclingclub/",
    Icon: Facebook,
  },
  {
    labelKey: "public.footer.social.instagram",
    href: "https://www.instagram.com/adcyclingclub/",
    Icon: Instagram,
  },
  {
    labelKey: "public.footer.social.youtube",
    href: "https://www.youtube.com/channel/UCmAQA4sNHPvpae86czU-U4g",
    Icon: Youtube,
  },
];

function isNavItemActive(item: NavItem | NavChild, pathname: string): boolean {
  return item.match.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <img
      src={compact ? "/images/adcc-logo.png" : "/images/adcc-logo-header.png"}
      alt={t("public.nav.logoAlt")}
      onClick={() => navigate("/")}
      className={
        compact
          ? "block h-16 w-40 object-contain object-left mr-auto sm:h-18 sm:w-44 cursor-pointer"
          : "h-8 w-20 object-contain object-left sm:h-9 sm:w-22 lg:h-10 lg:w-24 xl:h-11 xl:w-28 cursor-pointer"
      }
    />
  );
}

function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(
    null,
  );
  const [headerVisible, setHeaderVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const { isRtl } = useLocale();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await logout();
      navigate("/");
      return;
    }

    navigate("/login");
  };

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      if (window.scrollY <= 10) {
        setHeaderVisible(true);
        return;
      }

      setHeaderVisible(false);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setHeaderVisible(true), 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (menuOpen) setHeaderVisible(true);
  }, [menuOpen]);

  return (
    <header
      className={`public-header fixed top-0 inset-x-0 z-[100] flex h-16 w-full items-center justify-center transition-transform duration-300 ease-in-out sm:h-18 lg:h-20 xl:h-22 ${
        headerVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <style>{`
        .public-header-bar {
          border-radius: 100px;
          margin-top: 30px;
        }
        .public-header-logo-wrap img {
            height: 65px;
      
        }
        .pub-nav-link {
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .public-header {
            min-height: 45px !important;
          }
          .public-header-bar {
            padding: 10px 14px !important;
            margin-left: 12px !important;
            margin-right: 12px !important;
            width: calc(100% - 24px) !important;
          }
          .public-header-logo-wrap img {
            width: 75px !important;
            height: auto !important;
            display: block !important;
          }
          .public-header-actions {
            gap: 14px !important;
          }
          .public-menu-toggle {
            width: 36px !important;
            height: 36px !important;
          }
          .public-mobile-menu {
            padding: 16px 22px 20px !important;
          }
          .public-mobile-menu nav {
            gap: 6px !important;
          }
          .public-mobile-menu .pub-nav-link {
            padding: 8px 4px !important;
            line-height: 1.25 !important;
            margin-top: 0 !important;
          }
          .public-auth-button {
            padding: 13px 18px !important;
          }
        }
        .pub-nav-link {
          border-radius: 6px;
          position: relative;
        }
        .pub-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 12px;
          width: 0;
          height: 1.5px;
          background: currentColor;
          transition: width 0.3s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .pub-nav-link:hover::after {
            width: calc(100% - 24px);
          }
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
        @media (hover: hover) and (pointer: fine) {
          .pub-footer-link:hover::after {
            width: 100%;
          }
        }
        .pub-nav-dropdown {
          opacity: 0;
          visibility: hidden;
          transform: translateY(4px);
          transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s ease;
        }
        .pub-nav-dropdown-wrap:hover .pub-nav-dropdown,
        .pub-nav-dropdown-wrap:focus-within .pub-nav-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
      `}</style>
      <div className="public-header-bar relative mx-auto flex h-full w-full max-w-[1400px] items-center justify-between bg-black/30 backdrop-blur-[2px] px-5 py-2 md:px-10! lg:px-14! xl:px-22!">
        <div className="public-header-logo-wrap flex items-center gap-3">
          <Logo />
        </div>

        <nav className="hidden items-center gap-0 text-[15px] font-medium lg:flex 2xl:gap-6 2xl:text-[17px]">
          {navItems.map((item) => {
            const isActive = isNavItemActive(item, location.pathname);

            if (item.children) {
              return (
                <div
                  key={item.labelKey}
                  className="pub-nav-dropdown-wrap relative inline-block"
                >
                  <button
                    type="button"
                    className={`pub-nav-link inline-flex items-center gap-1 px-3 py-1 ${
                      isActive ? "!text-[#019839]" : "!text-white"
                    }`}
                  >
                    {t(item.labelKey)}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {/* Zero-gap hover bridge: the visual spacing below the button is
                      padding (part of this box), not margin, so the pointer never
                      crosses a dead zone that would drop :hover between the
                      button and the card. */}
                  <div
                    className={`pub-nav-dropdown absolute ${
                      isRtl ? "right-0" : "left-0"
                    } top-full z-10 pt-2`}
                  >
                    <div className="min-w-[180px] rounded-xl bg-white p-2 shadow-lg">
                      {item.children.map((child) => {
                        const isChildActive = isNavItemActive(
                          child,
                          location.pathname,
                        );
                        return (
                          <NavLink
                            key={child.labelKey}
                            to={child.to}
                            className={`block rounded-lg px-3 py-2 text-[14px] font-medium !text-black hover:bg-black/5 ${
                              isChildActive ? "!text-[#019839]" : ""
                            }`}
                          >
                            {t(child.labelKey)}
                          </NavLink>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <NavLink
                key={item.labelKey}
                to={item.to as string}
                className={`pub-nav-link inline-block px-3 py-1 ${
                  isActive ? "!text-[#019839]" : "!text-white"
                }`}
              >
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </nav>

        <div className="public-header-actions flex items-center gap-3 sm:gap-4 lg:gap-5 xl:gap-7">
          <HeaderWeather />
          <LanguageSwitcher className="block" />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={t("public.auth.toggleMenu")}
            onClick={() => {
              setMenuOpen((value) => !value);
              setOpenMobileDropdown(null);
            }}
            className="public-menu-toggle flex h-11 w-11 items-center justify-center rounded-full bg-[#019839] text-white transition-colors hover:bg-black sm:h-11 sm:w-11 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="public-mobile-menu absolute left-0 right-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto border-t border-black/10 bg-white px-5 py-5 shadow-lg sm:px-6 md:px-10 lg:hidden">
            <nav className="flex flex-col gap-2 text-[16px] font-semibold">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item, location.pathname);

                if (item.children) {
                  const isOpen = openMobileDropdown === item.labelKey;
                  return (
                    <div key={item.labelKey} className="flex flex-col">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() =>
                          setOpenMobileDropdown((current) =>
                            current === item.labelKey ? null : item.labelKey,
                          )
                        }
                        className={`pub-nav-link inline-flex items-center gap-1.5 self-start px-4 py-2.5 ${
                          isActive ? "!text-[#019839]" : "!text-black"
                        }`}
                      >
                        {t(item.labelKey)}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div
                          className={`flex flex-col ${isRtl ? "pe-4" : "ps-4"}`}
                        >
                          {item.children.map((child) => {
                            const isChildActive = isNavItemActive(
                              child,
                              location.pathname,
                            );
                            return (
                              <NavLink
                                key={child.labelKey}
                                to={child.to}
                                onClick={() => setMenuOpen(false)}
                                className={`pub-nav-link self-start px-4 py-2 text-[15px] font-medium ${
                                  isChildActive
                                    ? "!text-[#019839]"
                                    : "!text-black/70"
                                }`}
                              >
                                {t(child.labelKey)}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.labelKey}
                    to={item.to as string}
                    onClick={() => setMenuOpen(false)}
                    className={`pub-nav-link self-start px-4 py-2.5 ${
                      isActive ? "!text-[#019839]" : "!text-black"
                    }`}
                  >
                    {t(item.labelKey)}
                  </NavLink>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void handleAuthAction();
                }}
                className={`public-auth-button mt-3 flex items-center gap-3 rounded-md bg-[#019839] py-3.5 ps-7 pe-5 text-[16px] font-bold text-white transition-colors hover:bg-black ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {isAuthenticated ? (
                  <LogOut className="h-5 w-5 shrink-0" />
                ) : (
                  <LogIn className="h-5 w-5 shrink-0" />
                )}
                <span>
                  {isAuthenticated
                    ? t("public.auth.logout")
                    : t("public.auth.login")}
                </span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function StoreButton({ type }: { type: "google" | "apple" }) {
  return <AppStoreButton type={type} />;
}

function PublicFooter() {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailMessageType, setEmailMessageType] = useState<"success" | "error">(
    "success",
  );
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const { t } = useTranslation();

  const handleNewsletterSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setEmailMessageType("error");
      setEmailMessage(t("public.footer.emailRequired"));
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailMessageType("error");
      setEmailMessage(t("public.footer.emailInvalid"));
      return;
    }

    try {
      setIsSubmittingEmail(true);
      setEmailMessage("");
      await subscribeToNewsletter(normalizedEmail, "public-footer");
      setEmail("");
      setEmailMessageType("success");
      setEmailMessage(t("public.footer.thanks"));
    } catch (error) {
      setEmailMessageType("error");
      setEmailMessage(
        error instanceof Error
          ? error.message
          : t("public.footer.subscribeError"),
      );
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  return (
    <>
      <section
        id="start-your-ride"
        className="public-footer-cta relative flex min-h-[360px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-12 text-center text-white sm:min-h-[430px] sm:px-6 sm:py-16 lg:min-h-[502px]"
        style={{
          backgroundImage: " url('/images/footer-image.png')",
        }}
      >
        <div className="relative z-10 w-full max-w-[760px]">
          <h2 className="text-[36px] font-black uppercase leading-none tracking-wide sm:text-[44px] md:text-[56px] lg:text-[64px]">
            {t("public.footer.ctaTitle")}
          </h2>
          <p className="mt-5! text-[16px] leading-6 sm:mt-7! sm:text-[18px] md:text-[22px]">
            {t("public.footer.ctaSubtitle")}
          </p>
          <div className="mt-6! mb-6! flex flex-row flex-wrap items-center justify-center gap-3 sm:mt-7! sm:mb-8! sm:gap-4">
            <StoreButton type="google" />
            <StoreButton type="apple" />
          </div>
        </div>
      </section>

      <footer className="public-footer relative bg-[#EAF4FF] px-4! pt-6! pb-[26px]! sm:px-6! sm:pt-8! md:px-10! lg:px-16! lg:pt-10! xl:px-20! xl:pt-12!">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1fr)_190px_minmax(280px,1fr)] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo compact />
            <p className="mt-5! max-w-[390px] text-[16px] leading-6 text-black sm:mt-8! sm:text-[18px] lg:mt-9!">
              {t("public.footer.brandText")}
            </p>
            <div className="mt-6! flex h-12 w-full max-w-[360px] overflow-hidden rounded-lg bg-[#8DDF93] p-1 max-[380px]:h-auto max-[380px]:flex-col sm:mt-7!">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailMessage) setEmailMessage("");
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void handleNewsletterSubmit();
                  }
                }}
                placeholder={t("public.footer.emailPlaceholder")}
                disabled={isSubmittingEmail}
                aria-label={t("public.footer.emailPlaceholder")}
                className="min-h-10 min-w-0 flex-1 bg-transparent px-4! text-[14px] outline-none placeholder:text-black/45 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => void handleNewsletterSubmit()}
                disabled={isSubmittingEmail}
                className="min-h-10 rounded-md bg-[#019839] px-5! text-[14px] font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 sm:min-w-[103px] sm:px-6!"
              >
                {isSubmittingEmail
                  ? t("public.footer.saving")
                  : t("public.footer.submit")}
              </button>
            </div>
            {emailMessage && (
              <p
                className={`mt-2! max-w-[360px] text-[13px] ${
                  emailMessageType === "success"
                    ? "text-[#019839]"
                    : "text-[#C12D32]"
                }`}
              >
                {emailMessage}
              </p>
            )}

            <div className="mt-6! flex gap-3! sm:mt-7!">
              {socialLinks.map(({ labelKey, href, Icon }) => (
                <a
                  key={labelKey}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t(labelKey)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#019839] text-white transition-colors hover:bg-black"
                >
                  <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[22px] uppercase sm:text-[24px]">
              {t("public.footer.quickLinks")}
            </h3>
            <ul className="!mt-5 space-y-1.5! text-[16px] sm:!mt-7 sm:space-y-2! sm:text-[18px]">
              <li>
                <NavLink to="/aboutus" className="pub-footer-link">
                  {t("public.nav.aboutUs")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/user-tracks" className="pub-footer-link">
                  {t("public.footer.rides")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/user-event" className="pub-footer-link">
                  {t("public.nav.events")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/user-challenges" className="pub-footer-link">
                  {t("public.footer.cyclistsCorner")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/user-news" className="pub-footer-link">
                  {t("public.nav.news")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact-us" className="pub-footer-link">
                  {t("public.footer.contactUs")}
                </NavLink>
              </li>
              <li>
                <NavLink to="/privacy-policy" className="pub-footer-link">
                  {t("public.footer.privacyPolicy")}
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[22px] uppercase sm:text-[24px]">
              {t("public.footer.contactUs")}
            </h3>
            <ul className="mt-5! space-y-3! text-[16px] leading-6 sm:mt-7! sm:space-y-4! sm:text-[18px]">
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href="tel:+97126216594"
                  className="transition-colors hover:text-[#019839]"
                >
                  +971 2 621 6594
                </a>
              </li>
              {/* <li className="flex gap-3"><MessageCircle className="mt-0.5 h-5 w-5 shrink-0" /> <span>144226</span></li> */}
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href="https://maps.app.goo.gl/5dx641z5VDFrqrhH7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#019839]"
                >
                  {t("public.footer.address")}
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

        <div className="mt-5! border-t border-black/15 pt-[20px]! text-center sm:mt-7! md:mt-10!">
          <span className="home-footer-copyright inline-block h-[23px] w-fit max-w-full whitespace-nowrap text-[clamp(14px,4.6vw,18px)] font-normal leading-none text-black">
            {t("public.footer.copyright")}
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
