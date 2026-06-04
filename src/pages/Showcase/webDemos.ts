import type { MediaCarouselItem } from './components/types';

/**
 * Web 管理系统模块轮播配置。
 * 将截图/视频放到 public/showcases/web/ 下，按需改 src（支持 .jpg .png .webp .mp4 等）。
 * 单条 media 可改为 type: 'video' 并设置 poster 封面图。
 */
export const WEB_DEMO_ITEMS: MediaCarouselItem[] = [
  {
    id: 'rbac',
    title: 'RBAC 权限控制',
    desc: '基于角色的访问控制：访客与注册用户看到不同菜单与路由，按钮级权限与动态路由按角色加载。',
    tags: ['动态路由', 'RBAC', '访客模式', '注册用户', '按钮权限'],
    media: {
      type: 'image',
      src: 'web/RBAC.png',
      alt: 'RBAC 权限控制页面截图',
    },
  },
  {
    id: 'echarts',
    title: 'ECharts 数据可视化',
    desc: '复杂图表、大屏布局、联动下钻与实时刷新；可按业务切换为录屏视频或静态截图展示。',
    tags: ['ECharts', '数据大屏', '图表联动', '实时数据'],
    media: {
      type: 'video',
      src: 'web/echarts.mp4',
    },
  },
  {
    id: 'perf',
    title: '首屏加载性能优化',
    desc: '掌握路由与组件分包、持续减小打包体积，并将 JS/CSS 等静态资源部署至 CDN 加速，缩短首屏可交互时间。',
    tags: ['代码分包', 'Tree Shaking', 'CDN 加速', 'Vite 构建', '首屏优化'],
    media: {
      type: 'image',
      src: 'web/perf-cdn.png',
      alt: '静态资源经 CDN 域名加载的网络请求截图',
    },
  },
];
