import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PublicPageHero, useWordList } from "../public/publicPageHelpers";
import api from "../../services/api";

const CONTACT_DETAILS = {
  email: "INFO@ADCYCLINGCLUB.AE",
  phone: "+971 2 654 5645",
  location: "ABU DHABI, YAS ISLAND, YAS MARINA CIRCUIT, VILLA 18.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9\s\-+()]{6,20}$/;

const INITIAL = { firstName: "", email: "", phone: "", message: "", privacy: false };

const FontLoader = () => (
  <style>{`
.contact-page-hero{
padding-inline-start: 86px;
}
@media (max-width: 768px) {
  .contact-page-hero { padding-inline-start: 18px !important; }
}
@media (max-width: 640px) {
  .contact-page-hero { padding-inline-start: 16px !important; }
}
  `}</style>
);

export default function ContactUsPage() {
  const { t } = useTranslation();
  const heroTitleWords = useWordList("public.contact.hero.titleWords");
  const heroBreadcrumb = useWordList("public.contact.hero.breadcrumb");

  const [values, setValues] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const contactItems = [
    { Icon: Mail, labelKey: "email", value: CONTACT_DETAILS.email },
    { Icon: Phone, labelKey: "telephone", value: CONTACT_DETAILS.phone },
    { Icon: MapPin, labelKey: "location", value: CONTACT_DETAILS.location },
  ];

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
    if (!vals.privacy) e.privacy = t("public.contact.form.errors.privacyRequired");
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
        phone: values.phone.trim() || undefined,
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
        <PublicPageHero
          titleWords={heroTitleWords}
          breadcrumb={heroBreadcrumb}
          backgroundImage="/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png"
          classPrefix="contact-page"
        />

        <section className="mx-auto max-w-[1268px] px-10 py-28 max-md:px-5 max-md:py-16 max-sm:px-4 max-sm:py-12">
          <div className="text-center">
            <h2 className="contact-intro-title text-[60px] uppercase max-md:text-[44px] max-sm:text-[36px]">
              {t("public.contact.intro.title")}
            </h2>
            <p className="mt-4 text-[24px] max-md:text-[18px]">{t("public.contact.intro.body")}</p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2 max-md:mt-12 max-sm:mt-8">
            <div>
              <img
                src="/img/490796704_1417267435941639_5633845168834004037_n. 1 (1).png"
                alt={t("public.contact.imageAlt")}
                className="h-[562px] w-full rounded-[15px] object-cover max-md:h-[380px] max-sm:h-[260px]"
              />

              <div className="mt-8 rounded-[15px] border border-black/20 p-5">
                <div className="space-y-4">
                  {contactItems.map(({ Icon, labelKey, value }) => (
                    <div key={labelKey} className="flex items-center gap-4">
                      <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#019839] text-white">
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <div>
                        <p className="text-[14px] text-black/50">
                          {t(`public.contact.info.${labelKey}`)}
                        </p>
                        <h3 className="text-[18px] uppercase">{value}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="rounded-[15px] border border-black/20 p-6">
              <h3 className="text-[28px] uppercase">
                {t("public.contact.form.title")}
              </h3>
              <p className="mt-2 max-w-[495px] text-[15px] leading-[22px] text-black/70">
                {t("public.contact.form.description")}
              </p>

              <div className="mt-6 space-y-5">
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
                  <div className={`mt-2 flex h-10.5 items-center rounded-[10px] border px-4 text-[14px] ${errors.phone ? "border-red-500" : "border-[#CBCBCB]"}`}>
                    <span className="font-bold shrink-0">🇦🇪 +971</span>
                    <div className="mx-3 h-5 border-l border-[#ccc]" />
                    <input
                      name="phone"
                      value={values.phone}
                      onChange={handleChange}
                      placeholder={t("public.contact.form.phonePlaceholder")}
                      className="flex-1 bg-transparent text-[14px] outline-none"
                    />
                  </div>
                  {errors.phone && <p className="mt-1 text-[12px] text-red-500">{errors.phone}</p>}
                </label>

                <label className="block">
                  <span className="text-[14px]">
                    {t("public.contact.form.message")}
                  </span>
                  <textarea
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    placeholder={t("public.contact.form.messagePlaceholder")}
                    className={`mt-2 h-22.5 w-full rounded-[10px] border px-4 py-3 text-[14px] outline-none bg-transparent resize-none ${errors.message ? "border-red-500" : "border-[#CBCBCB]"}`}
                  />
                  {errors.message && <p className="mt-1 text-[12px] text-red-500">{errors.message}</p>}
                </label>

                <div>
                  <label className="flex items-center gap-2 text-[13px] text-[#888] cursor-pointer">
                    <input
                      type="checkbox"
                      name="privacy"
                      checked={values.privacy}
                      onChange={handleChange}
                      className="h-5 w-5 cursor-pointer"
                    />
                    {t("public.contact.form.privacy")}
                  </label>
                  {errors.privacy && <p className="mt-1 text-[12px] text-red-500">{errors.privacy}</p>}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#019839] px-6 py-3 text-[15px] font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? t("public.contact.form.submitting") : t("public.contact.form.submit")}
                  <svg width="22" height="21" viewBox="0 0 22 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M0.0706041 0.991062C-0.0968 0.65028 0.0437048 0.2383 0.384531 0.0708523C0.57024 -0.0203685 0.7871 -0.0231189 0.975044 0.0633755L21.5999 9.5587C21.9448 9.71751 22.0956 10.1258 21.9368 10.4707C21.8683 10.6196 21.7487 10.7391 21.5999 10.8077L0.975042 20.303C0.630135 20.4618 0.221851 20.311 0.0630398 19.9661C-0.0235404 19.778 -0.0207919 19.561 0.0705148 19.3753L4.58959 10.1832L0.0706041 0.991062Z" fill="currentColor"/></svg>
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
