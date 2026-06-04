import type { MediaCarouselItem } from './components/types';

/** 小程序模块轮播：图片放在 public/showcases/web/ */
export const MINIAPP_DEMO_ITEMS: MediaCarouselItem[] = [
  {
    id: 'fengcai',
    title: '蜂采',
    desc: 'B2B 采购类微信小程序，覆盖订单、报价单、企业认证与个人中心等完整业务链路。',
    tags: ['微信小程序', 'Taro', '订单', '企业认证'],
    media: {
      type: 'image',
      src: 'web/fengcai.jpg',
      alt: '蜂采小程序「我的」页面',
    },
  },
  {
    id: 'youanhui',
    title: '游安徽',
    desc: '文旅类多端小程序，集成景区、线路、住宿、交通、美食等能力，支持地图与内容运营。',
    tags: ['微信小程序', '文旅', '地图', '内容运营'],
    media: {
      type: 'image',
      src: 'web/youanhui.png',
      alt: '游安徽小程序首页',
    },
  },
];
