// ========== 面包屑 ==========
export interface Breadcrumb {
  type: 'click' | 'input' | 'navigation' | 'xhr'
  timestamp: number
  data: string
}

// ========== 性能载荷 ==========
export interface PerformancePayload {
  category: 'performance'
  name: string
  value: number
  unit?: string
  rating?: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
  url: string
  page: string
  metadata?: Record<string, unknown>
}

// ========== 错误载荷 ==========
export interface ErrorPayload {
  category: 'error'
  name: string
  message: string
  stack: string
  lineno?: number
  colno?: number
  filename?: string
  timestamp: number
  url: string
  page: string
  source: 'runtime' | 'promise' | 'react'
  breadcrumbs: Breadcrumb[]
  metadata?: Record<string, unknown>
}

// ========== 埋点载荷 ==========
export interface TrackPayload {
  category: 'track'
  action: string
  label?: string
  value?: number
  timestamp: number
  url: string
  page: string
  extra?: Record<string, unknown>
}

export type MonitorPayload = PerformancePayload | ErrorPayload | TrackPayload

// ========== 配置 ==========
export interface MonitorConfig {
  enabled: boolean
  appName: string
  environment: 'development' | 'production'
  perf: {
    enabled: boolean
    observeFCP: boolean
    observeLCP: boolean
    observeCLS: boolean
    observeINP: boolean
    observeNavigation: boolean
  }
  error: {
    enabled: boolean
    captureRuntime: boolean
    capturePromise: boolean
    maxBreadcrumbs: number
  }
  tracking: {
    enabled: boolean
    autoTrackClicks: boolean
    autoTrackNav: boolean
    clickAttribute: string
  }
  reporter: {
    enabled: boolean
    reportUrl: string
    batchSize: number
    flushIntervalMs: number
    throttleMs: number
    maxRetries: number
    retryBaseDelayMs: number
    maxOfflineEvents: number
  }
}
