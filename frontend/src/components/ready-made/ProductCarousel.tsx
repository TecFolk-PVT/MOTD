"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useInfiniteCarousel } from "@/hooks/useInfiniteCarousel";
import {
  filterReadyMadeItems,
  readyMadeItems,
  type ReadyMadeFilter,
} from "@/lib/mock/homepage";
import { ProductCard } from "./ProductCard";

const FILTER_KEYS: ReadyMadeFilter[] = ["all", "kandura", "abaya", "bisht"];

const chipBase =
  "px-3 xs:px-4 py-1.5 xs:py-2 border border-[var(--color-border)] uppercase tracking-[0.24em] whitespace-nowrap [font-family:var(--font-ui)] transition-all";

export function ProductCarousel() {
  const t = useTranslations("ProductCarousel");
  const [activeFilter, setActiveFilter] = useState<ReadyMadeFilter>("all");

  const filteredItems = useMemo(
    () => filterReadyMadeItems(readyMadeItems, activeFilter),
    [activeFilter],
  );

  const {
    wrapperRef,
    trackRef,
    cardWidth,
    spacing,
    infiniteItems,
    originalLength,
    currentDotIndex,
    goNext,
    goPrev,
    goToDot,
    startAutoplay,
    stopAutoplay,
    restartAutoplay,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    isDragging,
  } = useInfiniteCarousel({
    itemCount: filteredItems.length,
    resetKey: activeFilter,
  });

  const selectFilter = (filter: ReadyMadeFilter) => {
    if (filter === activeFilter) return;
    setActiveFilter(filter);
    restartAutoplay();
  };

  if (filteredItems.length === 0) {
    return (
      <section
        className="bg-[var(--bg-page)] py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] border-[var(--color-border)]"
        aria-label={t("ariaLabel")}
      >
        <div className="px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] w-full mx-auto">
          <p className="[font-family:var(--font-ui)] text-[var(--color-grey-muted)] text-sm">
            {t("emptyFilter")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-[var(--bg-page)] py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] border-[var(--color-border)]"
      aria-label={t("ariaLabel")}
    >
      <div className="px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 xs:mb-10 sm:mb-12 md:mb-14 lg:mb-[var(--space-64)] gap-4 xs:gap-5 sm:gap-6 md:gap-[var(--space-24)]">
          <div>
            <span className="[font-family:var(--font-ui)] text-[7px] xs:text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] mb-2 xs:mb-3 flex items-center gap-2 xs:gap-3">
              <span className="block w-3 xs:w-4 sm:w-5 h-px bg-[var(--color-grey-muted)]" aria-hidden="true" />
              {t("eyebrow")}
            </span>
            <h2 className="[font-family:var(--font-display)] text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[44px] xl:text-[48px] 2xl:text-[56px] font-normal leading-[1.1] xs:leading-[1.09] sm:leading-[1.08] tracking-[-0.01em] text-[var(--color-black)]">
              {t("title")}
            </h2>
          </div>

          <Link
            href="/ready-made"
            className="[font-family:var(--font-ui)] text-[7px] xs:text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.24em] text-[var(--color-black)] border-b border-[var(--color-black)] pb-0.5 xs:pb-1 hover:opacity-50 transition-all duration-200 whitespace-nowrap"
          >
            {t("exploreLink")}
          </Link>
        </div>

        <div
          className="flex gap-2 xs:gap-2.5 sm:gap-3 mb-6 xs:mb-8 sm:mb-10 md:mb-12 lg:mb-[var(--space-40)] overflow-x-auto pb-2 xs:pb-3"
          role="tablist"
          aria-label={t("filtersAriaLabel")}
        >
          {FILTER_KEYS.map((key) => {
            const isActive = activeFilter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectFilter(key)}
                className={`${chipBase} text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] xl:text-[11px] ${
                  isActive
                    ? "bg-[var(--color-black)] text-white"
                    : "text-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-white"
                }`}
              >
                {t(`filters.${key}`)}
              </button>
            );
          })}
        </div>

        <div
          className="relative group"
          onMouseEnter={stopAutoplay}
          onMouseLeave={startAutoplay}
        >
          <button
            type="button"
            onClick={goPrev}
            aria-label={t("prevSlide")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 xs:w-9 sm:w-10 h-8 xs:h-9 sm:h-10 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto"
          >
            <span className="[font-family:var(--font-ui)] text-[16px] xs:text-[18px] sm:text-[20px] leading-none">
              ‹
            </span>
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label={t("nextSlide")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 xs:w-9 sm:w-10 h-8 xs:h-9 sm:h-10 rounded-full bg-white border border-[var(--color-border)] flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-auto"
          >
            <span className="[font-family:var(--font-ui)] text-[16px] xs:text-[18px] sm:text-[20px] leading-none">
              ›
            </span>
          </button>

          <div
            ref={wrapperRef}
            dir="ltr"
            className="overflow-hidden overscroll-x-contain"
          >
            <div
              ref={trackRef}
              className={`carousel-touch flex will-change-transform ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              style={{ gap: 0 }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
            >
              {infiniteItems.map((itemIndex, slideIndex) => {
                const product = filteredItems[itemIndex];
                const isLast = slideIndex === infiniteItems.length - 1;
                return (
                  <ProductCard
                    key={`${slideIndex}-${product.title}`}
                    product={product}
                    width={cardWidth}
                    marginRight={spacing}
                    shopNowLabel={t("shopNow")}
                    isLast={isLast}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {originalLength > 0 ? (
          <div
            className="flex justify-center gap-2 xs:gap-2.5 sm:gap-3 mt-6 xs:mt-8 sm:mt-10 md:mt-[var(--space-32)]"
            role="tablist"
            aria-label={t("dotsAriaLabel")}
          >
            {Array.from({ length: originalLength }).map((_, dotIndex) => {
              const isCurrent = dotIndex === currentDotIndex;
              return (
                <button
                  key={dotIndex}
                  type="button"
                  role="tab"
                  aria-selected={isCurrent}
                  aria-label={t("dotLabel", { index: dotIndex + 1 })}
                  onClick={() => goToDot(dotIndex)}
                  className="w-1.5 xs:w-2 h-1.5 xs:h-2 rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    backgroundColor: isCurrent
                      ? "var(--color-black)"
                      : "var(--color-grey-muted)",
                    transform: isCurrent ? "scale(1.5)" : "scale(1)",
                    opacity: isCurrent ? 1 : 0.6,
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
