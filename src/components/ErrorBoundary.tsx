import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NetRoute error boundary', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-sm text-[var(--text-muted)]">
            {this.state.error.message}. Try reloading the page or resetting the network from the
            simulator.
          </p>
          <button
            type="button"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
