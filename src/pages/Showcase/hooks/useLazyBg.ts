import { useEffect, useRef, useState } from 'react';

/** 当元素距离视口 rootMargin 时触发加载，避免首屏一次性请求所有背景图 */
export function useLazyBg(rootMargin = '200px') {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin]);

  return { ref, loaded };
}
