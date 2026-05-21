"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function defaultSlidesPerView(width: number): number {
  if (width < 375) return 1;
  if (width < 640) return 1.15;
  if (width < 768) return 1.5;
  if (width < 1024) return 2;
  if (width < 1280) return 2.5;
  if (width < 1536) return 3;
  return 3.5;
}

function defaultSpacing(width: number): number {
  if (width < 640) return 12;
  if (width < 768) return 16;
  if (width < 1024) return 20;
  return 24;
}

export type CarouselLayoutConfig = {
  getSlidesPerView?: (width: number) => number;
  getSpacing?: (width: number) => number;
};

const TRANSITION_MS = 800;
const AUTOPLAY_MS = 6000;
const DRAG_THRESHOLD_DESKTOP_PX = 48;
const DRAG_THRESHOLD_MOBILE_PX = 32;
const DRAG_LOCK_PX = 10;

function getDragThreshold(width: number): number {
  return width < 640 ? DRAG_THRESHOLD_MOBILE_PX : DRAG_THRESHOLD_DESKTOP_PX;
}

type UseInfiniteCarouselOptions = {
  itemCount: number;
  /** Bump when the filtered item set changes to reset position. */
  resetKey?: string;
  layout?: CarouselLayoutConfig;
};

export function useInfiniteCarousel({
  itemCount,
  resetKey,
  layout,
}: UseInfiniteCarouselOptions) {
  const resolveSlidesPerView = layout?.getSlidesPerView ?? defaultSlidesPerView;
  const resolveSpacing = layout?.getSpacing ?? defaultSpacing;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3.5);
  const [spacing, setSpacing] = useState(24);
  const [cardWidth, setCardWidth] = useState(300);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef({ startX: 0, pointerId: -1, locked: false });
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const originalLength = itemCount;
  const middleStart = originalLength;

  const measureLayout = useCallback(() => {
    const width = window.innerWidth;
    const nextSlides = resolveSlidesPerView(width);
    const nextSpacing = resolveSpacing(width);
    setSlidesPerView(nextSlides);
    setSpacing(nextSpacing);

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const wrapperWidth = wrapper.offsetWidth;
    const nextCardWidth =
      (wrapperWidth - nextSpacing * (nextSlides - 1)) / nextSlides;
    setCardWidth(Math.max(nextCardWidth, 0));
  }, [resolveSlidesPerView, resolveSpacing]);

  const step = cardWidth + spacing;

  const getMaxIndex = useCallback(() => {
    const total = originalLength * 3;
    return Math.max(0, total - Math.ceil(slidesPerView));
  }, [originalLength, slidesPerView]);

  const currentDotIndex =
    originalLength > 0 ? activeIndex % originalLength : 0;

  const applyTransform = useCallback(
    (index: number, animate: boolean, offset = 0) => {
      const track = trackRef.current;
      if (!track) return;

      const translate = index * step - offset;
      track.style.transition = animate
        ? "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
        : "none";
      track.style.transform = `translate3d(-${translate}px, 0, 0)`;
    },
    [step],
  );

  const handleInfiniteLoop = useCallback(
    (index: number): number => {
      if (originalLength === 0) return 0;

      const maxIndex = getMaxIndex();
      const visible = Math.ceil(slidesPerView);

      if (index >= maxIndex - visible) {
        return index - originalLength;
      }
      if (index <= visible) {
        return index + originalLength;
      }
      return index;
    },
    [getMaxIndex, originalLength, slidesPerView],
  );

  const goToIndex = useCallback(
    (nextIndex: number, animate = true) => {
      if (originalLength === 0 || isTransitioning) return;

      if (animate) {
        setIsTransitioning(true);
        setActiveIndex(nextIndex);
        applyTransform(nextIndex, true, 0);

        window.setTimeout(() => {
          const looped = handleInfiniteLoop(nextIndex);
          if (looped !== nextIndex) {
            applyTransform(looped, false, 0);
            setActiveIndex(looped);
          }
          setIsTransitioning(false);
        }, TRANSITION_MS);
      } else {
        setActiveIndex(nextIndex);
        applyTransform(nextIndex, false, 0);
      }
    },
    [applyTransform, handleInfiniteLoop, isTransitioning, originalLength],
  );

  const goNext = useCallback(() => {
    if (originalLength === 0 || isTransitioning) return;

    const maxIndex = getMaxIndex();
    if (activeIndex >= maxIndex) {
      const jump = activeIndex - originalLength;
      applyTransform(jump, false, 0);
      setActiveIndex(jump);
      window.setTimeout(() => goToIndex(jump + 1, true), 50);
      return;
    }
    goToIndex(activeIndex + 1, true);
  }, [activeIndex, applyTransform, getMaxIndex, goToIndex, isTransitioning, originalLength]);

  const goPrev = useCallback(() => {
    if (originalLength === 0 || isTransitioning) return;

    if (activeIndex <= 0) {
      const maxIndex = getMaxIndex();
      const jump = maxIndex - (originalLength - 1);
      applyTransform(jump, false, 0);
      setActiveIndex(jump);
      window.setTimeout(() => goToIndex(jump - 1, true), 50);
      return;
    }
    goToIndex(activeIndex - 1, true);
  }, [activeIndex, applyTransform, getMaxIndex, goToIndex, isTransitioning, originalLength]);

  const goToDot = useCallback(
    (dotIndex: number) => {
      if (isTransitioning || originalLength === 0) return;
      goToIndex(middleStart + dotIndex, true);
    },
    [goToIndex, isTransitioning, middleStart, originalLength],
  );

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    if (originalLength <= 1) return;
    autoplayRef.current = setInterval(goNext, AUTOPLAY_MS);
  }, [goNext, originalLength, stopAutoplay]);

  const restartAutoplay = useCallback(() => {
    stopAutoplay();
    startAutoplay();
  }, [startAutoplay, stopAutoplay]);

  useEffect(() => {
    measureLayout();
    const onResize = () => {
      measureLayout();
      if (originalLength > 0) {
        setActiveIndex(middleStart);
        applyTransform(middleStart, false, 0);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [applyTransform, measureLayout, middleStart, originalLength]);

  useEffect(() => {
    if (originalLength > 0) {
      setActiveIndex(middleStart);
      applyTransform(middleStart, false, 0);
    }
  }, [resetKey, middleStart, originalLength, applyTransform]);

  useEffect(() => {
    applyTransform(activeIndex, !isDragging && !isTransitioning, dragOffset);
  }, [activeIndex, applyTransform, cardWidth, spacing, dragOffset, isDragging, isTransitioning]);

  useEffect(() => {
    startAutoplay();
    return stopAutoplay;
  }, [startAutoplay, stopAutoplay, resetKey]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (originalLength === 0) return;
    stopAutoplay();
    dragState.current = {
      startX: event.clientX,
      pointerId: event.pointerId,
      locked: false,
    };
    setIsDragging(true);
    setDragOffset(0);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!isDragging || dragState.current.pointerId !== event.pointerId) return;
    const delta = event.clientX - dragState.current.startX;

    if (!dragState.current.locked && Math.abs(delta) > DRAG_LOCK_PX) {
      dragState.current.locked = true;
    }
    if (dragState.current.locked) {
      event.preventDefault();
    }

    setDragOffset(delta);
    applyTransform(activeIndex, false, delta);
  };

  const finishDrag = (event: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = event.clientX - dragState.current.startX;
    const threshold = getDragThreshold(window.innerWidth);
    setIsDragging(false);
    setDragOffset(0);
    dragState.current.locked = false;

    if (Math.abs(delta) >= threshold) {
      if (delta < 0) goNext();
      else goPrev();
    } else {
      applyTransform(activeIndex, true, 0);
    }

    restartAutoplay();
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* pointer may already be released */
    }
  };

  const infiniteItems =
    originalLength > 0
      ? [...Array(originalLength * 3)].map((_, i) => i % originalLength)
      : [];

  return {
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
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
    isDragging,
  };
}
