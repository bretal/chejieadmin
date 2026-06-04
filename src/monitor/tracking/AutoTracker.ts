import type { TrackPayload, MonitorConfig } from '../types'
import type { BreadcrumbManager } from '../error/BreadcrumbManager'

export class AutoTracker {
  private clickHandler: ((e: MouseEvent) => void) | null = null
  private origPushState: typeof history.pushState
  private origReplaceState: typeof history.replaceState
  private boundPopState: (() => void) | null = null
  private onReport: (ev: TrackPayload) => void
  private options: MonitorConfig['tracking']
  private breadcrumbs: BreadcrumbManager

  constructor(
    onReport: (ev: TrackPayload) => void,
    options: MonitorConfig['tracking'],
    breadcrumbs: BreadcrumbManager,
  ) {
    this.onReport = onReport
    this.options = options
    this.breadcrumbs = breadcrumbs
    this.origPushState = history.pushState.bind(history)
    this.origReplaceState = history.replaceState.bind(history)
  }

  setup(): void {
    if (this.options.autoTrackClicks) {
      const attr = this.options.clickAttribute
      this.clickHandler = (e: MouseEvent) => {
        try {
          const target = e.target as HTMLElement
          const tracked = target.closest(`[${attr}]`) as HTMLElement | null

          if (tracked) {
            const action = tracked.getAttribute(attr) || 'click'
            const label = tracked.getAttribute(`${attr}-label`) ?? undefined
            this.onReport({
              category: 'track',
              action,
              label,
              timestamp: Date.now(),
              url: window.location.href,
              page: window.location.pathname,
            })
          }

          const text = (target.textContent ?? target.getAttribute('aria-label') ?? '').slice(0, 40)
          if (text) {
            this.breadcrumbs.add({ type: 'click', timestamp: Date.now(), data: text })
          }
        } catch {
          /* silent */
        }
      }
      document.addEventListener('click', this.clickHandler, true)
    }

    if (this.options.autoTrackNav) {
      history.pushState = (...args: Parameters<typeof history.pushState>) => {
        this.origPushState(...args)
        this.reportRoute('pushState')
      }
      history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
        this.origReplaceState(...args)
        this.reportRoute('replaceState')
      }
      this.boundPopState = () => this.reportRoute('popstate')
      window.addEventListener('popstate', this.boundPopState)
    }
  }

  private reportRoute(from: string): void {
    try {
      this.onReport({
        category: 'track',
        action: 'page_view',
        label: window.location.pathname,
        timestamp: Date.now(),
        url: window.location.href,
        page: window.location.pathname,
        extra: { from },
      })
      this.breadcrumbs.add({
        type: 'navigation',
        timestamp: Date.now(),
        data: window.location.pathname,
      })
    } catch {
      /* silent */
    }
  }

  teardown(): void {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler, true)
      this.clickHandler = null
    }
    if (this.origPushState) {
      history.pushState = this.origPushState
    }
    if (this.origReplaceState) {
      history.replaceState = this.origReplaceState
    }
    if (this.boundPopState) {
      window.removeEventListener('popstate', this.boundPopState)
      this.boundPopState = null
    }
  }
}
