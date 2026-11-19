import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Screen } from '../components/Screen'
import { AsyncFallback, ErrorState } from '../components/StateViews'
import { Button, DetailList, IconBadge, Stepper } from '../components/ui'
import { numericDate, usdShort } from '../lib/format'
import { useBack } from '../lib/useBack'
import { useAsync } from '../lib/useAsync'
import { useHost } from '../sdk/context'
import { useAppState } from '../state'

export function ConfirmDetails() {
  const navigate = useNavigate()
  const { sdk } = useHost()
  const { customer, draftPackage, setEnrolled } = useAppState()
  const query = useAsync(api.getPackages)
  const [busy, setBusy] = useState(false)
  const back = useBack('/med/package')

  if (query.state.status !== 'ready') {
    return (
      <Screen title="EcoSureMed">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const pkg = query.state.data.find((p) => p.id === draftPackage)!

  // These come from the customer's EcoCash details (the SDK identity token), not from our API.
  const { fullName, idNumber, dateOfBirth, gender } = customer
  if (!fullName || !idNumber || !dateOfBirth || !gender) {
    return (
      <Screen title="EcoSureMed">
        <ErrorState message="EcoCash did not share the details needed to register. Please check your EcoCash profile, or call 147 for help." />
      </Screen>
    )
  }

  const register = async () => {
    setBusy(true)
    try {
      await api.register(pkg.id)
      setEnrolled(true)
      navigate('/med/registered', { replace: true })
    } catch {
      setBusy(false)
      sdk.toast('We could not register you. Please try again.')
    }
  }

  return (
    <Screen
      title="EcoSureMed"
      footer={
        <>
          <Button busy={busy} onClick={register}>
            I accept and register
          </Button>
          <Button variant="text" disabled={busy} onClick={() => sdk.close('cancelled')}>
            Cancel and exit
          </Button>
        </>
      }
    >
      <Stepper label="Confirm" step={2} of={2} />
      <h2 className="title">Confirm your details</h2>
      <div className="card row">
        <IconBadge name="shield" />
        <span className="row-text">
          <span className="row-title">{pkg.name}</span>
          <span className="row-sub">{usdShort(pkg.price)} a month</span>
        </span>
        <Button variant="text" small onClick={back}>
          Change
        </Button>
      </div>
      <DetailList
        rows={[
          ['Full name', fullName],
          ['ID number', idNumber],
          ['Date of birth', numericDate(dateOfBirth)],
          ['Gender', gender],
        ]}
      />
      <div className="card terms">
        <h3 className="row-title">Terms and conditions</h3>
        <p className="sub">A full list of terms and conditions are found at www.Ecosurehealth.co.zw or any Econet outlet.</p>
      </div>
    </Screen>
  )
}
