import { useCarouselSlide } from '../hooks/useCarouselSlide';
import CarouselFrame from './CarouselFrame';
import MediaSlide from './MediaSlide';
import type { MediaCarouselItem } from './types';

type MediaCarouselProps = {
  items: MediaCarouselItem[];
};

export default function MediaCarousel({ items }: MediaCarouselProps) {
  const { viewportRef, current, goTo, prev, next, trackStyle } = useCarouselSlide(items.length);

  return (
    <CarouselFrame
      className="media-carousel"
      viewportRef={viewportRef}
      trackStyle={trackStyle}
      current={current}
      total={items.length}
      onPrev={prev}
      onNext={next}
      onGoTo={goTo}
    >
      {items.map((item, i) => (
        <div key={item.id} className="carousel-slide" aria-hidden={i !== current}>
          <MediaSlide item={item} />
        </div>
      ))}
    </CarouselFrame>
  );
}
