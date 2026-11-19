import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Go back one history entry, as the hardware back button would. If this screen
 * is the first entry (opened by deep link or reload), go to `fallback` instead.
 */
export function useBack(fallback: string) {
  const navigate = useNavigate()
  return useCallback(() => {
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (index > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [navigate, fallback])
}
