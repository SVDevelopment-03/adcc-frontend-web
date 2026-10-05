import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { APP_COMING_SOON_EVENT } from "../../utils/appStoreLink";

/** Popup shown when a Google Play / App Store button is clicked. */
export function ComingSoonPopup() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(APP_COMING_SOON_EVENT, show);
    return () => window.removeEventListener(APP_COMING_SOON_EVENT, show);
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        {/* Built on the Radix primitives rather than ui/dialog so the popup can
          sit above the public header (z-[100]). */}
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[1000] bg-black/60" />
        {/* Portrait card (428×640) below md, landscape card (1166×665) from md up.
          Sizes inside use cqw so everything scales with the card itself. */}
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[45%] md:top-[50%] z-[1000] aspect-[428/640] max-h-[calc(100dvh-2rem)] w-full max-w-[min(428px,calc(100%-2rem))] translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-xl bg-[#c9d9ec] bg-cover bg-center shadow-lg duration-200 md:aspect-[1166/665] md:max-w-[min(850px,calc(100%-2rem),calc((100dvh-2rem)*1.753))]"
          style={{
            backgroundImage: "url('/images/bg1.png')",
            containerType: "inline-size",
          }}
        >
          <DialogPrimitive.Close
            aria-label={t("public.footer.comingSoonClose")}
            className="absolute end-3 top-3 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black text-white transition-opacity hover:opacity-80 md:end-[5.1cqw] md:top-[3.2cqw] md:h-[3.8cqw] md:w-[3.8cqw]"
          >
            <X
              className="h-4 w-4 md:h-[2.2cqw] md:w-[2.2cqw]"
              strokeWidth={3}
            />
          </DialogPrimitive.Close>

          <div className="flex h-full flex-col items-center md:block">
            <div className="flex flex-col items-center gap-[6cqw] px-[6cqw] pt-[10cqw] text-center md:gap-[4.5cqw] md:absolute md:inset-y-0 md:start-[6.3cqw] md:w-[46cqw] md:items-start md:justify-center md:px-0 md:pb-[5cqw] md:pt-0 md:text-start">
              <img
                src="/images/darraja.png"
                alt="Darraja"
                className="w-[48cqw] md:w-[22cqw]"
              />
              <DialogPrimitive.Title
                className="whitespace-nowrap text-[10.5cqw] font-normal uppercase leading-[1.08] text-[#0c0c4a] md:text-[6.8cqw]"
                style={{ fontFamily: "'Bebas Kai',sans-serif" }}
              >
                <span className="block">
                  {t("public.footer.comingSoonLine1")}
                </span>
                <span className="block">
                  {t("public.footer.comingSoonLine2")}
                </span>
              </DialogPrimitive.Title>
            </div>

            <div className="min-h-0 w-full flex-1 pt-[7cqw] md:absolute md:bottom-0 md:end-[4cqw] md:w-[50cqw] md:pt-0">
              <img
                src="/images/hand-app.png"
                alt=""
                className="h-full w-full object-contain object-bottom md:h-auto"
              />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
