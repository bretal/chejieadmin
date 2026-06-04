/** public/showcases → 构建后位于 dist/showcases，生产环境走 VITE_BASE_URL CDN */
export function showcaseImg(filename: string) {
  return `${import.meta.env.BASE_URL}showcases/${filename}`;
}

/** 展示页截图 / 视频等资源，路径相对 showcases/ */
export function showcaseAsset(path: string) {
  const normalized = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}showcases/${normalized}`;
}
