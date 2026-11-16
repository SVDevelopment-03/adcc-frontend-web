import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useContentSection } from "../../hooks/useContentSection";
import { ContentPageHero } from "../public/contentHelpers";
import api from "../../services/api";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../../constants/countryCodes";
import { AnimatedButton } from "../ui/AnimatedButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9\s\-+()]{6,20}$/;

const INITIAL = {
  firstName: "",
  email: "",
  countryCode: DEFAULT_COUNTRY_CODE.dialCode,
  phone: "",
  message: "",
};

const FontLoader = () => (
  <style>{`
.contact-page-hero-content {
  inset-inline-start: 96px !important;
}
@media (max-width: 1024px) {
  .contact-page-hero-content { inset-inline-start: 32px !important; }
}
@media (max-width: 768px) {
  .contact-page-hero-content { inset-inline-start: 18px !important; }
}
  `}</style>
);

export default function ContactUsPage() {
  const { t } = useTranslation();
  const intro = useContentSection("contact", "intro");
  const details = useContentSection("contact", "details");

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const email = details.value("email");
  const phone = details.value("phone");
  const address = details.pick("address");
  const contactItems = [
    email && {
      Icon: Mail,
      labelKey: "email",
      value: email,
      href: `mailto:${email}`,
    },
    phone && {
      Icon: Phone,
      labelKey: "telephone",
      value: phone,
      href: `tel:${phone.replace(/[\s()-]/g, "")}`,
    },
    address && {
      Icon: MapPin,
      labelKey: "location",
      value: address,
      href: details.value("addressLink") || undefined,
    },
  ].filter(Boolean);

  function validate(vals) {
    const e = {};
    if (!vals.firstName.trim()) e.firstName = t("public.contact.form.errors.firstNameRequired");
    if (!vals.email.trim()) {
      e.email = t("public.contact.form.errors.emailRequired");
    } else if (!EMAIL_RE.test(vals.email.trim())) {
      e.email = t("public.contact.form.errors.emailInvalid");
    }
    if (vals.phone.trim() && !PHONE_RE.test(vals.phone.trim())) {
      e.phone = t("public.contact.form.errors.phoneInvalid");
    }
    if (!vals.message.trim()) e.message = t("public.contact.form.errors.messageRequired");
    return e;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const next = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(next);
    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/v1/contact", {
        firstName: values.firstName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim() ? `${values.countryCode} ${values.phone.trim()}` : undefined,
        message: values.message.trim(),
      });
      toast.success(t("public.contact.form.successMessage"));
      setValues(INITIAL);
      setErrors({});
    } catch {
      toast.error(t("public.contact.form.errorMessage"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <FontLoader />

      <div className="contact-page min-h-screen bg-[#eaf4ff] text-black">
        <ContentPageHero page="contact" classPrefix="contact-page" />

        {/* Vertical/side padding comes from .contact-content in styles/public-spacing.css. */}
        <section className="contact-content mx-auto max-w-[1200px]">
          {intro.visible && (
            <div className="text-center">
              {/* leading-none: the default line-height added empty space above
                  the title, making the top gap look bigger than the bottom. */}
              <h2 className="contact-intro-title text-[60px] uppercase leading-none max-md:text-[44px] max-sm:text-[36px]">
                {intro.pick("title")}
              </h2>
              <p className="mt-4 text-[24px] max-md:text-[18px]">{intro.pick("body")}</p>
            </div>
          )}

          <div className="mt-10 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 max-md:mt-6 max-sm:mt-4">
            <div className="flex h-full flex-col">
              {intro.visible && intro.value("image") && (
                <img
                  src={intro.value("image")}
                  alt={t("public.contact.imageAlt")}
                  className="h-100 w-full rounded-[15px] object-cover max-md:h-80 max-sm:h-55"
                />
              )}

              <div className="mt-8 flex flex-1 flex-col justify-center rounded-[15px] border border-black/20 p-5">
                <div className="space-y-4">
                  {contactItems.map(({ Icon, labelKey, value, href }) => (
                    <a
                      key={labelKey}
                      href={href}
                      target={labelKey === "location" && href ? "_blank" : undefined}
                      rel={labelKey === "location" && href ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-4 transition-opacity hover:opacity-80"
                    >
                      <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#019839] text-white">
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-[14px] text-black/50">
                          {t(`public.contact.info.${labelKey}`)}
                        </p>
                        <h3 className={`text-[18px] ${labelKey === "email" ? "lowercase" : "uppercase"}`}>
                          {value}
                        </h3>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex h-full flex-col rounded-[15px] border border-black/20 p-6">
              <h3 className="text-[28px] uppercase">
                {t("public.contact.form.title")}
              </h3>
              <p className="mt-2 max-w-[495px] text-[15px] leading-[22px] text-black/70">
                {t("public.contact.form.description")}
              </p>

              <div className="mt-6 flex flex-1 flex-col space-y-5">
                <label className="block">
                  <span className="text-[14px]">
                    {t("public.contact.form.firstName")}
                  </span>
                  <input
                    name="firstName"
                    value={values.firstName}
                    onChange={handleChange}
                    placeholder={t("public.contact.form.firstNamePlaceholder")}
                    className={`mt-2 h-10.5 w-full rounded-[10px] border px-4 text-[14px] outline-none bg-transparent ${errors.firstName ? "border-red-500" : "border-[#CBCBCB]"}`}
                  />
                  {errors.firstName && <p className="mt-1 text-[12px] text-red-500">{errors.firstName}</p>}
                </label>

                <label className="block">
                  <span className="text-[14px]">
                    {t("public.contact.form.email")}
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder={t("public.contact.form.emailPlaceholder")}
                    className={`mt-2 h-10.5 w-full rounded-[10px] border px-4 text-[14px] outline-none bg-transparent ${errors.email ? "border-red-500" : "border-[#CBCBCB]"}`}
                  />
                  {errors.email && <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>}
                </label>

                <label className="block">
                  <span className="text-[14px]">
                    {t("public.contact.form.phone")}
                  </span>
                  <div className={`mt-2 flex h-10.5 items-center rounded-[10px] border px-2 text-[14px] ${errors.phone ? "border-red-500" : "border-[#CBCBCB]"}`}>
                    <select
                      name="countryCode"
                      value={values.countryCode}
                      onChange={handleChange}
                      aria-label={t("public.contact.form.countryCode")}
                      className="shrink-0 cursor-pointer appearance-none bg-transparent bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%23666%22><path d=%22M5.5 7.5l4.5 4.5 4.5-4.5%22 stroke=%22%23666%22 stroke-width=%221.5%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-size-[14px] bg-position-[right_2px_center] bg-no-repeat py-2 pl-2 pr-5 text-[14px] font-bold outline-none"
                    >
                      {COUNTRY_CODES.map(({ iso2, dialCode, flag }) => (
                        <option key={iso2} value={dialCode}>
                          {flag} {dialCode}
                        </option>
                      ))}
                    </select>
                    <div className="mx-2 h-5 border-l border-[#ccc]" />
                    <input
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      placeholder={t("public.contact.form.phonePlaceholder")}
                      className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>}
                </label>

                <label className="flex flex-1 flex-col">
                  <span className="text-[14px]">
                    {t("public.contact.form.message")}
                  </span>
                  <textarea
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    placeholder={t("public.contact.form.messagePlaceholder")}
                    className={`mt-2 min-h-22.5 w-full flex-1 rounded-[10px] border px-4 py-3 text-[14px] outline-none bg-transparent resize-none ${errors.message ? "border-red-500" : "border-[#CBCBCB]"}`}
                  />
                  {errors.message && <p className="mt-1 text-[12px] text-red-500">{errors.message}</p>}
                </label>

                <AnimatedButton
                  type="submit"
                  disabled={submitting}
                  className="w-fit self-start"
                >
                  {submitting ? t("public.contact.form.submitting") : t("public.contact.form.submit")}
                </AnimatedButton>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
