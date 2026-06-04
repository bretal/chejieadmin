import type { MonitorPayload, MonitorConfig } from '../types'
import { OfflineQueue } from './OfflineQueue'

export class Reporter {
  private queue: MonitorPayload[] = []
  private flushing = false
  private lastFlush = 0
  private retryCount = 0
  private flushTimer: ReturnType<typeof setTimeout> | null = null
  private errorDedup = new Map<string, number>()
  private offlineQueue: OfflineQueue
  private config: MonitorConfig['reporter']
  private destroyed = false

  constructor(config: MonitorConfig['reporter']) {
    this.config = config
    this.offlineQueue = new OfflineQueue('_monitor_offline', config.maxOfflineEvents)
    this.recoverOffline()
    this.setupUnloadHandlers()
  }

  enqueue(payload: MonitorPayload): void {
    if (this.destroyed) return

    if (payload.category === 'error') {
      const key = `${payload.name}:${payload.message}`
      const now = Date.now()
      const last = this.errorDedup.get(key)
      if (last && now - last < 5000) return
      this.errorDedup.set(key, now)
      if (this.errorDedup.size > 100) {
        const cutoff = now - 30000
        for (const [k, v] of this.errorDedup) {
          if (v < cutoff) this.errorDedup.delete(k)
        }
      }
    }

    this.queue.push(payload)

    if (this.queue.length >= this.config.batchSize) {
      this.flush()
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.config.flushIntervalMs)
    }
  }

  private flush(): void {
    if (this.destroyed || this.flushing || this.queue.length === 0) return

    const now = Date.now()
    if (now - this.lastFlush < this.config.throttleMs) return

    this.flushing = true
    this.lastFlush = now
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }

    const batch = this.queue.splice(0, this.config.batchSize)
    this.send(batch)
      .then((ok) => {
        if (ok) {
          this.retryCount = 0
          this.flushOffline()
        } else {
          this.retryBatch(batch)
        }
        this.flushing = false
        if (this.queue.length > 0) {
          this.flushTimer = setTimeout(() => this.flush(), this.config.throttleMs)
        }
      })
      .catch(() => {
        this.retryBatch(batch)
        this.flushing = false
      })
  }

  private async send(events: MonitorPayload[]): Promise<boolean> {
    try {
      const body = JSON.stringify({ app: 'chejieadmin', events })
      const blob = new Blob([body], { type: 'application/json' })

      if (navigator.sendBeacon) {
        const sent = navigator.sendBeacon(this.config.reportUrl, blob)
        if (sent) return true
      }

      const res = await fetch(this.config.reportUrl, {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      })
      return res.ok
    } catch {
      this.offlineQueue.save(events)
      return false
    }
  }

  private retryBatch(events: MonitorPayload[]): void {
    this.retryCount++
    if (this.retryCount > this.config.maxRetries) {
      this.offlineQueue.save(events)
      return
    }
    const delay = Math.min(
      this.config.retryBaseDelayMs * Math.pow(2, this.retryCount - 1) + Math.random() * 1000,
      30000,
    )
    setTimeout(() => {
      if (this.destroyed) return
      this.queue.unshift(...events)
      this.flush()
    }, delay)
  }

  private flushSync(): void {
    if (this.queue.length === 0) return
    try {
      const batch = this.queue.splice(0)
      const blob = new Blob(
        [JSON.stringify({ app: 'chejieadmin', events: batch })],
        { type: 'application/json' },
      )
      navigator.sendBeacon?.(this.config.reportUrl, blob)
    } catch {
      /* 卸载阶段只能放弃 */
    }
  }

  private recoverOffline(): void {
    const saved = this.offlineQueue.getAll()
    if (saved.length > 0) {
      this.queue.unshift(...saved)
      this.offlineQueue.clear()
      this.flush()
    }
  }

  private flushOffline(): void {
    const saved = this.offlineQueue.getAll()
    if (saved.length === 0) return
    this.offlineQueue.clear()
    this.send(saved).catch(() => {
      /* 重试失败不阻塞 */
    })
  }

  private setupUnloadHandlers(): void {
    const handler = () => this.flushSync()
    window.addEventListener('beforeunload', handler)
    window.addEventListener('pagehide', handler)
  }

  destroy(): void {
    this.destroyed = true
    if (this.flushTimer) clearTimeout(this.flushTimer)
    this.flushSync()
  }
}
