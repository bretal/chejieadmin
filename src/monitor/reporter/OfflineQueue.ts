import type { MonitorPayload } from '../types'

export class OfflineQueue {
  private key: string
  private max: number

  constructor(key: string, max: number) {
    this.key = key
    this.max = max
  }

  save(events: MonitorPayload[]): void {
    try {
      const existing = this.getAll()
      existing.push(...events)
      if (existing.length > this.max) {
        existing.splice(0, existing.length - this.max)
      }
      localStorage.setItem(this.key, JSON.stringify(existing))
    } catch {
      try {
        localStorage.removeItem(this.key)
        localStorage.setItem(this.key, JSON.stringify(events.slice(-this.max)))
      } catch {
        /* localStorage 不可用，放弃 */
      }
    }
  }

  getAll(): MonitorPayload[] {
    try {
      const raw = localStorage.getItem(this.key)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key)
    } catch {
      /* silent */
    }
  }
}
