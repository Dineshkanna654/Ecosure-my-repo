import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Button, InfoBanner, Stepper } from '../components/ui'
import { usdShort } from '../lib/format'
import { useBack } from '../lib/useBack'
import { useAsync } from '../lib/useAsync'
import { useAppState } from '../state'

export function ChoosePackage() {
  const navigate = useNavigate()
  const { draftPackage, setDraftPackage, enrolled } = useAppState()
  const query = useAsync(api.getPackages)
  const back = useBack('/policy')

  // Back from the policy after registering: this step is over, keep going back.
  const left = useRef(false)
  useEffect(() => {
    if (enrolled && !left.current) {
      left.current = true // once only, even when effects run twice
      back()
    }
  }, [enrolled, back])

  if (enrolled || query.state.status !== 'ready') {
    return (
      <Screen title="EcoSureMed">
        <AsyncFallback {...query} />
      </Screen>
    )
  }

  return (
    <Screen title="EcoSureMed" footer={<Button onClick={() => navigate('/med/confirm')}>Continue</Button>}>
      <Stepper label="Package" step={1} of={2} />
      <div>
        <h2 className="title">Choose your package</h2>
        <p className="sub lead">Monthly premium per member. Family members you add later share your package.</p>
      </div>
      <div className="packages" role="radiogroup" aria-label="Package">
        {query.state.data.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            role="radio"
            aria-checked={pkg.id === draftPackage}
            className="card row package"
            onClick={() => setDraftPackage(pkg.id)}
          >
            <span className="radio" />
            <span className="row-text">
              <span className="row-title">{pkg.name}</span>
              <span className="row-sub">Benefits to be confirmed</span>
            </span>
            <span className="package-price">
              <strong>{usdShort(pkg.price)}</strong>
              <span className="row-sub">a month</span>
            </span>
          </button>
        ))}
      </div>
      <InfoBanner>Your cover starts once your first premium is collected.</InfoBanner>
    </Screen>
  )
}
