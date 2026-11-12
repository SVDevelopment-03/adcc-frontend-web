import { useContentSection } from "../../hooks/useContentSection";
import { toWords, type ContentPageId } from "../../services/contentPages";
import { PublicPageHero } from "./publicPageHelpers";

/** The page's dashboard-editable hero (Pages → <page> → Hero banner). */
export function ContentPageHero({
  page,
  classPrefix,
  breadcrumbFontSize,
}: {
  page: ContentPageId;
  classPrefix?: string;
  breadcrumbFontSize?: number;
}) {
  const hero = useContentSection(page, "hero");
  return (
    <PublicPageHero
      titleWords={toWords(hero.pick("title"))}
      breadcrumb={toWords(hero.pick("breadcrumb"))}
      backgroundImage={hero.value("backgroundImage")}
      classPrefix={classPrefix}
      breadcrumbFontSize={breadcrumbFontSize}
    />
  );
}

/**
 * AnimatedButton props for a dashboard-entered link: site paths stay in the
 * app, full URLs open in a new tab.
 */
export const buttonLinkProps = (link: string) =>
  /^https?:\/\//i.test(link)
    ? { href: link, target: "_blank", rel: "noopener noreferrer" }
    : { to: link || "/" };

/** CSS `url()` value for a saved image path (paths may contain spaces). */
export const cssUrl = (src: string) => `url("${src.replace(/"/g, '\\"')}")`;
