import ScrollingTags from './ScrollingTags';
import MediaAsset from './MediaAsset';
import type { MediaCarouselItem, ShowcaseMedia } from './types';

function normalizeMedia(media: ShowcaseMedia | ShowcaseMedia[]): ShowcaseMedia[] {
  return Array.isArray(media) ? media : [media];
}

type MediaSlideProps = {
  item: MediaCarouselItem;
};

export default function MediaSlide({ item }: MediaSlideProps) {
  const assets = normalizeMedia(item.media);
  const multi = assets.length > 1;

  return (
    <article className="media-slide">
      <header className="media-slide__head">
        <h3 className="media-slide__title">{item.title}</h3>
        <p className="media-slide__desc">{item.desc}</p>
        <ScrollingTags
          tags={item.tags}
          className="media-slide__tags"
          tagClassName="media-slide__tag"
          duration={12}
          gap={12}
        />
      </header>

      <div className={`media-slide__body${multi ? ' media-slide__body--grid' : ''}`}>
        {assets.map((asset) => (
          <figure key={asset.src} className="media-slide__figure">
            <div className="media-slide__frame">
              <MediaAsset media={asset} />
            </div>
            {asset.caption && (
              <figcaption className="media-slide__caption">{asset.caption}</figcaption>
            )}
          </figure>
        ))}
      </div>
    </article>
  );
}
