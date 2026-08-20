import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const lineVariants = {
  hidden: { y: "120%", opacity: 0 },
  visible: { y: "0%", opacity: 1 },
};

export const FALLBACK_IMAGE = "/img/image 306912.png";
export const FALLBACK_AVATAR = "/img/ImageWithFallback.png";

export function dedupeImages(
  ...groups: Array<string | string[] | undefined>
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  groups.flat().forEach((image) => {
    const trimmed = (image || "").trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  });
  return result;
}

/** Ecommerce-style product gallery: clickable thumbnails, prev/next sliding, swipe, hover-zoom + a zoomable lightbox. */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const { t } = useTranslation();
  const list = images.length > 0 ? images : [FALLBACK_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [zoom, setZoom] = useState<{ origin: string; scale: number }>({
    origin: "center",
    scale: 1,
  });
  const touchStartX = useRef<number | null>(null);

  const safeIndex = Math.min(activeIndex, list.length - 1);
  const activeImage = list[safeIndex];

  const goPrev = () => {
    setLightboxZoomed(false);
    setActiveIndex((current) => (current - 1 + list.length) % list.length);
  };
  const goNext = () => {
    setLightboxZoomed(false);
    setActiveIndex((current) => (current + 1) % list.length);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoom({ origin: `${x}% ${y}%`, scale: 1.6 });
  };
  const resetZoom = () => setZoom({ origin: "center", scale: 1 });

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      delta > 0 ? goPrev() : goNext();
    }
    touchStartX.current = null;
  };

  const onImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div>
      <div
        className="relative flex aspect-[4/3] cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#f4f4f4] sm:aspect-[16/11] lg:aspect-auto lg:h-[440px] xl:h-[500px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetZoom}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          setLightboxZoomed(false);
          setLightboxOpen(true);
        }}
      >
        <img
          src={activeImage}
          alt={alt}
          className="h-full w-full object-contain transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${zoom.scale})`,
            transformOrigin: zoom.origin,
          }}
          onError={onImageError}
        />

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label={t("public.marketplace.detail.previousImage")}
              className="absolute start-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow sm:h-8 sm:w-8"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label={t("public.marketplace.detail.nextImage")}
              className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow sm:h-8 sm:w-8"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
          {list.map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === safeIndex}
              className={`h-16 overflow-hidden rounded-lg border-2 bg-[#f4f4f4] transition-colors sm:h-20 lg:h-[92px] ${
                index === safeIndex ? "border-[#019839]" : "border-transparent"
              }`}
            >
              <img
                src={image}
                alt=""
                className="h-full w-full object-cover"
                onError={onImageError}
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label={t("public.marketplace.detail.closeGallery")}
            className="absolute end-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
          >
            <X size={18} />
          </button>

          {list.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label={t("public.marketplace.detail.previousImage")}
              className="absolute start-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white sm:start-4"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <img
            src={activeImage}
            alt={alt}
            onClick={(event) => {
              event.stopPropagation();
              setLightboxZoomed((current) => !current);
            }}
            className={`max-h-[85vh] max-w-[90vw] cursor-zoom-in object-contain transition-transform duration-300 ${
              lightboxZoomed ? "scale-150 cursor-zoom-out" : ""
            }`}
            onError={onImageError}
          />

          {list.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label={t("public.marketplace.detail.nextImage")}
              className="absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white sm:end-4"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function useWordList(key: string): string[] {
  const { t } = useTranslation();
  const value = t(key, { returnObjects: true });
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string" && value !== key)
    return value.split(/\s+/).filter(Boolean);
  return [key];
}

export function AnimatedWords({
  words,
  gap = 12,
  stagger = 0.07,
  className = "",
}: {
  words: string[];
  gap?: number;
  stagger?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
      style={{ display: "flex", flexWrap: "wrap", columnGap: gap, rowGap: 0 }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className="overflow-hidden"
          style={{ display: "block" }}
        >
          <motion.span
            className="inline-block"
            variants={lineVariants}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}

export function HeroAnimatedWords({
  words,
  gap = 14,
  animate = true,
}: {
  words: string[];
  gap?: number;
  animate?: boolean;
}) {
  return (
    <motion.span
      initial="hidden"
      animate={animate ? "visible" : undefined}
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden public-word-gap"
          style={{ marginInlineEnd: gap }}
        >
          <motion.span
            className="inline-block"
            variants={lineVariants}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function PublicPageHero({
  titleWords,
  breadcrumb,
  backgroundImage,
  classPrefix = "public-page",
  breadcrumbFontSize,
}: {
  titleWords: string[];
  breadcrumb: string[];
  backgroundImage: string;
  classPrefix?: string;
  /** Overrides the default 22px breadcrumb size — pass a smaller value for a more compact hero. */
  breadcrumbFontSize?: number;
}) {
  return (
    <section
      className={`${classPrefix}-hero public-hero-bleed`}
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        minHeight: 480,
        overflow: "hidden",
      }}
    >
      <div
        className={`${classPrefix}-hero-bg`}
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)), url('${backgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden
      />
      <div className={`${classPrefix}-hero-content public-hero-content-pos`}>
        <h1
          className={`bebas ${classPrefix}-hero-title overflow-hidden`}
          style={{
            fontSize: 70,
            color: "#fff",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          <HeroAnimatedWords words={titleWords} />
        </h1>
        <p
          className={`${classPrefix}-hero-breadcrumb overflow-hidden`}
          style={{ color: "rgba(255,255,255,0.8)", fontSize: breadcrumbFontSize ?? 22 }}
        >
          <HeroAnimatedWords words={breadcrumb} gap={8} />
        </p>
      </div>
    </section>
  );
}
