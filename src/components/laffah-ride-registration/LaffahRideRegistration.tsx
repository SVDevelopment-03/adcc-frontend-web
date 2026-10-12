import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PublicPageHero, useWordList } from "../public/publicPageHelpers";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "../../constants/countryCodes";
import {
  LAFFAH_RIDE_LOCATIONS,
  submitLaffahRideRegistration,
  type LaffahRideGender,
  type LaffahRideLocation,
} from "../../services/laffahRideRegistrationsApi";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9\s\-+()]{6,20}$/;

const NATIONALITY_OPTIONS = COUNTRY_CODES.map((country) => country.name).sort((a, b) =>
  a.localeCompare(b),
);

interface FormValues {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  countryCode: string;
  mobileNumber: string;
  email: string;
  gender: LaffahRideGender | "";
  nationality: string;
  city: string;
  raceLocations: LaffahRideLocation[];
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
  nationality: "",
  city: "",
  raceLocations: [],
};

const HeroStyles = () => (
  <style>{`
.contact-page-hero-content {
  inset-inline-start: 96px !important;
}
.contact-page.laffah-ride-page > section:not(.public-hero-bleed) {
  padding-block-start: 48px !important;
}
@media (max-width: 1024px) {
  .contact-page-hero-content { inset-inline-start: 32px !important; }
}
@media (max-width: 768px) {
  .contact-page-hero-content { inset-inline-start: 18px !important; }
  .contact-page.laffah-ride-page > section:not(.public-hero-bleed) {
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

export default function LaffahRideRegistrationPage() {
  const { t } = useTranslation();
  const heroTitleWords = useWordList("public.laffahRide.hero.titleWords");
  const heroBreadcrumb = useWordList("public.laffahRide.hero.breadcrumb");

  const [values, setValues] = useState<FormValues>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
    } else if (!PHONE_RE.test(vals.mobileNumber.trim())) {
      e.mobileNumber = tf("errors.mobileInvalid");
    }
    if (!vals.email.trim()) {
      e.email = tf("errors.emailRequired");
    } else if (!EMAIL_RE.test(vals.email.trim())) {
      e.email = tf("errors.emailInvalid");
    }
    if (!vals.gender) e.gender = tf("errors.genderRequired");
    if (!vals.nationality.trim()) e.nationality = tf("errors.nationalityRequired");
    if (!vals.city.trim()) e.city = tf("errors.cityRequired");
    if (vals.raceLocations.length === 0) e.raceLocations = tf("errors.raceLocationsRequired");
    return e;
  }

  function clearError(name: keyof FormValues) {
    if (!errors[name]) return;
    const nextErrors = { ...errors };
    delete nextErrors[name];
    setErrors(nextErrors);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    clearError(name as keyof FormValues);
  }

  function toggleLocation(location: LaffahRideLocation) {
    setValues((prev) => ({
      ...prev,
      raceLocations: prev.raceLocations.includes(location)
        ? prev.raceLocations.filter((item) => item !== location)
        : [...prev.raceLocations, location],
    }));
    clearError("raceLocations");
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
      await submitLaffahRideRegistration({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        dateOfBirth: values.dateOfBirth,
        mobileNumber: `${values.countryCode} ${values.mobileNumber.trim()}`,
        email: values.email.trim().toLowerCase(),
        gender: values.gender as LaffahRideGender,
        nationality: values.nationality.trim(),
        city: values.city.trim(),
        raceLocations: values.raceLocations,
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

  return (
    <div className="contact-page laffah-ride-page min-h-screen bg-[#eaf4ff] text-black">
      <HeroStyles />
      <PublicPageHero
        titleWords={heroTitleWords}
        breadcrumb={heroBreadcrumb}
        backgroundImage="/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png"
        classPrefix="contact-page"
      />

      <section className="mx-auto max-w-[900px] px-10 pt-6 pb-14 max-md:px-5 max-md:pt-4 max-md:pb-8 max-sm:px-4 max-sm:pt-3 max-sm:pb-6">
        <div className="text-center">
          <h2 className="contact-intro-title text-[60px] leading-none uppercase max-md:text-[44px] max-sm:text-[36px]">
            {t("public.laffahRide.intro.title")}
          </h2>
          <p className="mt-3 text-[24px] max-md:text-[18px]">{t("public.laffahRide.intro.body")}</p>
        </div>

        {submitted ? (
          <div className="mt-10 rounded-[15px] border border-black/20 p-8 text-center max-md:mt-6">
            <h3 className="text-[28px] uppercase">{tf("successTitle")}</h3>
            <p className="mt-3 text-[16px] text-black/70">{tf("successMessage")}</p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="mt-6 inline-flex cursor-pointer items-center rounded-full bg-[#019839] px-6 py-3 text-[16px] font-bold text-white"
            >
              {tf("registerAnother")}
            </button>
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
                <div
                  className={`mt-2 flex h-10.5 items-center rounded-[10px] border px-2 text-[14px] ${
                    errors.mobileNumber ? "border-red-500" : "border-[#CBCBCB]"
                  }`}
                >
                  <select
                    name="countryCode"
                    value={values.countryCode}
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
                    name="mobileNumber"
                    type="tel"
                    value={values.mobileNumber}
                    onChange={handleChange}
                    placeholder={tf("mobilePlaceholder")}
                    autoComplete="tel-national"
                    className="min-w-0 flex-1 bg-transparent text-[14px] outline-none"
                  />
                </div>
                {errors.mobileNumber && <p className="mt-1 text-[12px] text-red-500">{errors.mobileNumber}</p>}
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
                <input
                  name="nationality"
                  list="laffah-ride-nationalities"
                  value={values.nationality}
                  onChange={handleChange}
                  placeholder={tf("nationalityPlaceholder")}
                  autoComplete="country-name"
                  className={inputClass(errors.nationality)}
                />
                <datalist id="laffah-ride-nationalities">
                  {NATIONALITY_OPTIONS.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
                {errors.nationality && <p className="mt-1 text-[12px] text-red-500">{errors.nationality}</p>}
              </label>

              <label className="block">
                <span className="text-[14px]">{tf("city")}</span>
                <input
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  placeholder={tf("cityPlaceholder")}
                  autoComplete="address-level2"
                  className={inputClass(errors.city)}
                />
                {errors.city && <p className="mt-1 text-[12px] text-red-500">{errors.city}</p>}
              </label>
            </div>

            <fieldset className="mt-6">
              <legend className="text-[14px]">{tf("raceLocations")}</legend>
              <p className="mt-1 text-[12px] text-black/50">{tf("raceLocationsHint")}</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {LAFFAH_RIDE_LOCATIONS.map((location) => {
                  const checked = values.raceLocations.includes(location);
                  return (
                    <label
                      key={location}
                      className={`flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 text-[14px] transition-colors ${
                        checked ? "border-[#019839] bg-[#019839]/10" : "border-[#CBCBCB]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocation(location)}
                        className="h-4 w-4 accent-[#019839]"
                      />
                      {t(`public.laffahRide.locations.${location}`, location)}
                    </label>
                  );
                })}
              </div>
              {errors.raceLocations && <p className="mt-2 text-[12px] text-red-500">{errors.raceLocations}</p>}
            </fieldset>

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
