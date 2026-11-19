import { useCallback, useEffect, useState } from 'react'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; error: unknown }

/** Runs `load` on mount and whenever `key` changes. Every screen gets a loading, ready and error state from this. */
export function useAsync<T>(load: () => Promise<T>, key: string | number = '') {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let live = true
    setState({ status: 'loading' })
    load().then(
      (data) => live && setState({ status: 'ready', data }),
      (error) => live && setState({ status: 'error', error }),
    )
    return () => {
      live = false
    }
    // `load` is intentionally not a dependency: callers pass inline closures and name what matters in `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const setData = useCallback((data: T) => setState({ status: 'ready', data }), [])
  return { state, reload, setData }
}
