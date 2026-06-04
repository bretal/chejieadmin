export type ModuleCardItem = {
  icon?: string;
  title: string;
  desc: string;
  tags: string[];
};

/** 相对 public/showcases/ 的路径，如 web/rbac-guest.jpg */
export type ShowcaseMediaImage = {
  type: 'image';
  src: string;
  alt?: string;
  caption?: string;
};

export type ShowcaseMediaVideo = {
  type: 'video';
  src: string;
  poster?: string;
  caption?: string;
};

export type ShowcaseMedia = ShowcaseMediaImage | ShowcaseMediaVideo;

export type MediaCarouselItem = {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  /** 单张或多张（如访客 / 注册用户对比） */
  media: ShowcaseMedia | ShowcaseMedia[];
};

export type AnimVariant = 'up' | 'left' | 'right' | 'scale';
