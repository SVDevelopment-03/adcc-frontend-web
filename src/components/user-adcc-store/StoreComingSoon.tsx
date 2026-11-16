import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Shirt, ShoppingBag, Wrench, Bell, CheckCircle2 } from "lucide-react";
import { AnimatedButton } from "../ui/AnimatedButton";
import { subscribeToNewsletter } from "../../services/newsletterApi";
import { useSiteRouting } from "../../contexts/SiteRoutingContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Club Store page while the store is closed (STORE_LAUNCHED = false):
 * a coming-soon hero, a preview of what the store will sell, and a
 * "notify me" email sign-up (saved as a newsletter subscription).
 */
export default function StoreComingSoon() {
  const { t } = useTranslation();
  const { routing } = useSiteRouting();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value) {
      setStatus("error");
      setMessage(t("public.footer.emailRequired"));
      return;
    }
    if (!EMAIL_RE.test(value)) {
      setStatus("error");
      setMessage(t("public.footer.emailInvalid"));
      return;
    }
    setStatus("saving");
    try {
      await subscribeToNewsletter(value, "store-coming-soon");
      setStatus("done");
      setMessage(t("public.store.comingSoon.notifyThanks"));
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error && err.message ? err.message : t("public.footer.subscribeError"));
    }
  };

  const previews = [
    { icon: Shirt, title: t("public.store.comingSoon.jerseys"), text: t("public.store.comingSoon.jerseysText") },
    { icon: ShoppingBag, title: t("public.store.comingSoon.accessories"), text: t("public.store.comingSoon.accessoriesText") },
    { icon: Wrench, title: t("public.store.comingSoon.gear"), text: t("public.store.comingSoon.gearText") },
  ];

  return (
    <div className="bg-[#eaf4ff] text-black">
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-32 text-center sm:px-6 sm:pt-40 lg:pb-24 lg:pt-48">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#019839] px-5 py-2 text-[14px] font-bold uppercase tracking-wide text-white sm:text-[15px]">
          <Bell className="h-4 w-4" aria-hidden />
          {t("public.store.comingSoon.badge")}
        </span>

        <h1 className="grand-prix-bebas mt-6 text-[56px] uppercase leading-none sm:text-[80px] lg:text-[110px]">
          {t("public.store.comingSoon.title")}
        </h1>
        <p className="mx-auto mt-5 max-w-[640px] text-[17px] leading-7 text-black/70 sm:text-[20px] sm:leading-8">
          {t("public.store.comingSoon.subtitle")}
        </p>

        <div className="mt-12 grid gap-4 text-start sm:grid-cols-3 sm:gap-5">
          {previews.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-2xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#019839] text-white">
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="grand-prix-bebas mt-5 text-[26px] uppercase leading-tight">{title}</h2>
              <p className="mt-1 text-[15px] leading-6 text-black/60">{text}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-12 max-w-[640px] rounded-2xl bg-[#435974] p-6 text-white sm:p-8">
          <h2 className="grand-prix-bebas text-[30px] uppercase leading-tight sm:text-[36px]">
            {t("public.store.comingSoon.notifyTitle")}
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-white/75">{t("public.store.comingSoon.notifyText")}</p>

          {status === "done" ? (
            <p className="mt-6 inline-flex items-center gap-2 text-[16px] font-medium">
              <CheckCircle2 className="h-5 w-5 text-[#7CE0A0]" aria-hidden />
              {message}
            </p>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={t("public.footer.emailPlaceholder")}
                aria-label={t("public.footer.emailPlaceholder")}
                className="h-12 min-w-0 flex-1 rounded-full bg-white px-5 text-[15px] text-black outline-none focus:ring-2 focus:ring-[#019839]"
              />
              <button
                type="submit"
                disabled={status === "saving"}
                className="h-12 shrink-0 rounded-full bg-[#019839] px-7 text-[15px] font-bold text-white transition-colors hover:bg-[#017a2e] disabled:opacity-60"
              >
                {status === "saving" ? t("public.footer.saving") : t("public.store.comingSoon.notifyButton")}
              </button>
            </form>
          )}
          {status === "error" && <p className="mt-3 text-[14px] text-[#FFB4B4]">{message}</p>}
        </div>

        <div className="mt-10 flex justify-center">
          <AnimatedButton to={routing.pages.events}>{t("public.store.comingSoon.exploreEvents")}</AnimatedButton>
        </div>
      </section>
    </div>
  );
}
