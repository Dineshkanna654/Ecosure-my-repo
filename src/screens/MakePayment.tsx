import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Button, ChipGroup, InfoBanner } from '../components/ui'
import { listNames, shortDate, usd } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useHost } from '../sdk/context'
import { isDismissal } from '../sdk/types'

const MONTH_OPTIONS = [1, 2, 3, 6, 12] as const

export function MakePayment() {
  const navigate = useNavigate()
  const { sdk } = useHost()
  const [months, setMonths] = useState<number>(3)
  const [busy, setBusy] = useState(false)
  // The server prices the payment; the page only displays what it returns.
  const query = useAsync(async () => {
    const [policy, quote] = await Promise.all([api.getPolicy(), api.quotePayment(months)])
    return { policy, quote }
  }, months)

  if (query.state.status === 'error') {
    return (
      <Screen title="Make a payment">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const data = query.state.status === 'ready' ? query.state.data : null
  if (data && !data.policy) return <Navigate to="/" replace />

  const pay = async () => {
    if (!data?.policy) return
    setBusy(true)
    try {
      const { signedRequest, orderRef } = await api.createPayment(months)
      // EcoCash shows its own confirmation sheet and collects the PIN.
      await sdk.openPaymentsPage('EcoSure Health', signedRequest, undefined, [
        { Policy: data.policy.number },
        { Product: data.policy.package.planName },
        { Months: `${months} ${months === 1 ? 'month' : 'months'}` },
      ])
      // Resolution is only a cue. The result screen asks our server for the truth.
      navigate(`/policy/pay/result?ref=${encodeURIComponent(orderRef)}`, { replace: true })
    } catch (error) {
      setBusy(false)
      if (!isDismissal(error)) sdk.toast('The payment could not be started. Please try again.')
    }
  }

  const covered = data?.policy
    ? listNames(data.policy.members.map((m) => (m.relationship === null ? 'you' : m.fullName.split(' ')[0])))
    : ''

  return (
    <Screen
      title="Make a payment"
      footer={
        <Button busy={busy} disabled={!data} onClick={pay}>
          {data ? `Pay ${usd(data.quote.total)}` : 'Pay'}
        </Button>
      }
    >
      <h2 className="heading">How many months?</h2>
      <ChipGroup label="Months" layout="equal" options={MONTH_OPTIONS} value={months} onChange={setMonths} />
      <dl className="details details-grey" aria-busy={!data}>
        <div>
          <dt>Monthly premium</dt>
          <dd>{data ? usd(data.quote.monthlyPremium) : '…'}</dd>
        </div>
        <div>
          <dt>Months</dt>
          <dd>{months}</dd>
        </div>
        <div className="total">
          <dt>Total</dt>
          <dd>{data ? usd(data.quote.total) : '…'}</dd>
        </div>
      </dl>
      {data && (
        <InfoBanner>
          Covers {covered} until {shortDate(data.quote.coversUntil)}.
        </InfoBanner>
      )}
    </Screen>
  )
}
