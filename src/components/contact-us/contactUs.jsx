import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PublicPageHero, useWordList } from "../public/publicPageHelpers";

const CONTACT_DETAILS = {
  email: "INFO@ADCYCLINGCLUB.AE",
  phone: "+971 2 654 5645",
  location: "ABU DHABI, YAS ISLAND, YAS MARINA CIRCUIT, VILLA 18.",
};

export default function ContactUsPage() {
  const { t } = useTranslation();
  const heroTitleWords = useWordList("public.contact.hero.titleWords");
  const heroBreadcrumb = useWordList("public.contact.hero.breadcrumb");

  const contactItems = [
    { Icon: Mail, labelKey: "email", value: CONTACT_DETAILS.email },
    { Icon: Phone, labelKey: "telephone", value: CONTACT_DETAILS.phone },
    { Icon: MapPin, labelKey: "location", value: CONTACT_DETAILS.location },
  ];

  return (
    <div className="contact-page min-h-screen bg-[#eaf4ff] text-black">
      <PublicPageHero
        titleWords={heroTitleWords}
        breadcrumb={heroBreadcrumb}
        backgroundImage="/img/paolo-candelo-8tXukRrs7yk-unsplash 1.png"
        classPrefix="contact-page"
      />

      <section className="mx-auto max-w-[1268px] px-10 py-28">
        <div className="text-center">
          <h2 className="contact-intro-title text-[60px] font-black uppercase">{t("public.contact.intro.title")}</h2>
          <p className="mt-4 text-[24px]">{t("public.contact.intro.body")}</p>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <img
              src="/img/490796704_1417267435941639_5633845168834004037_n. 1 (1).png"
              alt={t("public.contact.imageAlt")}
              className="h-[562px] w-full rounded-[15px] object-cover"
            />

            <div className="mt-8 rounded-[15px] border border-black/20 p-8">
              <div className="space-y-8">
                {contactItems.map(({ Icon, labelKey, value }) => (
                  <div key={labelKey} className="flex items-center gap-6">
                    <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#019839] text-white">
                      <Icon size={34} />
                    </span>
                    <div>
                      <p className="text-[14px] text-black/50">
                        {t(`public.contact.info.${labelKey}`)}
                      </p>
                      <h3 className="text-[18px] font-black uppercase">{value}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form className="rounded-[15px] border border-black/20 p-10">
            <h3 className="text-[40px] font-black uppercase">{t("public.contact.form.title")}</h3>
            <p className="mt-3 max-w-[495px] text-[20px] leading-[25px] text-black/70">
              {t("public.contact.form.description")}
            </p>

            <div className="mt-12 space-y-8">
              <label className="block">
                <span className="text-[18px]">{t("public.contact.form.firstName")}</span>
                <input
                  placeholder={t("public.contact.form.firstNamePlaceholder")}
                  className="mt-3 h-[50px] w-full rounded-[10px] border border-[#CBCBCB] bg-transparent px-5 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[18px]">{t("public.contact.form.email")}</span>
                <input
                  placeholder={t("public.contact.form.emailPlaceholder")}
                  className="mt-3 h-[50px] w-full rounded-[10px] border border-[#CBCBCB] bg-transparent px-5 outline-none"
                />
              </label>

              <label className="block">
                <span className="text-[18px]">{t("public.contact.form.phone")}</span>
                <div className="mt-3 flex h-[50px] items-center rounded-[10px] border border-[#CBCBCB] px-4">
                  <span className="font-bold">🇦🇪 {t("public.contact.form.phonePlaceholder")}</span>
                  <div className="mx-4 h-6 border-l border-[#ccc]" />
                  <input
                    placeholder={t("public.contact.form.phonePlaceholder")}
                    className="flex-1 bg-transparent outline-none"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-[18px]">{t("public.contact.form.message")}</span>
                <textarea
                  placeholder={t("public.contact.form.messagePlaceholder")}
                  className="mt-3 h-[100px] w-full rounded-[10px] border border-[#CBCBCB] bg-transparent px-5 py-4 outline-none"
                />
              </label>

              <label className="flex items-center gap-3 text-[#888]">
                <input type="checkbox" className="h-[27px] w-[27px]" />
                {t("public.contact.form.privacy")}
              </label>

              <button
                type="button"
                className="inline-flex items-center gap-3 rounded-full bg-[#019839] px-8 py-4 text-[18px] font-bold text-white"
              >
                {t("public.contact.form.submit")} <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
