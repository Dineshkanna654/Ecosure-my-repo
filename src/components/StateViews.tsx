import type { AsyncState } from '../lib/useAsync'
import { Icon } from './Icon'
import { Button } from './ui'

export function Loading() {
  return (
    <div className="state" role="status" aria-label="Loading">
      <span className="spinner spinner-lg" />
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="state" role="alert">
      <span className="state-icon">
        <Icon name="alert" size={28} />
      </span>
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

/** What a screen shows while its data is not ready. */
export function AsyncFallback({ state, reload }: { state: AsyncState<unknown>; reload: () => void }) {
  return state.status === 'error' ? <ErrorState onRetry={reload} /> : <Loading />
}
