// In-memory stand-in for the EcoSure backend. Everything that matters
// (prices, totals, payment status) is decided here, as it must be on the
// real server. State lives in sessionStorage so a reload keeps the journey.
// Open the app with ?seed=existing to start with the policy drawn in Figma.
import { readIdentity } from '../sdk/identity'
import type { Customer } from '../sdk/identity'
import type { Api, Member, Package, PackageId, PaymentResult, Person, Policy } from './types'

const PACKAGES: Package[] = [
  { id: 'care', name: 'EcoSure Care', planName: 'EcoSureMed Care', price: 5 },
  { id: 'plus', name: 'EcoSure Plus', planName: 'EcoSureMed Plus', price: 7 },
  { id: 'prime', name: 'EcoSure Prime', planName: 'EcoSureMed Prime', price: 10 },
]

// Who the session belongs to. The real server gets this by verifying the identity
// token (signature, issuer, audience, expiry); the mock just reads it.
let session: Customer | null = null
const principalName = () => session?.fullName ?? 'Policy holder'

const DIRECTORY: Record<string, Person> = {
  '0779876543': { fullName: 'Rudo Jacob', idNumber: '63-765432 B 42', dateOfBirth: '1992-08-04', gender: 'Female' },
  '0771112222': { fullName: 'Tanaka Jacob', idNumber: '63-998877 C 42', dateOfBirth: '2012-05-19', gender: 'Male' },
}

interface StoredPolicy {
  number: string
  packageId: PackageId
  status: 'new' | 'active'
  members: Omit<Member, 'monthlyPremium'>[]
  coveredUntil: string | null
  autoDebit: boolean
}
interface Order {
  months: number
  amount: number
  coveredUntil: string
}
interface Db {
  policy: StoredPolicy | null
  orders: Record<string, Order>
}

const KEY = 'ecosure-mock-db'
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const firstOfNextMonth = () => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
}
/** Last day of the month, `months` months of cover from the next collection. */
const coverEnd = (months: number) => {
  const start = firstOfNextMonth()
  return iso(new Date(start.getFullYear(), start.getMonth() + months, 0))
}

function seed(): Db {
  if (!new URLSearchParams(window.location.search).has('seed')) return { policy: null, orders: {} }
  return {
    orders: {},
    policy: {
      number: 'ES-2026-004512',
      packageId: 'plus',
      status: 'active',
      coveredUntil: coverEnd(1),
      autoDebit: true,
      members: [
        { id: 'm1', fullName: '', relationship: null },
        { id: 'm2', fullName: 'Rudo Jacob', relationship: 'Spouse' },
        { id: 'm3', fullName: 'Tanaka Jacob', relationship: 'Child below 18' },
      ],
    },
  }
}

function load(): Db {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw && !new URLSearchParams(window.location.search).has('seed')) return JSON.parse(raw) as Db
  } catch {
    // storage unavailable: fall through to a fresh database
  }
  return seed()
}
const db = load()
function save() {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    // storage unavailable: state lasts for this page load only
  }
}

const delay = <T>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), 350))
const fail = (message: string) => Promise.reject(new Error(message))

function view(p: StoredPolicy): Policy {
  const pkg = PACKAGES.find((x) => x.id === p.packageId)!
  return {
    number: p.number,
    package: pkg,
    status: p.status,
    members: p.members.map((m) => ({
      ...m,
      fullName: m.relationship === null ? principalName() : m.fullName, // the principal is the session's customer
      monthlyPremium: pkg.price,
    })),
    monthlyPremium: pkg.price * p.members.length,
    nextCollection: iso(firstOfNextMonth()),
    coveredUntil: p.coveredUntil,
    autoDebit: p.autoDebit,
  }
}

export const mockApi: Api = {
  openSession(token) {
    session = readIdentity(token)
    return delay(undefined)
  },
  getPackages: () => delay(PACKAGES),
  getPolicy: () => delay(db.policy ? view(db.policy) : null),

  register(packageId) {
    if (db.policy) return fail('A policy already exists')
    db.policy = {
      number: `ES-${new Date().getFullYear()}-00${4512 + Math.floor(Math.random() * 400)}`,
      packageId,
      status: 'new',
      members: [{ id: 'm1', fullName: '', relationship: null }],
      coveredUntil: null,
      autoDebit: true,
    }
    save()
    return delay(view(db.policy))
  },

  quotePayment(months) {
    if (!db.policy) return fail('No policy')
    const monthlyPremium = view(db.policy).monthlyPremium
    return delay({ months, monthlyPremium, total: monthlyPremium * months, coversUntil: coverEnd(months) })
  },

  createPayment(months) {
    if (!db.policy) return fail('No policy')
    const orderRef = `ORD-${Date.now()}`
    db.orders[orderRef] = {
      months,
      amount: view(db.policy).monthlyPremium * months,
      coveredUntil: coverEnd(months),
    }
    save()
    return delay({ signedRequest: `mock-signed-request.${orderRef}`, orderRef })
  },

  getPayment(orderRef) {
    const order = db.orders[orderRef]
    if (!db.policy || !order) return fail('Unknown order')
    // The real server learns this from the EcoCash payment callback.
    db.policy.status = 'active'
    db.policy.coveredUntil = order.coveredUntil
    save()
    const policy = view(db.policy)
    const result: PaymentResult = {
      status: 'paid',
      orderRef,
      policyNumber: policy.number,
      planName: policy.package.planName,
      ...order,
    }
    return delay(result)
  },

  lookupByEcoCashNumber: (msisdn) => delay(DIRECTORY[msisdn.replace(/\D/g, '')] ?? null),

  addMember(relationship, person) {
    if (!db.policy) return fail('No policy')
    db.policy.members.push({ id: `m${Date.now()}`, fullName: person.fullName, relationship })
    save()
    return delay(view(db.policy))
  },

  setAutoDebit(enabled) {
    if (!db.policy) return fail('No policy')
    db.policy.autoDebit = enabled
    save()
    return delay(view(db.policy))
  },
}
