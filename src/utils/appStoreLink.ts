import { APP_STORE_LINKS } from "../config/appStoreLinks";

/**
 * Picks the right app-store link for the visitor's device: Apple App Store
 * for iPhone/iPad/Mac, Google Play for everything else (Android, Windows,
 * Linux, unknown UAs).
 */
export function getAppStoreLink(): string {
  if (typeof navigator === "undefined") return APP_STORE_LINKS.googlePlay;

  const ua = navigator.userAgent || "";
  const platform =
    (navigator as any).userAgentData?.platform || navigator.platform || "";

  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ reports itself as "MacIntel" but exposes touch support.
    (platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMac = !isIOS && /Macintosh|Mac OS X/i.test(ua);

  return isIOS || isMac ? APP_STORE_LINKS.appStore : APP_STORE_LINKS.googlePlay;
}

/** Opens the platform-appropriate app-store link in a new tab. */
export function openAppStoreLink() {
  window.open(getAppStoreLink(), "_blank", "noopener,noreferrer");
}

export const APP_COMING_SOON_EVENT = "adcc:app-coming-soon";

/**
 * Opens the "Coming soon" popup (ComingSoonPopup, mounted once in App.tsx).
 * Used by every Google Play / App Store button while the apps are unreleased.
 */
export function showAppComingSoon() {
  window.dispatchEvent(new Event(APP_COMING_SOON_EVENT));
}

/**
 * Scrolls to the shared "Start Your Ride Today" app-download section that
 * PublicLayout renders at the bottom of every public page (see
 * PublicLayout.tsx's `id="start-your-ride"`), instead of opening a store
 * link directly — lets the visitor pick Google Play or App Store themselves.
 */
export function scrollToAppListing() {
  document
    .getElementById("start-your-ride")
    ?.scrollIntoView({ behavior: "smooth" });
}
