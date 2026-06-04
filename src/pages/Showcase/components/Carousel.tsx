import { useCarouselSlide } from '../hooks/useCarouselSlide';
import CarouselFrame from './CarouselFrame';
import ModuleCard from './ModuleCard';
import type { ModuleCardItem } from './types';

type CarouselProps = {
  items: ModuleCardItem[];
};

export default function Carousel({ items }: CarouselProps) {
  const { viewportRef, current, goTo, prev, next, trackStyle } = useCarouselSlide(items.length);

  return (
    <CarouselFrame
      viewportRef={viewportRef}
      trackStyle={trackStyle}
      current={current}
      total={items.length}
      onPrev={prev}
      onNext={next}
      onGoTo={goTo}
    >
      {items.map((item, i) => (
        <div key={item.title} className="carousel-slide" aria-hidden={i !== current}>
          <ModuleCard {...item} className="module-card--carousel" />
        </div>
      ))}
    </CarouselFrame>
  );
}
