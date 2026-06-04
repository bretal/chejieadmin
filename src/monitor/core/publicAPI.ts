import { MonitorSDK } from './MonitorSDK'
import type { MonitorConfig } from '../types'

let sdk: MonitorSDK | null = null

export function initMonitor(config?: Partial<MonitorConfig>): void {
  if (sdk) return
  sdk = MonitorSDK.getInstance()
  sdk.init(config)
}

export function track(
  action: string,
  label?: string,
  value?: number,
  extra?: Record<string, unknown>,
): void {
  sdk?.track(action, label, value, extra)
}

export function getMonitorSDK(): MonitorSDK | null {
  return sdk
}
