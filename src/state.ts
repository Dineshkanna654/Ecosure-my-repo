import { createContext, useContext } from 'react'
import type { PackageId } from './api/types'
import type { Customer } from './sdk/identity'

export interface AppState {
  /** The signed-in EcoCash customer, read from the SDK identity token. */
  customer: Customer
  /** Package picked during enrolment, kept while moving between the two steps. */
  draftPackage: PackageId
  setDraftPackage: (id: PackageId) => void
  /** Set once registration succeeds, so backing into the enrolment steps skips past them. */
  enrolled: boolean
  setEnrolled: (enrolled: boolean) => void
}

export const AppStateContext = createContext<AppState | null>(null)

export function useAppState(): AppState {
  const state = useContext(AppStateContext)
  if (!state) throw new Error('useAppState used outside AppStateContext')
  return state
}
