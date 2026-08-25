import React, { useState, useEffect, useCallback } from "react";
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
  { labelKey: "public.nav.home", to: "/home", match: ["/home"] },
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
      onClick={() => navigate("/home")}
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
      navigate("/home");
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

      <footer className="public-footer relative bg-[#EAF4FF] px-4! pt-12! pb-[26px]! sm:px-6! sm:pt-16! md:px-10! lg:px-16! lg:pt-20! xl:px-20! xl:pt-25!">
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
            <ul className="!mt-5 space-y-3! text-[16px] sm:!mt-7 sm:space-y-4! sm:text-[18px]">
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

        <div className="mt-10! border-t border-black/15 pt-[20px]! text-center sm:mt-14! md:mt-20!">
          <span className="home-footer-copyright inline-block h-[23px] w-fit max-w-full whitespace-nowrap text-[clamp(14px,4.6vw,18px)] font-normal leading-none text-black">
            {t("public.footer.copyright")}
          </span>
        </div>
      </footer>
    </>
  );
}

function ScrollToTopButton() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("public.layout.scrollToTop")}
      className="fixed bottom-8 end-8 z-[200] flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[#019839] text-white shadow-lg transition-all duration-300 hover:bg-black hover:scale-110 focus:outline-none"
    >
      <svg
        width="33"
        height="27"
        viewBox="0 0 33 27"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_1130_3405"
          style={{ maskType: "alpha" }}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="33"
          height="27"
        >
          <rect width="32.8909" height="27" fill="url(#pattern0_1130_3405)" />
        </mask>
        <g mask="url(#mask0_1130_3405)">
          <rect width="32.8909" height="27" fill="white" />
        </g>
        <defs>
          <pattern
            id="pattern0_1130_3405"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <use
              href="#image0_1130_3405"
              transform="matrix(0.00671642 0 0 0.00818182 -0.671642 0)"
            />
          </pattern>
          <image
            id="image0_1130_3405"
            width="400"
            height="168"
            preserveAspectRatio="none"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAACoCAYAAADO4bi4AAAACXBIWXMAAC4jAAAuIwF4pT92AAAF+mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTAyLTE1VDIxOjE5OjI5KzA0OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMy0wMi0xNVQyMToyNTowNCswNDowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wMi0xNVQyMToyNTowNCswNDowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1MTRmMzM0Zi00ZDFj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"
          />
        </defs>
      </svg>
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
