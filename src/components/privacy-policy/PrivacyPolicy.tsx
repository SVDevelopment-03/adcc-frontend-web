import { useTranslation } from "react-i18next";
import { useLocale } from "../../contexts/LocaleContext";
import {
  PRIVACY_POLICY_EN,
  PRIVACY_POLICY_AR,
  type PrivacyBlock,
} from "../../data/privacyPolicyContent";

function isListBlock(block: PrivacyBlock): block is string[] {
  return Array.isArray(block);
}

function isSubheadingBlock(block: PrivacyBlock): block is { sub: string } {
  return typeof block === "object" && block !== null && "sub" in block;
}

const URL_PATTERN =
  /(https?:\/\/[A-Za-z0-9\-._~/?#[\]@!$&'()*+,;=%]+|(?:support\.google\.com|goo\.gle)\/[A-Za-z0-9\-_/]+)/g;

function linkifyText(text: string) {
  const parts = text.split(URL_PATTERN);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (!part) return null;
    if (URL_PATTERN.test(part)) {
      URL_PATTERN.lastIndex = 0;
      const href = part.startsWith("http") ? part : `https://${part}`;
      return (
        <a
          key={i}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#019839] underline underline-offset-2 hover:text-black"
        >
          {part}
        </a>
      );
    }
    URL_PATTERN.lastIndex = 0;
    return <span key={i}>{part}</span>;
  });
}

function renderBlock(block: PrivacyBlock, key: string) {
  if (isListBlock(block)) {
    return (
      <ul
        key={key}
        className="mt-3 list-disc space-y-2 ps-5 marker:text-[#019839]"
      >
        {block.map((item, i) => (
          <li key={i} className="text-[15px] leading-7 sm:text-[16px]">
            {linkifyText(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (isSubheadingBlock(block)) {
    return (
      <h3 key={key} className="mt-6 text-[20px] sm:text-[22px]">
        {block.sub}
      </h3>
    );
  }
  return (
    <p key={key} className="mt-3 text-[15px] leading-7 sm:text-[16px]">
      {linkifyText(block)}
    </p>
  );
}

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const content = locale === "ar" ? PRIVACY_POLICY_AR : PRIVACY_POLICY_EN;

  const titleWords = t("public.privacyPolicy.hero.titleWords", {
    returnObjects: true,
  }) as string[];
  const breadcrumb = t("public.privacyPolicy.hero.breadcrumb", {
    returnObjects: true,
  }) as string[];

  return (
    <div className="privacy-policy-page bg-[#eaf4ff] text-black">
      <div className="mx-auto max-w-[1100px] px-6 pt-36 text-center sm:px-8 sm:pt-44">
        <h1 className="text-[36px] uppercase text-black sm:text-[48px]">
          {titleWords.join(" ")}
        </h1>
        <p className="mt-2 text-[15px] text-black sm:text-[16px]">
          {breadcrumb.join(" ")}
        </p>
      </div>

      <section className="mx-auto max-w-[1100px] px-6 py-14 sm:px-8 md:py-16">
        <div>
          {content.intro.map((block, idx) => renderBlock(block, `intro-${idx}`))}
        </div>

        <div className="mt-8 space-y-10 sm:mt-10">
          {content.sections.map((section, sIdx) => (
            <div key={sIdx}>
              <h2 className="text-[24px] sm:text-[28px]">{section.heading}</h2>
              {section.blocks.map((block, idx) =>
                renderBlock(block, `${sIdx}-${idx}`),
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
