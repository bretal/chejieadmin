/** public/showcases → 构建后位于 dist/showcases，生产环境走 VITE_BASE_URL CDN */
export function showcaseImg(filename: string) {
  return `${import.meta.env.BASE_URL}showcases/${filename}`;
}

/** 移动端小尺寸变体，文件名替换 .webp → -sm.webp */
export function showcaseImgSm(filename: string) {
  return `${import.meta.env.BASE_URL}showcases/${filename.replace(/\.webp$/, '-sm.webp')}`;
}

/** 展示页截图 / 视频等资源，路径相对 showcases/ */
export function showcaseAsset(path: string) {
  const normalized = path.replace(/^\//, '');
  return `${import.meta.env.BASE_URL}showcases/${normalized}`;
}
