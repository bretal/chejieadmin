import type { CSSProperties, ReactNode, RefObject } from 'react';

type CarouselFrameProps = {
  viewportRef: RefObject<HTMLDivElement | null>;
  trackStyle?: CSSProperties;
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (index: number) => void;
  children: ReactNode;
  className?: string;
};

export default function CarouselFrame({
  viewportRef,
  trackStyle,
  current,
  total,
  onPrev,
  onNext,
  onGoTo,
  children,
  className = '',
}: CarouselFrameProps) {
  return (
    <div className={`carousel ${className}`.trim()}>
      <div className="carousel-viewport" ref={viewportRef}>
        <div className="carousel-track" style={trackStyle}>
          {children}
        </div>
      </div>

      <div className="carousel-controls">
        <div className="carousel-dots">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`carousel-dot${i === current ? ' carousel-dot--active' : ''}`}
              onClick={() => onGoTo(i)}
              aria-label={`第 ${i + 1} 张`}
            />
          ))}
        </div>
        <button type="button" className="carousel-arrow" onClick={onPrev} aria-label="上一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button type="button" className="carousel-arrow" onClick={onNext} aria-label="下一张">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
