import type { Member } from '../api/types'

export const memberRole = (member: Member) => member.relationship ?? 'You, principal member'

export const usd = (amount: number) => `USD ${amount.toFixed(2)}`
export const usdShort = (amount: number) => `USD ${Number.isInteger(amount) ? amount : amount.toFixed(2)}`

/** "263771234567" or "0771234567" → "077 123 4567". Anything else is returned as given. */
export function localMsisdn(msisdn: string) {
  const digits = msisdn.replace(/\D/g, '').replace(/^263/, '0')
  return /^0\d{9}$/.test(digits) ? `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}` : msisdn
}

const parse = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** "1 Dec 2026" */
export const shortDate = (iso: string) =>
  parse(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

/** "12/03/1990" */
export const numericDate = (iso: string) =>
  /^\d{4}-\d{2}-\d{2}/.test(iso) ? parse(iso.slice(0, 10)).toLocaleDateString('en-GB') : iso

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

/** "you, Rudo and Tanaka" */
export function listNames(names: string[]) {
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
