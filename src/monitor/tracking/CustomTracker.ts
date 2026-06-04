import { MonitorSDK } from '../core/MonitorSDK'

export function trackEvent(
  action: string,
  label?: string,
  value?: number,
  extra?: Record<string, unknown>,
): void {
  MonitorSDK.getInstance().track(action, label, value, extra)
}

export function trackConversion(name: string, value = 1): void {
  MonitorSDK.getInstance().track('conversion', name, value)
}
