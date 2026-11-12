import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocale } from "../../contexts/LocaleContext";
import { getPublishedCustomPage, type CustomPage as CustomPageData } from "../../services/siteRouting";
import type { CustomPageBlock } from "../../services/customPageBlocks";
import { toWords } from "../../services/contentPages";
import { getCached, setCache } from "../../utils/apiCache";
import { AnimatedButton } from "../ui/AnimatedButton";
import { AnimatedWords, PublicPageHero } from "./publicPageHelpers";
import { RichText } from "./RichText";
import { PublicNotFound } from "./PublicNotFound";
import { buttonLinkProps, cssUrl } from "./contentHelpers";

/** A page built in the dashboard (Pages → New page), served at its own URL. */
export default function CustomPage({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const cacheKey = `site:page:${slug}`;
  const [page, setPage] = useState<CustomPageData | null>(() => getCached<CustomPageData>(cacheKey) ?? null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setNotFound(false);
    getPublishedCustomPage(slug)
      .then((loaded) => {
        if (cancelled) return;
        setCache(cacheKey, loaded);
        setPage(loaded);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, cacheKey]);

  const isAr = locale === "ar";
  const pick = (source: Record<string, unknown>, name: string) => {
    const en = typeof source[`${name}En`] === "string" ? (source[`${name}En`] as string) : "";
    const ar = typeof source[`${name}Ar`] === "string" ? (source[`${name}Ar`] as string) : "";
    return isAr ? ar || en : en;
  };

  // Browser tab title and search description.
  useEffect(() => {
    if (!page) return;
    const previousTitle = document.title;
    document.title = pick(page as never, "seoTitle") || pick(page as never, "title") || previousTitle;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = meta?.content ?? null;
    const description = pick(page as never, "seoDescription");
    if (description) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) meta.content = previousDescription;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isAr]);

  if (notFound && !page) return <PublicNotFound />;

  if (!page) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[#eaf4ff]">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#019839]" />
      </div>
    );
  }

  // Hidden blocks, and blocks an admin added but never filled in, are skipped
  // so the live page never shows an empty banner, box or question.
  const blocks = (page.blocks ?? []).filter((b) => b.visible !== false && hasContent(b, pick));
  const startsWithHero = blocks[0]?.type === "hero";

  return (
    <div className="custom-page bg-[#eaf4ff] text-black" style={{ minWidth: 320, overflowX: "clip" }}>
      {/* Clear the floating header when the page doesn't open with a hero. */}
      {!startsWithHero && <div className="h-32 sm:h-40" aria-hidden />}
      {blocks.map((block) => (
        <Block key={block.id} block={block} pick={pick} />
      ))}
    </div>
  );
}

type Pick = (source: Record<string, unknown>, name: string) => string;

const shell = "mx-auto w-full max-w-[1200px] px-4 sm:px-6 md:px-10 min-[1300px]:px-0";
const headingClass = "bebas text-[30px] uppercase leading-tight sm:text-[40px] lg:text-[50px]";
const str = (value: unknown) => (typeof value === "string" ? value : "");
const listOf = (value: unknown) => (Array.isArray(value) ? (value as Record<string, unknown>[]) : []);

/** Card / question / image entries that have something to show. */
const cardItems = (block: CustomPageBlock, pick: Pick) =>
  listOf(block.items).filter((item) => pick(item, "title") || pick(item, "text") || str(item.image));
const faqItems = (block: CustomPageBlock, pick: Pick) => listOf(block.items).filter((item) => pick(item, "question"));
const galleryImages = (block: CustomPageBlock) => listOf(block.items).map((item) => str(item.image)).filter(Boolean);

/** False for a block that has nothing to show (added in the editor but left empty). */
function hasContent(block: CustomPageBlock, pick: Pick): boolean {
  switch (block.type) {
    case "hero":
      return Boolean(pick(block, "title") || pick(block, "subtitle") || str(block.backgroundImage));
    case "text":
      return Boolean(pick(block, "heading") || pick(block, "body"));
    case "imageText":
      return Boolean(pick(block, "heading") || pick(block, "body") || str(block.image) || pick(block, "buttonLabel"));
    case "image":
      return Boolean(str(block.image));
    case "cards":
      return cardItems(block, pick).length > 0;
    case "faq":
      return faqItems(block, pick).length > 0;
    case "cta":
      return Boolean(pick(block, "title") || pick(block, "text") || pick(block, "buttonLabel"));
    case "gallery":
      return galleryImages(block).length > 0;
    default:
      return false;
  }
}

function Heading({ text, center = false }: { text: string; center?: boolean }) {
  if (!text) return null;
  return (
    <h2 className={`${headingClass} overflow-hidden ${center ? "text-center" : ""}`}>
      <AnimatedWords words={toWords(text)} gap={12} className={center ? "justify-center" : ""} />
    </h2>
  );
}

