import type { ErrorPayload } from '../types'
import type { BreadcrumbManager } from './BreadcrumbManager'

export class GlobalErrorCapture {
  private prevOnError: OnErrorEventHandler | null = null
  private onReport: (ev: ErrorPayload) => void
  private breadcrumbs: BreadcrumbManager

  constructor(onReport: (ev: ErrorPayload) => void, breadcrumbs: BreadcrumbManager) {
    this.onReport = onReport
    this.breadcrumbs = breadcrumbs
  }

  setup(): void {
    this.prevOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      try {
        this.onReport({
          category: 'error',
          name: error?.name || 'RuntimeError',
          message: typeof message === 'string' ? message : String(message),
          stack: error?.stack || '',
          lineno: lineno ?? undefined,
          colno: colno ?? undefined,
          filename: source ?? undefined,
          timestamp: Date.now(),
          url: window.location.href,
          page: window.location.pathname,
          source: 'runtime',
          breadcrumbs: this.breadcrumbs.getAll(),
        })
      } catch {
        /* 监控代码自身错误不传播 */
      }
      if (this.prevOnError) {
        return this.prevOnError.call(window, message, source, lineno, colno, error)
      }
      return false
    }

    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      try {
        const reason = event.reason
        const message = reason?.message ?? String(reason)
        const stack = reason?.stack ?? ''
        this.onReport({
          category: 'error',
          name: reason?.name || 'UnhandledRejection',
          message,
          stack,
          timestamp: Date.now(),
          url: window.location.href,
          page: window.location.pathname,
          source: 'promise',
          breadcrumbs: this.breadcrumbs.getAll(),
        })
      } catch {
        /* silent */
      }
    })
  }

  teardown(): void {
    if (this.prevOnError !== null) {
      window.onerror = this.prevOnError
    }
  }
}
