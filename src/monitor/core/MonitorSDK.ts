import type { MonitorConfig, ErrorPayload, TrackPayload } from '../types'
import { DEFAULT_CONFIG } from '../config'
import { Reporter } from '../reporter/Reporter'
import { PerformanceObserverModule } from '../performance/PerformanceObserverModule'
import { NavigationTimingModule } from '../performance/NavigationTimingModule'
import { GlobalErrorCapture } from '../error/GlobalErrorCapture'
import { BreadcrumbManager } from '../error/BreadcrumbManager'
import { AutoTracker } from '../tracking/AutoTracker'

let instance: MonitorSDK | null = null

function scheduleIdle(fn: () => void, timeout = 3000): void {
  if ('requestIdleCallback' in window) {
    ;(window as Window & { requestIdleCallback: Window['requestIdleCallback'] }).requestIdleCallback(
      fn,
      { timeout },
    )
  } else {
    setTimeout(fn, 0)
  }
}

function mergeConfig(user?: Partial<MonitorConfig>): MonitorConfig {
  if (!user) return DEFAULT_CONFIG
  return {
    ...DEFAULT_CONFIG,
    ...user,
    perf: { ...DEFAULT_CONFIG.perf, ...user.perf },
    error: { ...DEFAULT_CONFIG.error, ...user.error },
    tracking: { ...DEFAULT_CONFIG.tracking, ...user.tracking },
    reporter: { ...DEFAULT_CONFIG.reporter, ...user.reporter },
  }
}

export class MonitorSDK {
  private config: MonitorConfig = DEFAULT_CONFIG
  private reporter_: Reporter | null = null
  private perfObs: PerformanceObserverModule | null = null
  private navTiming: NavigationTimingModule | null = null
  private errorCapture: GlobalErrorCapture | null = null
  private breadcrumbs_: BreadcrumbManager | null = null
  private autoTracker: AutoTracker | null = null
  private destroyed = false

  private constructor() {}

  static getInstance(): MonitorSDK {
    if (!instance) instance = new MonitorSDK()
    return instance
  }

  init(userConfig?: Partial<MonitorConfig>): void {
    if (this.reporter_) return

    try {
      this.config = mergeConfig(userConfig)
      if (!this.config.enabled) return

      this.breadcrumbs_ = new BreadcrumbManager(this.config.error.maxBreadcrumbs)
      this.reporter_ = new Reporter(this.config.reporter)

      if (this.config.error.enabled) {
        this.errorCapture = new GlobalErrorCapture(
          (ev) => this.reporter_!.enqueue(ev),
          this.breadcrumbs_,
        )
        this.errorCapture.setup()
      }

      if (this.config.perf.enabled) {
        scheduleIdle(() => {
          if (this.destroyed) return
          try {
            this.perfObs = new PerformanceObserverModule(
              (m) => this.reporter_!.enqueue(m),
              this.config.perf,
            )
            this.perfObs.observe()
          } catch {
            /* silent */
          }
        })

        scheduleIdle(() => {
          if (this.destroyed) return
          try {
            this.navTiming = new NavigationTimingModule((m) => this.reporter_!.enqueue(m))
            this.navTiming.collect()
          } catch {
            /* silent */
          }
        }, 3000)
      }

      if (this.config.tracking.enabled) {
        scheduleIdle(() => {
          if (this.destroyed) return
          try {
            this.autoTracker = new AutoTracker(
              (ev) => this.reporter_!.enqueue(ev),
              this.config.tracking,
              this.breadcrumbs_!,
            )
            this.autoTracker.setup()
          } catch {
            /* silent */
          }
        }, 3000)
      }
    } catch {
      /* 监控初始化失败不影响业务 */
      console.warn('[Monitor] Init failed')
    }
  }

  track(action: string, label?: string, value?: number, extra?: Record<string, unknown>): void {
    try {
      if (!this.reporter_ || !this.config.enabled) return
      const payload: TrackPayload = {
        category: 'track',
        action,
        label,
        value,
        timestamp: Date.now(),
        url: window.location.href,
        page: window.location.pathname,
        extra,
      }
      this.reporter_.enqueue(payload)
    } catch {
      /* silent */
    }
  }

  reportReactError(error: Error, componentStack?: string): void {
    try {
      if (!this.reporter_ || !this.config.enabled) return
      const payload: ErrorPayload = {
        category: 'error',
        name: error.name || 'ReactError',
        message: error.message,
        stack: error.stack || '',
        timestamp: Date.now(),
        url: window.location.href,
        page: window.location.pathname,
        source: 'react',
        breadcrumbs: this.breadcrumbs_?.getAll() ?? [],
        metadata: componentStack ? { componentStack } : undefined,
      }
      this.reporter_.enqueue(payload)
    } catch {
      /* silent */
    }
  }

  destroy(): void {
    this.destroyed = true
    try { this.perfObs?.disconnect() } catch { /* */ }
    try { this.errorCapture?.teardown() } catch { /* */ }
    try { this.autoTracker?.teardown() } catch { /* */ }
    try { this.reporter_?.destroy() } catch { /* */ }
    instance = null
  }
}
