// Types for the EcoCash Mini App SDK (window.MiniApp), from
// https://superapp.ecocash.co.zw/miniapp/doc/api-reference.html

export type Theme = 'light' | 'dark'
export type Unsubscribe = () => void

export interface AppInfo {
  theme: Theme
  platform: 'android' | 'ios'
  appVersion: string
  locale: string
  country: string
}

export interface MiniAppSdk {
  supports(action: string): boolean
  fetchAuthToken(): Promise<{ token: string; expiresIn: number }>
  /** `context` is the payment request signed by our server; opaque to the page. */
  openPaymentsPage(
    merchantName: string,
    context: string,
    imageURL?: string,
    metaData?: Record<string, string>[],
  ): Promise<unknown>
  getAppInfo(): Promise<AppInfo>
  setTitle(title: string): Promise<unknown>
  setNavBar(visible: boolean): Promise<unknown>
  close(reason?: string): Promise<unknown>
  toast(message: string): Promise<unknown>
  setData(key: string, value: unknown): Promise<unknown>
  getData(key: string): Promise<unknown>
  removeData(key: string): Promise<unknown>
  readonly theme: Theme
  onThemeChange(handler: (theme: Theme) => void): Unsubscribe
  onPause(handler: () => void): Unsubscribe
  onResume(handler: () => void): Unsubscribe
  onClose(handler: () => void): Unsubscribe
}

export interface MiniAppGlobal {
  readonly isInSuperApp: boolean
  Constants: { Species: { web: unknown } }
  build(species: unknown, options?: { debug?: boolean }): Promise<MiniAppSdk>
}

declare global {
  interface Window {
    MiniApp?: MiniAppGlobal
  }
}

export interface Host {
  sdk: MiniAppSdk
  /** true inside the EcoCash Super App, false on the browser dev mock */
  hosted: boolean
}

/** The `code` the SDK puts on a rejected promise, or "FAILED". */
export function errorCode(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    return String((error as { code: unknown }).code)
  }
  return 'FAILED'
}

/** Codes that mean the customer backed out; return quietly, do not announce. */
export function isDismissal(error: unknown): boolean {
  return ['CANCELLED', 'PAYMENT_DISMISS', 'CONSENT_DECLINED'].includes(errorCode(error))
}
