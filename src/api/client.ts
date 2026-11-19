import { mockApi } from './mock'
import type { Api } from './types'

// There is no EcoSure backend yet. When there is, implement `Api` with fetch
// calls here and drop the mock; no screen needs to change.
export const api: Api = mockApi
