export type PackageId = 'care' | 'plus' | 'prime'

export interface Package {
  id: PackageId
  /** "EcoSure Plus" */
  name: string
  /** "EcoSureMed Plus" */
  planName: string
  /** USD per member per month */
  price: number
}

export type Gender = 'Male' | 'Female'

export interface Person {
  fullName: string
  idNumber: string
  /** ISO date, yyyy-mm-dd */
  dateOfBirth: string
  gender: Gender
}

export const RELATIONSHIPS = [
  'Spouse',
  'Child below 18',
  'Child above 18',
  'Father',
  'Mother',
  'Father in law',
  'Mother in law',
] as const
export type Relationship = (typeof RELATIONSHIPS)[number]

export interface Member {
  id: string
  fullName: string
  /** null for the principal member */
  relationship: Relationship | null
  monthlyPremium: number
}

export interface Policy {
  number: string
  package: Package
  status: 'new' | 'active'
  members: Member[]
  monthlyPremium: number
  /** ISO date */
  nextCollection: string
  /** ISO date, null until the first premium is paid */
  coveredUntil: string | null
  autoDebit: boolean
}

export interface PaymentQuote {
  months: number
  monthlyPremium: number
  total: number
  /** ISO date cover would run to */
  coversUntil: string
}

export interface PaymentRequest {
  /** Opaque, server-signed; handed to sdk.openPaymentsPage unchanged. */
  signedRequest: string
  orderRef: string
}

export interface PaymentResult {
  status: 'paid' | 'pending' | 'failed'
  orderRef: string
  policyNumber: string
  planName: string
  months: number
  amount: number
  coveredUntil: string
}

/** The contract between the page and the EcoSure backend. */
export interface Api {
  /**
   * Hand the EcoCash identity token to the server, which verifies it and opens a
   * session. Returns nothing: the customer's details reach the page from the SDK
   * (see sdk/identity.ts), not from here.
   */
  openSession(token: string): Promise<void>
  getPackages(): Promise<Package[]>
  getPolicy(): Promise<Policy | null>
  register(packageId: PackageId): Promise<Policy>
  quotePayment(months: number): Promise<PaymentQuote>
  /** The server sets and signs the amount; the page never does. */
  createPayment(months: number): Promise<PaymentRequest>
  /** The true payment status, from the server. */
  getPayment(orderRef: string): Promise<PaymentResult>
  lookupByEcoCashNumber(msisdn: string): Promise<Person | null>
  addMember(relationship: Relationship, person: Person): Promise<Policy>
  setAutoDebit(enabled: boolean): Promise<Policy>
}
