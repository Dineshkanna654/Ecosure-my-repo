import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Button, DetailList, StatusPill, SuccessTick } from '../components/ui'
import { usd } from '../lib/format'
import { useAsync } from '../lib/useAsync'

export function Registered() {
  const navigate = useNavigate()
  const query = useAsync(api.getPolicy)

  if (query.state.status !== 'ready') {
    return (
      <Screen title="EcoSureMed">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const policy = query.state.data
  if (!policy) return <Navigate to="/" replace />

  // Both exits replace this screen, so back never returns to the celebration.
  const toPolicy = () => navigate('/policy', { replace: true })
  const toPayment = () => {
    navigate('/policy', { replace: true })
    navigate('/policy/pay')
  }

  return (
    <Screen
      title="EcoSureMed"
      footer={
        <>
          <Button onClick={toPolicy}>Go to my policy</Button>
          <Button variant="text" onClick={toPayment}>
            Pay first premium now
          </Button>
        </>
      }
    >
      <div className="celebrate">
        <SuccessTick />
        <h2 className="title">You're registered</h2>
        <p className="sub">Your cover starts once your first premium is collected from your wallet.</p>
      </div>
      <DetailList
        rows={[
          ['Policy number', policy.number],
          ['Package', policy.package.name],
          ['Monthly premium', usd(policy.monthlyPremium)],
          [
            'Status',
            policy.status === 'new' ? <StatusPill tone="warning">New</StatusPill> : <StatusPill tone="success">Active</StatusPill>,
          ],
        ]}
      />
    </Screen>
  )
}
