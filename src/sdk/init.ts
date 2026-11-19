import type { Host } from './types'

/**
 * Builds the SDK once at start-up. Inside EcoCash this is the real bridge.
 * In `npm run dev` outside EcoCash it is the dev mock, which is tree-shaken
 * out of production builds. Anywhere else it rejects with UNAVAILABLE.
 */
export async function initSdk(): Promise<Host> {
  const MiniApp = window.MiniApp
  if (MiniApp?.isInSuperApp) {
    const sdk = await MiniApp.build(MiniApp.Constants.Species.web, {
      debug: import.meta.env.DEV,
    })
    return { sdk, hosted: true }
  }
  if (import.meta.env.DEV) {
    const { createDevSdk } = await import('./devMock')
    return { sdk: createDevSdk(), hosted: false }
  }
  throw Object.assign(new Error('Not running inside EcoCash'), { code: 'UNAVAILABLE' })
}
