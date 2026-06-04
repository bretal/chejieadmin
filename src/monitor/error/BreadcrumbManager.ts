import type { Breadcrumb } from '../types'

export class BreadcrumbManager {
  private ring: Breadcrumb[] = []
  private max: number

  constructor(max: number) {
    this.max = max
  }

  add(bc: Breadcrumb): void {
    this.ring.push(bc)
    if (this.ring.length > this.max) {
      this.ring.splice(0, this.ring.length - this.max)
    }
  }

  getAll(): Breadcrumb[] {
    return [...this.ring]
  }

  clear(): void {
    this.ring = []
  }
}
