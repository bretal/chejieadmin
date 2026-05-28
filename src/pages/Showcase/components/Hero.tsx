import type { CSSProperties } from 'react';
import { HERO_BACKGROUND, HERO_TAGS, NJUCM_URL } from '../constants';
import { showcaseImg } from '../utils';
import ScrollingTags from './ScrollingTags';

export default function Hero() {
  return (
    <header
      className="hero hero--has-bg"
      style={{ '--hero-bg': `url(${showcaseImg(HERO_BACKGROUND)})` } as CSSProperties}
    >
      <div className="hero-bg" aria-hidden />
      <div className="hero-content">
        <h1 className="hero-name hero-float">吕浩然</h1>
        <p className="hero-title hero-float hero-float-d1">全栈开发工程师 · Full-Stack Developer</p>
        <p className="hero-edu hero-float hero-float-d2">
          <a
            href={NJUCM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-school-link"
            title="南京中医药大学官网"
          >
            南京中医药大学
            <span className="hero-edu-sep" aria-hidden>
              ·
            </span>
            计算机科学与技术专业
          </a>
        </p>
        <ScrollingTags
          tags={HERO_TAGS}
          className="hero-tags"
          tagClassName="hero-tag"
          duration={11}
          gap={32}
        />
      </div>
      <div className="hero-scroll">
        <span>向下滚动</span>
        <div className="hero-scroll-line" />
      </div>
    </header>
  );
}
