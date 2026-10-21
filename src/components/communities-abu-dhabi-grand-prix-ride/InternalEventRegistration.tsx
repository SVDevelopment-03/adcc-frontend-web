import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PublicPageHero, useWordList } from "../public/publicPageHelpers";
import { normalizePhoneForCountry } from "../../utils/phone";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../../constants/countryCodes";
import { NATIONALITY_COUNTRIES } from "../../constants/nationalities";
import { isEventClosed } from "../../utils/eventStatus";
import {
  EVENT_LEAD_CITIES,
  submitEventLead,
  type EventApiResponse,
  type EventLeadCity,
  type EventLeadGender,
} from "../../services/eventsApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The Region/City field (UAE emirates) is only asked for UAE nationals
const UAE_NATIONALITY = "United Arab Emirates";

interface FormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  gender: EventLeadGender | "";
  nationality: string;
  city: EventLeadCity | "";
  emergencyContactName: string;
  emergencyCountryCode: string;
  emergencyContactNumber: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INITIAL: FormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  countryCode: DEFAULT_COUNTRY_CODE.dialCode,
  mobileNumber: "",
  email: "",
  gender: "",
  nationality: UAE_NATIONALITY,
  city: "",
  emergencyContactName: "",
  emergencyCountryCode: DEFAULT_COUNTRY_CODE.dialCode,
  emergencyContactNumber: "",
};

// Same hero/spacing tweaks as the Laffah Ride registration page
const HeroStyles = () => (
  <style>{`
.contact-page-hero-content {
  inset-inline-start: 96px !important;
}
.contact-page.internal-event-page > section:not(.public-hero-bleed) {
  padding-block-start: 48px !important;
}
@media (max-width: 1024px) {
  .contact-page-hero-content { inset-inline-start: 32px !important; }
}
@media (max-width: 768px) {
  .contact-page-hero-content { inset-inline-start: 18px !important; }
  .contact-page.internal-event-page > section:not(.public-hero-bleed) {
    padding-block-start: 32px !important;
  }
}
  `}</style>
);

const todayIso = () => new Date().toISOString().slice(0, 10);

const inputClass = (hasError?: string) =>
  `mt-2 h-10.5 w-full rounded-[10px] border px-4 text-[14px] outline-none bg-transparent ${
    hasError ? "border-red-500" : "border-[#CBCBCB]"
  }`;

/**
 * Registration page of an internal event (/events/:eventId/register), opened
 * by Join Event on its detail page. Same fields as the Laffah Ride form; each
 * submission is stored as a lead of this event.
 */
