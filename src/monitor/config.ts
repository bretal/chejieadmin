import type { MonitorConfig } from './types'

export const DEFAULT_CONFIG: MonitorConfig = {
  enabled: true,
  appName: 'chejieadmin',
  environment: 'production',
  perf: {
    enabled: true,
    observeFCP: true,
    observeLCP: true,
    observeCLS: true,
    observeINP: true,
    observeNavigation: true,
  },
  error: {
    enabled: true,
    captureRuntime: true,
    capturePromise: true,
    maxBreadcrumbs: 20,
  },
  tracking: {
    enabled: true,
    autoTrackClicks: true,
    autoTrackNav: true,
    clickAttribute: 'data-track',
  },
  reporter: {
    enabled: true,
    reportUrl: '/monitor/report',
    batchSize: 10,
    flushIntervalMs: 5000,
    throttleMs: 500,
    maxRetries: 5,
    retryBaseDelayMs: 1000,
    maxOfflineEvents: 200,
  },
}
