import { useEffect, useRef } from 'react';

type SectionBgNaturalProps = {
  src: string;
};

/** 背景仅裁剪/缩小，不放大（避免 cover 拉伸模糊） */
export default function SectionBgNatural({ src }: SectionBgNaturalProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    const applyFit = () => {
      const { clientWidth: cw, clientHeight: ch } = wrap;
      const { naturalWidth: iw, naturalHeight: ih } = img;
      if (!iw || !ih) return;

      let scale = 1;
      if (iw > cw || ih > ch) {
        scale = Math.max(cw / iw, ch / ih);
      }
      img.style.width = `${iw * scale}px`;
      img.style.height = `${ih * scale}px`;
    };

    const onLoad = () => applyFit();
    if (img.complete) onLoad();
    else img.addEventListener('load', onLoad);
    window.addEventListener('resize', applyFit);
    return () => {
      img.removeEventListener('load', onLoad);
      window.removeEventListener('resize', applyFit);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className="section-bg section-bg--natural" aria-hidden>
      <img ref={imgRef} src={src} alt="" loading="lazy" decoding="async" draggable={false} />
    </div>
  );
}
