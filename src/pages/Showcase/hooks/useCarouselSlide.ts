import { useEffect, useRef, useState } from 'react';

export function useCarouselSlide(length: number) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const updateWidth = () => setSlideWidth(el.offsetWidth);
    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const goTo = (index: number) => {
    setCurrent((index + length) % length);
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const trackStyle = slideWidth
    ? { transform: `translateX(-${current * slideWidth}px)` }
    : undefined;

  return { viewportRef, current, goTo, prev, next, trackStyle };
}
