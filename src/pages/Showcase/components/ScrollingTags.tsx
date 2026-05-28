import type { CSSProperties } from 'react';

type ScrollingTagsProps = {
  tags: string[];
  /** 外层容器类名，如 hero-tags、card-tags */
  className?: string;
  /** 单个标签类名，如 hero-tag、card-tag */
  tagClassName?: string;
  /** 滚完一轮的时长（秒） */
  duration?: number;
  /** 标签间距（px） */
  gap?: number;
};

/**
 * 横向无限滚动标签（双份列表 + marquee，与 Hero 技能条同款逻辑）
 */
export default function ScrollingTags({
  tags,
  className = '',
  tagClassName = 'scrolling-tags-item',
  duration = 14,
  gap = 12,
}: ScrollingTagsProps) {
  if (tags.length === 0) return null;

  const style = {
    '--scroll-tags-duration': `${duration}s`,
    '--scroll-tags-gap': `${gap}px`,
  } as CSSProperties;

  return (
    <div className={`scrolling-tags ${className}`.trim()} style={style}>
      <div className="scrolling-tags-track">
        {tags.map((tag, i) => (
          <span key={`scroll-a-${tag}-${i}`} className={tagClassName}>
            {tag}
          </span>
        ))}
        {tags.map((tag, i) => (
          <span key={`scroll-b-${tag}-${i}`} className={tagClassName}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
