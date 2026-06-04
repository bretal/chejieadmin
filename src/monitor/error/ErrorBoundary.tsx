import { Component, type ErrorInfo, type ReactNode } from 'react'
import { MonitorSDK } from '../core/MonitorSDK'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    try {
      MonitorSDK.getInstance().reportReactError(error, info.componentStack ?? undefined)
    } catch {
      /* silent */
    }
    this.props.onError?.(error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 200,
            color: '#999',
            fontSize: 14,
          }}
        >
          页面渲染异常，已自动上报。请刷新页面重试。
        </div>
      )
    }
    return this.props.children
  }
}
