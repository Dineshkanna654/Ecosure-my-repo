// The signed-in customer's details come from the EcoCash Super App, inside the
// identity token that sdk.fetchAuthToken() returns. They never come from our API.
// This file is the only place that knows the token's shape.
//
// The page reads the claims for DISPLAY only. It cannot verify the signature, so
// nothing here is trusted: the backend verifies the same token (signature, iss,
// aud, exp) and uses its own verified copy of the claims when it registers a policy.

/** Claim names in the token payload. */
const CLAIMS = {
  // Documented at https://superapp.ecocash.co.zw/miniapp/doc/sso.html
  sub: 'sub',
  fullName: 'name',
  msisdn: 'mobileNumber',
  // Extra claims granted to this mini app at design review.
  // TODO(EcoCash): names and formats are not documented yet; confirm and change here only.
  idNumber: 'idNumber',
  dateOfBirth: 'dateOfBirth',
  gender: 'gender',
} as const

export interface Customer {
  /** Stable, opaque id for this customer in this mini app. */
  sub: string
  fullName: string | null
  /** As EcoCash sends it, e.g. "263771234567". */
  msisdn: string | null
  idNumber: string | null
  dateOfBirth: string | null
  gender: string | null
}

function decodePayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))
    if (typeof payload === 'object' && payload !== null) return payload as Record<string, unknown>
  } catch {
    // fall through
  }
  throw Object.assign(new Error('The identity token could not be read'), { code: 'INVALID' })
}

/** Reads the customer out of the identity token. A claim that was not shared is null. */
export function readIdentity(token: string): Customer {
  const payload = decodePayload(token)
  const text = (claim: string) => {
    const value = payload[claim]
    return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
  }
  const sub = text(CLAIMS.sub)
  if (!sub) throw Object.assign(new Error('The identity token has no subject'), { code: 'INVALID' })
  return {
    sub,
    fullName: text(CLAIMS.fullName),
    msisdn: text(CLAIMS.msisdn),
    idNumber: text(CLAIMS.idNumber),
    dateOfBirth: text(CLAIMS.dateOfBirth),
    gender: text(CLAIMS.gender),
  }
}
