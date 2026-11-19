import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Icon } from '../components/Icon'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Button, DetailList, SuccessTick } from '../components/ui'
import { shortDate, usd } from '../lib/format'
import { useBack } from '../lib/useBack'
import { useAsync } from '../lib/useAsync'

/** Our own outcome screen. The PIN sheet and the EcoCash receipt belong to the host app. */
export function PaymentResult() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const orderRef = params.get('ref') ?? ''
  const query = useAsync(() => api.getPayment(orderRef), orderRef)
  const done = useBack('/policy')

  if (query.state.status !== 'ready') {
    return (
      <Screen title="Payment">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const payment = query.state.data

  if (payment.status === 'pending') {
    return (
      <Screen
        title="Payment"
        footer={
          <>
            <Button onClick={query.reload}>Check again</Button>
            <Button variant="text" onClick={done}>
              Back to my policy
            </Button>
          </>
        }
      >
        <div className="celebrate">
          <span className="spinner spinner-lg" />
          <h2 className="title">Confirming your payment</h2>
          <p className="sub">This can take a moment. You will get an SMS from EcoCash when it is done.</p>
        </div>
      </Screen>
    )
  }

  if (payment.status === 'failed') {
    return (
      <Screen
        title="Payment"
        footer={
          <>
            <Button onClick={() => navigate('/policy/pay', { replace: true })}>Try again</Button>
            <Button variant="text" onClick={done}>
              Back to my policy
            </Button>
          </>
        }
      >
        <div className="celebrate">
          <span className="state-icon failed">
            <Icon name="alert" size={40} />
          </span>
          <h2 className="title">Payment not completed</h2>
          <p className="sub">No money has left your wallet. Your cover is unchanged.</p>
        </div>
      </Screen>
    )
  }

  return (
    <Screen title="Payment" footer={<Button onClick={done}>Back to my policy</Button>}>
      <div className="celebrate">
        <SuccessTick />
        <h2 className="title">Premium paid</h2>
        <p className="sub">Your EcoSureMed cover is active.</p>
      </div>
      <DetailList
        rows={[
          ['Policy', payment.policyNumber],
          ['Service name', payment.planName],
          ['Months', payment.months],
          ['Amount', usd(payment.amount)],
          ['Covered until', shortDate(payment.coveredUntil)],
        ]}
      />
    </Screen>
  )
}
