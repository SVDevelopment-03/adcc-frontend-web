import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export type FacilityItem = { title: string; icon: LucideIcon };

/**
 * Horizontal strip of facility cards (event and track detail pages).
 * - Left / right arrow buttons appear when the cards don't all fit.
 * - The edge fade is only drawn on a side that has more cards to scroll to,
 *   so the first card is never faded (in Arabic it sits on the right).
 * - Cards can also be dragged with the mouse or swiped on touch screens.
 * Icon and label use logical `start-*` offsets, so cards mirror in Arabic.
 */
export function FacilitiesStrip({ facilities }: { facilities: FacilityItem[] }) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScrollLeft: 0 });
  const [edges, setEdges] = useState({ left: false, right: false });

  // Which physical sides still have cards hidden. scrollLeft runs 0..max in
  // left-to-right pages and -max..0 in right-to-left pages.
  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 2) {
      setEdges({ left: false, right: false });
      return;
    }
    const rtl = getComputedStyle(el).direction === "rtl";
    const min = rtl ? -max : 0;
    const top = rtl ? 0 : max;
    setEdges({ left: el.scrollLeft > min + 2, right: el.scrollLeft < top - 2 });
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update, facilities.length]);

  const scrollByCards = (direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.max(el.clientWidth * 0.7, 280), behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    drag.current = { active: true, moved: false, startX: e.pageX, startScrollLeft: el.scrollLeft };
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el || !drag.current.active) return;
    const delta = e.pageX - drag.current.startX;
    if (Math.abs(delta) > 3) drag.current.moved = true;
    el.scrollLeft = drag.current.startScrollLeft - delta;
  };
  const endDrag = () => {
    drag.current.active = false;
  };

  if (facilities.length === 0) return null;

  const fade = `linear-gradient(to right, ${edges.left ? "transparent 0, black 6%" : "black 0"}, ${
    edges.right ? "black 94%, transparent 100%" : "black 100%"
  })`;
  const showArrows = edges.left || edges.right;

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-black bg-white/70 text-black transition-colors " +
    "hover:border-[#019839] hover:bg-[#019839] hover:text-white disabled:cursor-default disabled:opacity-30 " +
    "disabled:hover:border-black disabled:hover:bg-white/70 disabled:hover:text-black";

  return (
    <>
      <div
        ref={scrollRef}
        className="mt-[42px] flex cursor-grab select-none gap-3 overflow-x-auto ps-3 [scrollbar-width:none] active:cursor-grabbing sm:gap-5 md:ps-6 lg:ps-[max(1.5rem,calc((100vw-1268px)/2))] [&::-webkit-scrollbar]:hidden"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
      >
        {facilities.map(({ title, icon: Icon }) => (
          <article
            key={title}
            className="group relative h-[70px] w-[170px] shrink-0 cursor-pointer rounded-[10px] bg-[#76767666] text-white transition-colors duration-200 hover:bg-white hover:text-[#333] sm:h-[97px] sm:w-[260px]"
          >
            <span className="absolute start-[14px] top-1/2 flex h-[36px] w-[36px] -translate-y-1/2 items-center justify-center rounded-[8px] bg-white text-[#333] transition-colors duration-200 group-hover:bg-[#019839] group-hover:text-white sm:start-[19px] sm:top-5 sm:h-[50px] sm:w-[50px] sm:translate-y-0 sm:rounded-[10px]">
              <Icon className="h-[18px] w-[18px] sm:h-[26px] sm:w-[26px]" />
            </span>
            <b className="absolute start-[60px] top-1/2 flex h-[36px] max-w-[100px] -translate-y-1/2 items-center text-start text-[13px] font-bold leading-[16px] sm:start-[86px] sm:top-5 sm:h-[50px] sm:max-w-[150px] sm:translate-y-0 sm:text-[20px] sm:leading-[22px]">
              {title}
            </b>
            <span className="absolute bottom-0 left-0 h-[3px] w-full rounded-b-[10px] bg-transparent transition-colors duration-200 group-hover:bg-[#019839] sm:h-[4px]" />
          </article>
        ))}
        <div className="w-4 shrink-0" aria-hidden />
      </div>

      {showArrows && (
        // Physical left / right buttons, in the same order in Arabic, placed at
        // the end of the strip (right in English, left in Arabic).
        <div className="mx-auto mt-5 flex w-[min(1200px,calc(100vw-24px))] justify-end md:w-[min(1200px,calc(100vw-48px))]">
          <div dir="ltr" className="flex gap-3">
            <button
              type="button"
              className={arrowClass}
              onClick={() => scrollByCards(-1)}
              disabled={!edges.left}
              aria-label={t("public.common.scrollLeft", "Scroll left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              className={arrowClass}
              onClick={() => scrollByCards(1)}
              disabled={!edges.right}
              aria-label={t("public.common.scrollRight", "Scroll right")}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
