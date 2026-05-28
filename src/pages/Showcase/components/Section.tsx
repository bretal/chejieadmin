import type { CSSProperties, ReactNode } from 'react';
import { SECTION_BACKGROUNDS } from '../constants';
import { showcaseImg } from '../utils';
import AnimItem from './AnimItem';
import SectionBgNatural from './SectionBgNatural';

type SectionProps = {
  id: string;
  number?: string;
  title?: string;
  desc?: string;
  children: ReactNode;
};

export default function Section({ id, number, title, desc, children }: SectionProps) {
  const bgFile = SECTION_BACKGROUNDS[id];
  const useNaturalBg = id === 'tech' && bgFile;
  const sectionStyle =
    bgFile && !useNaturalBg
      ? ({ '--section-bg': `url(${showcaseImg(bgFile)})` } as CSSProperties)
      : undefined;

  return (
    <section
      id={id}
      className={`section${bgFile ? ' section--has-bg' : ''} section--${id}`}
      style={sectionStyle}
    >
      {bgFile &&
        (useNaturalBg ? (
          <SectionBgNatural src={showcaseImg(bgFile)} />
        ) : (
          <div className="section-bg" aria-hidden />
        ))}
      <div className="section-inner">
        <AnimItem variant="up" delay={0}>
          {number && <p className="section-number">{number}</p>}
          <h2 className="section-title">{title}</h2>
          {desc && <p className="section-desc">{desc}</p>}
        </AnimItem>
        {children}
      </div>
    </section>
  );
}
