import { useEffect, useRef, useState } from 'react';
import ModuleCard from './ModuleCard';
import type { ModuleCardItem } from './types';

type CarouselProps = {
  items: ModuleCardItem[];
};

export default function Carousel({ items }: CarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const total = items.length;

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
    setCurrent((index + total) % total);
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  return (
    <div className="carousel">
      <div className="carousel-viewport" ref={viewportRef}>
        <div
          className="carousel-track"
          style={{ transform: slideWidth ? `translateX(-${current * slideWidth}px)` : undefined }}
        >
          {items.map((item, i) => (
            <div key={i} className="carousel-slide" aria-hidden={i !== current}>
              <ModuleCard {...item} className="module-card--carousel" />
            </div>
          ))}
        </div>
      </div>

      <div className="carousel-controls">
        <div className="carousel-dots">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel-dot${i === current ? ' carousel-dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
        <button type="button" className="carousel-arrow" onClick={prev} aria-label="上一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button type="button" className="carousel-arrow" onClick={next} aria-label="下一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
