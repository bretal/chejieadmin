import type { MonitorConfig, PerformancePayload } from '../types'

/** Google Web Vitals 阈值 */
function rating(name: string, value: number): PerformancePayload['rating'] {
  switch (name) {
    case 'lcp': return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor'
    case 'fcp': return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor'
    case 'cls': return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor'
    case 'inp': return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor'
    case 'ttfb': return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor'
    default: return undefined
  }
}

export class PerformanceObserverModule {
  private observers: PerformanceObserver[] = []
  private clsValue = 0
  private onReport: (m: PerformancePayload) => void
  private options: MonitorConfig['perf']

  constructor(onReport: (m: PerformancePayload) => void, options: MonitorConfig['perf']) {
    this.onReport = onReport
    this.options = options
  }

  observe(): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      const types = PerformanceObserver.supportedEntryTypes
      if (!types) return

      if (this.options.observeFCP && types.includes('paint')) {
        this.doObserve('paint', (entries) => {
          for (const e of entries) {
            if (e.name === 'first-contentful-paint') {
              this.report('fcp', e.startTime, 'ms')
              if (e.startTime > 0) this.report('fp', e.startTime, 'ms')
            }
          }
        })
      }

      if (this.options.observeLCP && types.includes('largest-contentful-paint')) {
        this.doObserve('largest-contentful-paint', (entries) => {
          const last = entries[entries.length - 1] as PerformanceEntry & { startTime: number }
          if (last) this.report('lcp', last.startTime, 'ms')
        })
      }

      if (this.options.observeCLS && types.includes('layout-shift')) {
        this.doObserve('layout-shift', (entries) => {
          for (const e of entries as (PerformanceEntry & { hadRecentInput?: boolean; value: number })[]) {
            if (!e.hadRecentInput) this.clsValue += e.value
          }
        })
        const flushCLS = () => {
          if (document.visibilityState === 'hidden') {
            this.report('cls', this.clsValue, 'score')
            document.removeEventListener('visibilitychange', flushCLS)
          }
        }
        document.addEventListener('visibilitychange', flushCLS)
      }

      if (this.options.observeINP && types.includes('event')) {
        let maxDuration = 0
        this.doObserve('event', (entries) => {
          for (const e of entries as (PerformanceEntry & { interactionId?: number; duration: number })[]) {
            if (e.interactionId && e.duration > maxDuration) {
              maxDuration = e.duration
            }
          }
        })
        const flushINP = () => {
          if (document.visibilityState === 'hidden' && maxDuration > 0) {
            this.report('inp', maxDuration, 'ms')
            document.removeEventListener('visibilitychange', flushINP)
          }
        }
        document.addEventListener('visibilitychange', flushINP)
      }
    } catch {
      /* 浏览器不支持某类 entry type */
    }
  }

  disconnect(): void {
    for (const obs of this.observers) {
      try { obs.disconnect() } catch { /* */ }
    }
    this.observers = []
  }

  private doObserve(type: string, cb: (entries: PerformanceEntryList) => void): void {
    try {
      const obs = new PerformanceObserver((list) => cb(list.getEntries()))
      obs.observe({ type, buffered: true })
      this.observers.push(obs)
    } catch {
      /* entry type 不支持 */
    }
  }

  private report(name: string, value: number, unit: string): void {
    if (value <= 0 || !isFinite(value)) return
    this.onReport({
      category: 'performance',
      name,
      value: Math.round(value * 100) / 100,
      unit,
      rating: rating(name, value),
      timestamp: Date.now(),
      url: window.location.href,
      page: window.location.pathname,
    })
  }
}
