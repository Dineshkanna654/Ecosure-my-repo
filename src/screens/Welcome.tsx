import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Icon } from '../components/Icon'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { IconBadge, StatusPill } from '../components/ui'
import { usdShort } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useHost } from '../sdk/context'

export function Welcome() {
  const navigate = useNavigate()
  const { sdk } = useHost()
  const query = useAsync(async () => {
    const [policy, packages] = await Promise.all([api.getPolicy(), api.getPackages()])
    return { policy, packages }
  })

  if (query.state.status !== 'ready') {
    return (
      <Screen title="EcoSure">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const { policy, packages } = query.state.data
  const from = Math.min(...packages.map((p) => p.price))

  return (
    <Screen title="EcoSure">
      <section className="hero">
        <div>
          <h2>Health cover from {usdShort(from)} a month</h2>
          <p>For you and your family, paid from your EcoCash wallet.</p>
        </div>
        <span className="hero-badge">
          <Icon name="shield" size={22} />
        </span>
      </section>

      <h2 className="heading">EcoSure Health</h2>
      <button type="button" className="card row" onClick={() => navigate(policy ? '/policy' : '/med/package')}>
        <IconBadge name="shield" />
        <span className="row-text">
          <span className="row-title">EcoSureMed</span>
          <span className="row-sub">{policy ? 'View my policy' : 'Care, Plus or Prime'}</span>
        </span>
        <Icon name="chevron" size={18} />
      </button>
      <button type="button" className="card row" onClick={() => sdk.toast('Individual products are coming soon')}>
        <IconBadge name="user" />
        <span className="row-text">
          <span className="row-title">Individual products</span>
          <span className="row-sub">Cover just for you</span>
        </span>
        <Icon name="chevron" size={18} />
      </button>

      <h2 className="heading">EcoSure Funeral</h2>
      <div className="card row row-disabled" aria-disabled="true">
        <IconBadge name="flower" tone="muted" />
        <span className="row-text">
          <span className="row-title">EcoSure Funeral</span>
          <span className="row-sub">Not available in the app yet</span>
        </span>
        <StatusPill tone="neutral">Soon</StatusPill>
      </div>
    </Screen>
  )
}
