import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const lineVariants = {
  hidden: { y: "120%", opacity: 0 },
  visible: { y: "0%", opacity: 1 },
};

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
