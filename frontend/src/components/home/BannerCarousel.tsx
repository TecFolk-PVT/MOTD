"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useInfiniteCarousel } from "@/hooks/useInfiniteCarousel";
import { bannerData } from "@/lib/mock/homepage";

function bannerSlidesPerView(width: number): number {
  if (width < 640) return 1;
  if (width < 768) return 1.2;
  if (width < 1024) return 1.5;
  if (width < 1280) return 2;
  return 2.5;
}

function bannerSpacing(width: number): number {
  if (width < 640) return 12;
  if (width < 768) return 16;
  if (width < 1024) return 20;
  if (width < 1280) return 24;
  return 32;
}

const bannerLayout = {
  getSlidesPerView: bannerSlidesPerView,
  getSpacing: bannerSpacing,
};

function ChevronLeftIcon() {
  return (
    <svg
      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export function BannerCarousel() {
  const t = useTranslations("BannerCarousel");
  const slides = useMemo(() => bannerData, []);

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
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    isDragging,
  } = useInfiniteCarousel({
    itemCount: slides.length,
    layout: bannerLayout,
  });

  return (
    <section
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] w-full mx-auto overflow-hidden relative group"
      aria-label={t("ariaLabel")}
    >
      <div
        className="relative"
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <button
          type="button"
          onClick={goPrev}
          aria-label={t("prevSlide")}
          className="absolute left-2 xs:left-3 sm:left-4 md:left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/30 backdrop-blur-md rounded-full p-2 xs:p-2.5 sm:p-3 transition-all duration-300 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <ChevronLeftIcon />
        </button>

        <button
          type="button"
          onClick={goNext}
          aria-label={t("nextSlide")}
          className="absolute right-2 xs:right-3 sm:right-4 md:right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/30 backdrop-blur-md rounded-full p-2 xs:p-2.5 sm:p-3 transition-all duration-300 z-20 opacity-100 md:opacity-0 md:group-hover:opacity-100"
        >
          <ChevronRightIcon />
        </button>

        <div
          ref={wrapperRef}
          dir="ltr"
          className="overflow-visible overscroll-x-contain"
        >
          <div
            ref={trackRef}
            className={`carousel-touch flex overflow-visible will-change-transform ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            style={{ gap: 0 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
          >
            {infiniteItems.map((itemIndex, slideIndex) => {
              const banner = slides[itemIndex];
              const isLast = slideIndex === infiniteItems.length - 1;
              return (
                <div
                  key={`${slideIndex}-${banner.id}`}
                  className="banner_slide flex-shrink-0 group/slide overflow-hidden rounded-lg sm:rounded-none"
                  style={{
                    width: `${cardWidth}px`,
                    marginRight: isLast ? 0 : `${spacing}px`,
                  }}
                  data-id={banner.id}
                  data-original-index={itemIndex}
                >
                  <div className="relative h-fit overflow-hidden rounded-lg shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <img
                      src={banner.src}
                      alt={banner.alt}
                      className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover/slide:scale-110"
                      draggable={false}
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.src = `https://placehold.co/1200x800/1a1a1a/666666?text=${encodeURIComponent(banner.alt)}`;
                      }}
                    />
                  </div>
                </div>
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
                className={`w-1.5 xs:w-2 h-1.5 xs:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? "bg-[var(--color-black)] scale-150"
                    : "bg-[var(--color-grey-muted)] scale-100 hover:bg-[var(--color-black)]/50"
                }`}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
