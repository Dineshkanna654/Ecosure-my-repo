// Development-only stand-in for the EcoCash bridge so the app runs in a
// desktop browser. Imported only behind import.meta.env.DEV; never shipped.
import type { MiniAppSdk, Theme } from './types'

function devToast(message: string) {
  const el = document.createElement('div')
  el.className = 'dev-toast'
  el.setAttribute('role', 'status')
  el.textContent = message
  document.body.append(el)
  setTimeout(() => el.remove(), 2200)
}

// A sample identity token, shaped like the one EcoCash issues (unsigned here).
// Edit these claims to try other customers, or delete one to see the missing-details state.
const base64url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const sampleIdentityToken = () =>
  [
    base64url({ alg: 'none', typ: 'JWT' }),
    base64url({
      iss: 'https://auth.host.example',
      aud: 'zw.co.ecosure.health',
      sub: 'dev-8f2c91ab',
      name: 'Godisable Jacob',
      mobileNumber: '263771234567',
      idNumber: '63-123456 A 42',
      dateOfBirth: '1990-03-12',
      gender: 'Male',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    }),
    'unsigned',
  ].join('.')

const log = (...args: unknown[]) => console.info('[EcoCash mock]', ...args)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const noop = () => () => {}

export function createDevSdk(): MiniAppSdk {
  const dark = window.matchMedia('(prefers-color-scheme: dark)')
  const currentTheme = (): Theme =>
    (document.documentElement.dataset.theme as Theme | undefined) ?? (dark.matches ? 'dark' : 'light')

  return {
    supports: () => true,
    async fetchAuthToken() {
      await wait(300)
      return { token: sampleIdentityToken(), expiresIn: 900 }
    },
    async openPaymentsPage(merchantName, context, _imageURL, metaData) {
      // The real host shows its own confirmation sheet and collects the PIN.
      log('openPaymentsPage', { merchantName, context, metaData })
      await wait(800)
    },
    async getAppInfo() {
      return { theme: currentTheme(), platform: 'android', appVersion: 'dev', locale: 'en-ZW', country: 'ZW' }
    },
    async setTitle(title) {
      log('setTitle', title)
    },
    async setNavBar(visible) {
      log('setNavBar', visible)
    },
    async close(reason) {
      log('close', reason)
      window.location.replace('/')
    },
    async toast(message) {
      devToast(message)
    },
    async setData(key, value) {
      localStorage.setItem(`miniapp:${key}`, JSON.stringify(value))
    },
    async getData(key) {
      const raw = localStorage.getItem(`miniapp:${key}`)
      return raw === null ? null : JSON.parse(raw)
    },
    async removeData(key) {
      localStorage.removeItem(`miniapp:${key}`)
    },
    get theme() {
      return currentTheme()
    },
    onThemeChange(handler) {
      const listener = () => handler(currentTheme())
      dark.addEventListener('change', listener)
      return () => dark.removeEventListener('change', listener)
    },
    onPause: noop,
    onResume: noop,
    onClose: noop,
  }
}
