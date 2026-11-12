import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AnimatedButton } from "../ui/AnimatedButton";

/** Public "page not found": unknown URLs and unpublished/deleted custom pages. */
export function PublicNotFound() {
  const { t } = useTranslation();

  useEffect(() => {
    const previous = document.title;
    document.title = `404 · ${t("common.pageNotFound", "Page not found")}`;
    return () => {
      document.title = previous;
    };
  }, [t]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[#eaf4ff] px-4 pt-32 pb-16 text-center">
      <div>
        <h1 className="bebas text-[64px] uppercase leading-none">404</h1>
        <p className="mt-3 text-[22px] font-medium">{t("common.pageNotFound", "Page not found")}</p>
        <p className="mt-2 text-[16px] text-black/60">
          {t("common.pageNotFoundText", "The page you are looking for has moved or no longer exists.")}
        </p>
        <AnimatedButton to="/" className="mt-6">
          {t("common.backHome", "Back to home")}
        </AnimatedButton>
      </div>
    </div>
  );
}

export default PublicNotFound;
