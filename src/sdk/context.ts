import { createContext, useContext } from 'react'
import type { Host } from './types'

export const HostContext = createContext<Host | null>(null)

export function useHost(): Host {
  const host = useContext(HostContext)
  if (!host) throw new Error('useHost used outside HostContext')
  return host
}