export default function InternalEventRegistration({
  event,
  heroImage,
}: {
  event: EventApiResponse;
  heroImage: string;
}) {
  const { t } = useTranslation();
  // "Home" comes from the Laffah breadcrumb, which is already translated
  const [homeLabel = "Home"] = useWordList("public.laffahRide.hero.breadcrumb");
  const heroTitleWords = event.title.split(/\s+/).filter(Boolean);
  const heroBreadcrumb = [homeLabel, "/", event.title];
  const eventId = event._id || event.id || event.slug || "";
  const closed = isEventClosed(event);

  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Field labels/messages are shared with the Laffah Ride form
  const tf = (key: string) => t(`public.laffahRide.form.${key}`);

  function validate(vals: FormValues): FormErrors {
    const e: FormErrors = {};
    if (!vals.firstName.trim()) e.firstName = tf("errors.firstNameRequired");
    if (!vals.lastName.trim()) e.lastName = tf("errors.lastNameRequired");
    if (!vals.dateOfBirth) {
      e.dateOfBirth = tf("errors.dateOfBirthRequired");
    } else if (vals.dateOfBirth >= todayIso()) {
      e.dateOfBirth = tf("errors.dateOfBirthInvalid");
    }
    if (!vals.mobileNumber.trim()) {
      e.mobileNumber = tf("errors.mobileRequired");
    } else if (!normalizePhoneForCountry(vals.countryCode, vals.mobileNumber)) {
      e.mobileNumber = tf("errors.mobileInvalid");
    }
    if (!vals.email.trim()) {
      e.email = tf("errors.emailRequired");
    } else if (!EMAIL_RE.test(vals.email.trim())) {
      e.email = tf("errors.emailInvalid");
    }
    if (!vals.gender) e.gender = tf("errors.genderRequired");
    if (!vals.nationality.trim()) e.nationality = tf("errors.nationalityRequired");
    if (vals.nationality === UAE_NATIONALITY && !vals.city) e.city = tf("errors.cityRequired");
    if (!vals.emergencyContactName.trim()) {
      e.emergencyContactName = tf("errors.emergencyNameRequired");
    }
    if (!vals.emergencyContactNumber.trim()) {
      e.emergencyContactNumber = tf("errors.emergencyNumberRequired");
    } else if (!normalizePhoneForCountry(vals.emergencyCountryCode, vals.emergencyContactNumber)) {
      e.emergencyContactNumber = tf("errors.mobileInvalid");
    }
    return e;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
      // Drop a picked city when switching away from UAE
      ...(name === "nationality" && value !== UAE_NATIONALITY ? { city: "" } : {}),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name as keyof FormValues];
      if (name === "nationality" && value !== UAE_NATIONALITY) delete next.city;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(values);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      await submitEventLead(eventId, {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        dateOfBirth: values.dateOfBirth,
        // Validated above; stored as "+971 501234567"
        mobileNumber: normalizePhoneForCountry(values.countryCode, values.mobileNumber)!,
        email: values.email.trim().toLowerCase(),
        gender: values.gender as EventLeadGender,
        nationality: values.nationality.trim(),
        city: values.nationality === UAE_NATIONALITY ? (values.city as EventLeadCity) : undefined,
        emergencyContactName: values.emergencyContactName.trim(),
        emergencyContactNumber: normalizePhoneForCountry(
          values.emergencyCountryCode,
          values.emergencyContactNumber,
        )!,
      });
      toast.success(tf("successMessage"));
      setValues(INITIAL);
      setErrors({});
      setSubmitted(true);
    } catch {
      toast.error(tf("errorMessage"));
    } finally {
      setSubmitting(false);
    }
  }

  const phoneField = (
    codeName: "countryCode" | "emergencyCountryCode",
    numberName: "mobileNumber" | "emergencyContactNumber",
    autoComplete?: string,
  ) => (
    <>
      <div
        className={`mt-2 flex h-10.5 items-center rounded-[10px] border px-2 text-[14px] ${
          errors[numberName] ? "border-red-500" : "border-[#CBCBCB]"
        }`}
      >
        <select
          name={codeName}
          value={values[codeName]}
          onChange={handleChange}
          aria-label={tf("countryCode")}
          className="shrink-0 cursor-pointer bg-transparent py-2 text-[14px] font-bold outline-none"
        >
          {COUNTRY_CODES.map(({ iso2, dialCode, flag }) => (
            <option key={iso2} value={dialCode}>
              {flag} {dialCode}
            </option>
          ))}
        </select>
        <div className="mx-2 h-5 border-l border-[#ccc]" />
        <input
          name={numberName}
          type="tel"
          value={values[numberName]}
          onChange={handleChange}
          placeholder={tf("mobilePlaceholder")}
          autoComplete={autoComplete}
          className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
        />
      </div>
      {errors[numberName] && <p className="mt-1 text-[12px] text-red-500">{errors[numberName]}</p>}
    </>
  );

  return (
    <div className="contact-page internal-event-page min-h-screen bg-[#eaf4ff] text-black">
      <HeroStyles />
      <PublicPageHero
        titleWords={heroTitleWords}
        breadcrumb={heroBreadcrumb}
        backgroundImage={heroImage}
        classPrefix="contact-page"
      />

      <section className="mx-auto max-w-[900px] px-10 pt-6 pb-14 max-md:px-5 max-md:pt-4 max-md:pb-8 max-sm:px-4 max-sm:pt-3 max-sm:pb-6">
        <div className="text-center">
          <h2 className="contact-intro-title text-[60px] leading-none uppercase max-md:text-[44px] max-sm:text-[36px]">
            {t("public.events.detail.internal.introTitle", {
              title: event.title,
              defaultValue: "Register for {{title}}",
            })}
          </h2>
          {event.description && (
            <p className="mt-3 text-[24px] max-md:text-[18px]">{event.description}</p>
          )}
        </div>

        {closed ? (
          <div className="mt-10 rounded-[15px] border border-black/20 p-8 text-center max-md:mt-6">
            <h3 className="text-[28px] uppercase">
              {t("public.events.detail.register.registrationClosed", "Registration closed")}
            </h3>
          </div>
        ) : submitted ? (
          <div className="mt-10 rounded-[15px] border border-black/20 p-8 text-center max-md:mt-6">
            <h3 className="text-[28px] uppercase">{tf("successTitle")}</h3>
            <p className="mt-3 text-[16px] text-black/70">{tf("successMessage")}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 rounded-[15px] border border-black/20 p-6 max-md:mt-6"
          >
            <h3 className="text-[28px] uppercase">{tf("title")}</h3>
            <p className="mt-2 text-[15px] leading-[22px] text-black/70">{tf("description")}</p>

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-[14px]">{tf("firstName")}</span>
                <input
                  name="firstName"
                  value={values.firstName}
                  onChange={handleChange}
                  placeholder={tf("firstNamePlaceholder")}
                  autoComplete="given-name"
                  className={inputClass(errors.firstName)}
                />
                {errors.firstName && <p className="mt-1 text-[12px] text-red-500">{errors.firstName}</p>}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("lastName")}</span>
                <input
                  name="lastName"
                  value={values.lastName}
                  onChange={handleChange}
                  placeholder={tf("lastNamePlaceholder")}
                  autoComplete="family-name"
                  className={inputClass(errors.lastName)}
                />
                {errors.lastName && <p className="mt-1 text-[12px] text-red-500">{errors.lastName}</p>}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("dateOfBirth")}</span>
                <input
                  name="dateOfBirth"
                  type="date"
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  max={todayIso()}
                  autoComplete="bday"
                  className={inputClass(errors.dateOfBirth)}
                />
                {errors.dateOfBirth && <p className="mt-1 text-[12px] text-red-500">{errors.dateOfBirth}</p>}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("mobileNumber")}</span>
                {phoneField("countryCode", "mobileNumber", "tel-national")}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("email")}</span>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder={tf("emailPlaceholder")}
                  autoComplete="email"
                  className={inputClass(errors.email)}
                />
                {errors.email && <p className="mt-1 text-[12px] text-red-500">{errors.email}</p>}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("gender")}</span>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  className={`${inputClass(errors.gender)} cursor-pointer`}
                >
                  <option value="">{tf("genderPlaceholder")}</option>
                  <option value="Male">{tf("genders.male")}</option>
                  <option value="Female">{tf("genders.female")}</option>
                </select>
                {errors.gender && <p className="mt-1 text-[12px] text-red-500">{errors.gender}</p>}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("nationality")}</span>
                <select
                  name="nationality"
                  value={values.nationality}
                  onChange={handleChange}
                  className={`${inputClass(errors.nationality)} cursor-pointer`}
                >
                  <option value="">{tf("nationalityPlaceholder")}</option>
                  {NATIONALITY_COUNTRIES.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.nationality && <p className="mt-1 text-[12px] text-red-500">{errors.nationality}</p>}
              </label>

              {values.nationality === UAE_NATIONALITY && (
              <label className="block">
                <span className="text-[14px]">{tf("city")}</span>
                <select
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  className={`${inputClass(errors.city)} cursor-pointer`}
                >
                  <option value="">{tf("cityPlaceholder")}</option>
                  {EVENT_LEAD_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && <p className="mt-1 text-[12px] text-red-500">{errors.city}</p>}
              </label>
              )}

              <h3 className="mt-2 text-[28px] uppercase md:col-span-2">{tf("emergencyContact")}</h3>

              <label className="block">
                <span className="text-[14px]">{tf("emergencyContactName")}</span>
                <input
                  name="emergencyContactName"
                  value={values.emergencyContactName}
                  onChange={handleChange}
                  placeholder={tf("emergencyContactNamePlaceholder")}
                  className={inputClass(errors.emergencyContactName)}
                />
                {errors.emergencyContactName && (
                  <p className="mt-1 text-[12px] text-red-500">{errors.emergencyContactName}</p>
                )}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("emergencyContactNumber")}</span>
                {phoneField("emergencyCountryCode", "emergencyContactNumber")}
              </label>
            </div>


            <button
              type="submit"
              disabled={submitting}
              className="mt-8 inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#019839] px-6 py-3 text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? tf("submitting") : tf("submit")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
