import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Twitter,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { HeaderWeather } from "./HeaderWeather";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AppStoreButton } from "./AppStoreButton";
import { useLayoutSection } from "./useLayoutSection";
import { subscribeToNewsletter } from "../../services/newsletterApi";
import { useSiteRouting } from "../../contexts/SiteRoutingContext";
import { resolveRedirect } from "../../services/siteRouting";
import { loadSiteTracking } from "../../utils/injectGtm";

interface PublicLayoutProps {
  children: React.ReactNode;
}

const isExternalLink = (link: string) => /^https?:\/\//i.test(link);

function isLinkActive(link: string, pathname: string): boolean {
  if (!link || isExternalLink(link)) return false;
  if (link === "/") return pathname === "/" || pathname === "/home";
  return pathname === link || pathname.startsWith(`${link}/`);
}

/**
 * Menu links are typed in the dashboard, so they keep a page's old URL after
 * it is changed (Pages → page URL / redirects). Point them straight at where
 * that URL now leads, so a menu click never takes an extra redirect hop.
 */
function useCurrentLink() {
  const { routing } = useSiteRouting();
  const { isAuthenticated } = useAuth();
  return (link: string) => {
    if (!link || isExternalLink(link) || !link.startsWith("/")) return link;
    const cut = link.search(/[?#]/);
    const path = cut === -1 ? link : link.slice(0, cut);
    const rest = cut === -1 ? "" : link.slice(cut);
    const target = resolveRedirect(path, routing, isAuthenticated);
    return target ? `${target}${isExternalLink(target) ? "" : rest}` : link;
  };
}

/** Router link for site paths, new-tab anchor for absolute URLs (both set in the dashboard). */
function SiteLink({
  link,
  className,
  onClick,
  children,
  ...rest
}: {
  link: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  "aria-label"?: string;
}) {
  if (isExternalLink(link)) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <NavLink to={link || "/"} className={className} onClick={onClick} {...rest}>
      {children}
    </NavLink>
  );
}

// Social icons are picked from the link's domain, so admins only enter URLs.
const socialIcons: Array<{ match: RegExp; Icon: LucideIcon }> = [
  { match: /(^|\.)(twitter|x)\.com$/i, Icon: Twitter },
  { match: /(^|\.)(facebook|fb)\.com$/i, Icon: Facebook },
  { match: /(^|\.)instagram\.com$/i, Icon: Instagram },
  { match: /(^|\.)(youtube\.com|youtu\.be)$/i, Icon: Youtube },
  { match: /(^|\.)linkedin\.com$/i, Icon: Linkedin },
];

function getSocialIcon(link: string): LucideIcon {
  try {
    const host = new URL(link).hostname;
    return socialIcons.find(({ match }) => match.test(host))?.Icon ?? Globe;
  } catch {
    return Globe;
  }
}

function Logo({ src, compact = false }: { src: string; compact?: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!src) return null;

  return (
    <img
      src={src}
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
  const [headerVisible, setHeaderVisible] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();
  const { isRtl } = useLocale();
  const header = useLayoutSection("header");
  const currentLink = useCurrentLink();
  const navItems = header
    .list("navItems")
    .map((item) => ({ label: header.pickItem(item, "label"), link: currentLink(item.link ?? "") }))
    .filter((item) => item.label && item.link);

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      await logout();
      navigate("/");
      return;
    }

    navigate("/login");
  };

  // Hide on scroll down, show on scroll up. The previous version hid the
  // header on *every* scroll event and re-showed it 200ms after scrolling
  // paused, shorter than the 300ms slide, so trackpad/wheel/touch scrolling
  // (which fires in bursts) made it flicker in and out, and it also vanished
  // while scrolling up.
  useEffect(() => {
    // Always shown within this distance of the top of the page.
    const TOP_ZONE = 80;
    // Ignore direction changes smaller than this so tiny jitters (trackpad
    // inertia, iOS bounce) don't toggle the header.
    const DELTA = 8;
    let lastY = Math.max(0, window.scrollY);
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      if (y <= TOP_ZONE) {
        setHeaderVisible(true);
        lastY = y;
        return;
      }
      const diff = y - lastY;
      if (Math.abs(diff) < DELTA) return;
      // React skips the re-render when the value is unchanged.
      setHeaderVisible(diff < 0);
      lastY = y;
    };

    const handleScroll = () => {
      // At most one update per frame.
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Close the mobile menu on navigation.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // The header never hides while the mobile menu is open (the menu hangs off it).
  const isHeaderShown = headerVisible || menuOpen;

  return (
    <header
      // Keyboard users tabbing into a hidden header bring it back.
      onFocusCapture={() => setHeaderVisible(true)}
      className={`public-header fixed top-0 inset-x-0 z-[100] flex h-16 w-full items-center justify-center transition-transform duration-300 ease-in-out motion-reduce:transition-none sm:h-18 lg:h-20 xl:h-22 ${
        isHeaderShown ? "translate-y-0" : "-translate-y-[calc(100%+30px)]"
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
      `}</style>
      <div className="public-header-bar relative mx-auto flex h-full w-full max-w-[1400px] items-center justify-between bg-black/30 backdrop-blur-[2px] px-5 py-2 md:px-10! lg:px-14! xl:px-22!">
        <div className="public-header-logo-wrap flex items-center gap-3">
          <Logo src={header.value("logoImage")} />
        </div>

        <nav className="hidden items-center gap-0 text-[15px] font-medium lg:flex 2xl:gap-6 2xl:text-[17px]">
          {navItems.map((item, index) => (
            <SiteLink
              key={`${item.link}-${index}`}
              link={item.link}
              className={`pub-nav-link inline-block px-3 py-1 ${
                isLinkActive(item.link, location.pathname)
                  ? "!text-[#019839]"
                  : "!text-white"
              }`}
            >
              {item.label}
            </SiteLink>
          ))}
        </nav>

        <div className="public-header-actions flex items-center gap-3 sm:gap-4 lg:gap-5 xl:gap-7">
          <HeaderWeather />
          <LanguageSwitcher className="block" />
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={t("public.auth.toggleMenu")}
            onClick={() => setMenuOpen((value) => !value)}
            className="public-menu-toggle flex h-11 w-11 items-center justify-center rounded-full bg-[#019839] text-white transition-colors hover:bg-black sm:h-11 sm:w-11 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="public-mobile-menu absolute left-0 right-0 top-full max-h-[calc(100vh-80px)] overflow-y-auto border-t border-black/10 bg-white px-5 py-5 shadow-lg sm:px-6 md:px-10 lg:hidden">
            <nav className="flex flex-col gap-2 text-[16px] font-semibold">
              {navItems.map((item, index) => (
                <SiteLink
                  key={`${item.link}-${index}`}
                  link={item.link}
                  onClick={() => setMenuOpen(false)}
                  className={`pub-nav-link self-start px-4 py-2.5 ${
                    isLinkActive(item.link, location.pathname)
                      ? "!text-[#019839]"
                      : "!text-black"
                  }`}
                >
                  {item.label}
                </SiteLink>
              ))}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    void handleAuthAction();
                  }}
                  className={`public-auth-button mt-3 flex items-center gap-3 rounded-md bg-[#019839] py-3.5 ps-7 pe-5 text-[16px] font-bold text-white transition-colors hover:bg-black ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>{t("public.auth.logout")}</span>
                </button>
              )}
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
  const cta = useLayoutSection("cta");
  const footer = useLayoutSection("footer");
  const currentLink = useCurrentLink();

  const toLinks = (name: string) =>
    footer
      .list(name)
      .map((item) => ({ label: footer.pickItem(item, "label"), link: currentLink(item.link ?? "") }))
      .filter((item) => item.link);
  const socialLinks = toLinks("socialLinks");
  const quickLinks = toLinks("quickLinks").filter((item) => item.label);
  // Two columns, filled top-down like the original layout.
  const quickLinkColumns = [
    quickLinks.slice(0, Math.ceil(quickLinks.length / 2)),
    quickLinks.slice(Math.ceil(quickLinks.length / 2)),
  ];
  const phone = footer.value("phone").trim();
  const contactEmail = footer.value("email").trim();
  const address = footer.pick("address");
  const addressLink = footer.value("addressLink");
  const ctaBackground = cta.value("backgroundImage");

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
      {cta.visible && (
        <section
          id="start-your-ride"
          className="public-footer-cta relative flex min-h-[360px] items-center justify-center overflow-hidden bg-cover bg-center px-4 py-12 text-center text-white sm:min-h-[430px] sm:px-6 sm:py-16 lg:min-h-[502px]"
          style={{
            backgroundColor: "#435974",
            backgroundImage: ctaBackground
              ? `url(${JSON.stringify(ctaBackground)})`
              : undefined,
          }}
        >
          <div className="relative z-10 w-full max-w-[760px]">
            {/* font-normal: the heading renders in Bebas Kai, which only ships
                a 400 weight, so font-black made the browser fake a heavy bold. */}
            <h2 className="text-[36px] font-normal uppercase leading-none tracking-wide sm:text-[44px] md:text-[56px] lg:text-[64px]">
              {cta.pick("title")}
            </h2>
            <p className="mt-5! text-[16px] leading-6 sm:mt-7! sm:text-[18px] md:text-[22px]">
              {cta.pick("subtitle")}
            </p>
            <div className="mt-6! mb-6! flex flex-row flex-wrap items-center justify-center gap-3 sm:mt-7! sm:mb-8! sm:gap-4">
              <StoreButton type="google" />
              <StoreButton type="apple" />
            </div>
          </div>
        </section>
      )}

      <footer className="public-footer relative bg-[#EAF4FF] px-4! pt-10! pb-10! sm:px-6! sm:pt-8! sm:pb-6.5! md:px-10! lg:px-16! lg:pt-10! xl:px-20! xl:pt-12!">
        <div className="public-footer-inner">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(280px,1fr)_minmax(300px,1.1fr)_minmax(260px,1fr)] lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo src={footer.value("logoImage")} compact />
            <p className="mt-5! max-w-[390px] whitespace-pre-line text-[16px] leading-6 text-black sm:mt-8! sm:text-[18px] lg:mt-9!">
              {footer.pick("brandText")}
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

            {socialLinks.length > 0 && (
              <div className="mt-6! flex flex-wrap gap-3! sm:mt-7!">
                {socialLinks.map(({ label, link }, index) => {
                  const Icon = getSocialIcon(link);
                  return (
                    <a
                      key={`${link}-${index}`}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label || link}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#019839] text-white! transition-colors hover:bg-black"
                    >
                      <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {quickLinks.length > 0 && (
            <div>
              <h3 className="text-[22px] uppercase sm:text-[24px]">
                {footer.pick("quickLinksTitle")}
              </h3>
              <div className="mt-5! grid grid-cols-2 gap-x-6 text-[15px] sm:mt-7! sm:gap-x-10 sm:text-[16px]">
                {quickLinkColumns.map((column, columnIndex) => (
                  <ul key={columnIndex} className="space-y-1.5! sm:space-y-2!">
                    {column.map((item, index) => (
                      <li key={`${item.link}-${index}`}>
                        <SiteLink link={item.link} className="pub-footer-link">
                          {item.label}
                        </SiteLink>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          )}

          {(phone || contactEmail || address) && (
            <div>
              <h3 className="text-[22px] uppercase sm:text-[24px]">
                {footer.pick("contactTitle")}
              </h3>
              <ul className="mt-5! space-y-3! text-[15px] leading-6 sm:mt-7! sm:space-y-4! sm:text-[16px]">
                {phone && (
                  <li className="flex gap-3">
                    <Phone className="mt-0.5 h-5 w-5 shrink-0" />
                    <a
                      href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                      dir="ltr"
                      className="transition-colors hover:text-[#019839]"
                    >
                      {phone}
                    </a>
                  </li>
                )}
                {address && (
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0" />
                    {addressLink ? (
                      <SiteLink
                        link={addressLink}
                        className="whitespace-pre-line transition-colors hover:text-[#019839]"
                      >
                        {address}
                      </SiteLink>
                    ) : (
                      <span className="whitespace-pre-line">{address}</span>
                    )}
                  </li>
                )}
                {contactEmail && (
                  <li className="flex gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0" />
                    <a
                      href={`mailto:${contactEmail}`}
                      className="break-all transition-colors hover:text-[#019839]"
                    >
                      {contactEmail}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-5! border-t border-black/15 pt-[20px]! text-center sm:mt-7! md:mt-10!">
          <span className="home-footer-copyright inline-block h-[23px] w-fit max-w-full whitespace-nowrap text-[clamp(14px,4.6vw,18px)] font-normal leading-none text-black">
            {footer.pick("copyright")}
          </span>
        </div>
        </div>
      </footer>
    </>
  );
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();

  // Google Analytics / Tag Manager and the chat widget: public website only.
  useEffect(() => {
    loadSiteTracking();
  }, []);

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
