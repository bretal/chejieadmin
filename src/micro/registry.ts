/**
 * qiankun 子应用注册表（预留）
 *
 * Next.js 作为子应用需注意：
 * - 默认 SSR 与 qiankun 的 UMD 加载方式冲突，子应用通常需 export 生命周期并关闭/适配 SSR
 * - 更常见做法：Next 独立部署 + 主应用 iframe / 反向代理，或 Next 静态导出后作为子应用
 *
 * 接入步骤（子项目就绪后）：
 * 1. npm i qiankun
 * 2. 在 MicroHost 中 registerMicroApps + start
 * 3. 填写下方 entry（子应用构建后的访问地址）
 */

export type MicroAppKey = 'next';

export interface MicroAppConfig {
  key: MicroAppKey;
  name: string;
  /** qiankun entry，例如 //localhost:3001 或生产环境 URL */
  entry: string;
  /** 主应用内挂载路由前缀 */
  activeRule: string;
  container: string;
  enabled: boolean;
}

export const MICRO_APPS: Record<MicroAppKey, MicroAppConfig> = {
  next: {
    key: 'next',
    name: 'chejie-next',
    entry: import.meta.env.VITE_MICRO_NEXT_ENTRY || '',
    activeRule: '/apps/next',
    container: '#micro-app-next',
    enabled: Boolean(import.meta.env.VITE_MICRO_NEXT_ENTRY),
  },
};

export function getMicroApp(key: MicroAppKey): MicroAppConfig {
  return MICRO_APPS[key];
}
