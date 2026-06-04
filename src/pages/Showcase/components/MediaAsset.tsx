import { useState } from 'react';
import { showcaseAsset } from '../utils';
import type { ShowcaseMedia } from './types';

type MediaAssetProps = {
  media: ShowcaseMedia;
};

export default function MediaAsset({ media }: MediaAssetProps) {
  const [failed, setFailed] = useState(false);
  const url = showcaseAsset(media.src);

  if (media.type === 'video') {
    return (
      <video
        className="media-slide__video"
        src={url}
        poster={media.poster ? showcaseAsset(media.poster) : undefined}
        controls
        playsInline
        preload="metadata"
      />
    );
  }

  if (failed) {
    return (
      <div className="media-slide__fallback" role="img" aria-label={media.alt ?? '占位'}>
        <span>请将资源放到</span>
        <code>public/showcases/{media.src}</code>
      </div>
    );
  }

  return (
    <img
      className="media-slide__img"
      src={url}
      alt={media.alt ?? media.caption ?? ''}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
