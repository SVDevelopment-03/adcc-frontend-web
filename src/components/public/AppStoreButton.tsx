import { useTranslation } from "react-i18next";
import { APP_STORE_LINKS } from "../../config/appStoreLinks";

export function AppStoreButton({ type }: { type: "google" | "apple" }) {
  const { t } = useTranslation();
  const href =
    type === "google" ? APP_STORE_LINKS.googlePlay : APP_STORE_LINKS.appStore;

  return (
    <a
      href={href}
      className="inline-flex h-[53px] w-[150px] flex-none items-center justify-center gap-[10px] rounded-[100px] bg-white px-[26px] py-0 text-black no-underline shadow-lg transition-opacity hover:opacity-90 sm:h-[57px] sm:w-[180px] sm:px-[20px]"
    >
      <img
        src={type === "google" ? "/img/google.png" : "/img/apple.png"}
        alt={
          type === "google"
            ? t("public.footer.googlePlay")
            : t("public.footer.appStore")
        }
        className="h-[27px] w-[27px] shrink-0 object-contain sm:h-[31px] sm:w-[29px]"
      />

      <span className="flex min-w-0 flex-none flex-col items-start justify-center text-start">
        <span className="font-satoshi block whitespace-nowrap text-[8px] font-semibold uppercase leading-[1.05] text-black/60 sm:text-[9px]">
          {type === "google"
            ? t("public.footer.getItOn")
            : t("public.footer.downloadOn")}
        </span>
        <span className="font-satoshi block whitespace-nowrap text-[15px] font-bold leading-[1.1] text-black sm:text-[16px]">
          {type === "google"
            ? t("public.footer.googlePlay")
            : t("public.footer.appStore")}
        </span>
      </span>
    </a>
  );
}