function Button({ label, link, className = "" }: { label: string; link: string; className?: string }) {
  if (!label) return null;
  return (
    <AnimatedButton {...buttonLinkProps(link)} className={className}>
      {label}
    </AnimatedButton>
  );
}

function Block({ block, pick }: { block: CustomPageBlock; pick: Pick }) {
  switch (block.type) {
    case "hero":
      return (
        <PublicPageHero
          titleWords={toWords(pick(block, "title"))}
          breadcrumb={toWords(pick(block, "subtitle"))}
          backgroundImage={str(block.backgroundImage)}
          classPrefix="custom-page"
        />
      );

    case "text":
      return (
        <section className={`${shell} py-10 sm:py-14`}>
          <Heading text={pick(block, "heading")} />
          <div className="mt-4 max-w-[900px] text-black/80">
            <RichText text={pick(block, "body")} keyPrefix={block.id} />
          </div>
        </section>
      );

    case "imageText": {
      const imageLeft = block.imagePosition === "left";
      const image = str(block.image);
      return (
        <section className={`${shell} grid items-center gap-8 py-10 sm:py-14 lg:grid-cols-2 lg:gap-14`}>
          <div className={imageLeft ? "lg:order-2" : ""}>
            <Heading text={pick(block, "heading")} />
            <div className="mt-4 text-black/80">
              <RichText text={pick(block, "body")} keyPrefix={block.id} />
            </div>
            <Button label={pick(block, "buttonLabel")} link={str(block.buttonLink)} className="mt-6" />
          </div>
          {image && (
            <img
              src={image}
              alt=""
              className={`h-[260px] w-full rounded-xl object-cover sm:h-[360px] lg:h-[440px] ${imageLeft ? "lg:order-1" : ""}`}
            />
          )}
        </section>
      );
    }

    case "image": {
      const image = str(block.image);
      if (!image) return null;
      const caption = pick(block, "caption");
      return (
        <figure className={`${shell} py-8 sm:py-10`}>
          <img src={image} alt={caption} className="max-h-[640px] w-full rounded-xl object-cover" />
          {caption && <figcaption className="mt-3 text-center text-[15px] text-black/60">{caption}</figcaption>}
        </figure>
      );
    }

    case "cards":
      return (
        <section className={`${shell} py-10 sm:py-14`}>
          <Heading text={pick(block, "heading")} />
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cardItems(block, pick).map((item, i) => {
              const image = str(item.image);
              const link = str(item.link);
              const body = (
                <>
                  {image && <img src={image} alt="" className="h-[220px] w-full rounded-xl object-cover" />}
                  <h3 className="bebas mt-4 text-[24px] uppercase leading-tight">{pick(item, "title")}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-black/70">{pick(item, "text")}</p>
                </>
              );
              const props = link ? buttonLinkProps(link) : null;
              return props && "href" in props ? (
                <a key={i} {...props} className="block rounded-xl transition-opacity hover:opacity-85">
                  {body}
                </a>
              ) : props ? (
                <Link key={i} to={props.to} className="block rounded-xl transition-opacity hover:opacity-85">
                  {body}
                </Link>
              ) : (
                <div key={i}>{body}</div>
              );
            })}
          </div>
        </section>
      );

    case "faq":
      return <FaqBlock block={block} pick={pick} />;

    case "cta": {
      const background = str(block.backgroundImage);
      return (
        <section className={`${shell} py-10 sm:py-14`}>
          <div
            className="rounded-2xl px-6 py-12 text-center text-white sm:px-12 sm:py-16"
            style={{
              backgroundColor: "#435974",
              backgroundImage: background
                ? `linear-gradient(rgba(0,0,0,0.45),rgba(0,0,0,0.45)), ${cssUrl(background)}`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <h2 className="bebas text-[30px] uppercase leading-tight sm:text-[44px]">{pick(block, "title")}</h2>
            {pick(block, "text") && (
              <p className="mx-auto mt-3 max-w-[640px] text-[16px] sm:text-[18px]">{pick(block, "text")}</p>
            )}
            <Button label={pick(block, "buttonLabel")} link={str(block.buttonLink)} className="mt-6" />
          </div>
        </section>
      );
    }

    case "gallery":
      return (
        <section className={`${shell} py-10 sm:py-14`}>
          <Heading text={pick(block, "heading")} />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {galleryImages(block).map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
              ))}
          </div>
        </section>
      );

    default:
      return null;
  }
}

function FaqBlock({ block, pick }: { block: CustomPageBlock; pick: Pick }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className={`${shell} py-10 sm:py-14`}>
      <Heading text={pick(block, "heading")} center />
      <div className="mx-auto mt-8 max-w-[900px] space-y-3">
        {faqItems(block, pick).map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="rounded-xl border border-black/15 bg-white/40">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-[17px] font-medium sm:text-[19px]"
                aria-expanded={isOpen}
              >
                {pick(item, "question")}
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-[16px] leading-relaxed text-black/70">
                  <RichText text={pick(item, "answer")} keyPrefix={`${block.id}-${i}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
