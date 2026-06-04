import type { PerformancePayload } from '../types'

export class NavigationTimingModule {
  private onReport: (m: PerformancePayload) => void

  constructor(onReport: (m: PerformancePayload) => void) {
    this.onReport = onReport
  }

  collect(): void {
    if (document.readyState === 'complete') {
      setTimeout(() => this.doCollect(), 0)
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.doCollect(), 0)
      }, { once: true })
    }
  }

  private doCollect(): void {
    try {
      const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
      if (entries.length > 0) {
        this.collectModern(entries[0])
      } else {
        this.collectLegacy()
      }
    } catch {
      /* silent */
    }
  }

  private collectModern(nav: PerformanceNavigationTiming): void {
    // DNS
    const dns = nav.domainLookupEnd - nav.domainLookupStart
    if (dns > 0) this.report('dns_time', dns)

    // TCP (不含 TLS)
    const tcpEnd = nav.secureConnectionStart > 0 ? nav.secureConnectionStart : nav.connectEnd
    const tcp = tcpEnd - nav.connectStart
    if (tcp > 0) this.report('tcp_time', tcp)

    // TLS
    if (nav.secureConnectionStart > 0) {
      const tls = nav.connectEnd - nav.secureConnectionStart
      if (tls > 0) this.report('tls_time', tls)
    }

    // TTFB
    const ttfb = nav.responseStart - nav.requestStart
    if (ttfb > 0) this.report('ttfb', ttfb, 'ms')

    // 请求耗时
    const reqTime = nav.responseStart - nav.requestStart
    if (reqTime > 0) this.report('request_time', reqTime)

    // 响应耗时
    const resTime = nav.responseEnd - nav.responseStart
    if (resTime > 0) this.report('response_time', resTime)

    // 白屏时间 → 用 domInteractive 近似
    const whiteScreen = nav.domInteractive - nav.startTime
    if (whiteScreen > 0) this.report('white_screen', whiteScreen)

    // 首屏时间 → 用 domContentLoadedEventEnd 近似
    const firstScreen = nav.domContentLoadedEventEnd - nav.startTime
    if (firstScreen > 0) this.report('first_screen', firstScreen)
  }

  private collectLegacy(): void {
    try {
      const t = performance.timing
      if (!t || t.navigationStart === 0) return

      const dns = t.domainLookupEnd - t.domainLookupStart
      if (dns > 0) this.report('dns_time', dns)

      const tcp = t.connectEnd - t.connectStart
      if (tcp > 0) this.report('tcp_time', tcp)

      const ttfb = t.responseStart - t.requestStart
      if (ttfb > 0) this.report('ttfb', ttfb, 'ms')

      const firstScreen = t.domContentLoadedEventEnd - t.navigationStart
      if (firstScreen > 0) this.report('first_screen', firstScreen)
    } catch {
      /* silent */
    }
  }

  private report(name: string, value: number, unit = 'ms'): void {
    if (value <= 0 || !isFinite(value)) return
    this.onReport({
      category: 'performance',
      name,
      value: Math.round(value * 100) / 100,
      unit,
      timestamp: Date.now(),
      url: window.location.href,
      page: window.location.pathname,
    })
  }
}
