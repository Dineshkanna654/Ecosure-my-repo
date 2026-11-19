import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Avatar, IconBadge, StatusPill } from '../components/ui'
import type { IconName } from '../components/Icon'
import { initials, localMsisdn, memberRole, shortDate, usd } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useHost } from '../sdk/context'
import { useAppState } from '../state'

export function PolicyHome() {
  const navigate = useNavigate()
  const { sdk } = useHost()
  const { customer } = useAppState()
  const query = useAsync(api.getPolicy)

  if (query.state.status !== 'ready') {
    return (
      <Screen title="EcoSure Health">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const policy = query.state.data
  if (!policy) return <Navigate to="/" replace />
  // The holder's own details come from the EcoCash identity token.
  const holderName = customer.fullName ?? 'EcoCash customer'

  const soon = (what: string) => () => sdk.toast(`${what} is coming soon`)
  const tiles: { icon: IconName; label: string; onClick: () => void }[] = [
    { icon: 'card', label: 'Make a payment', onClick: () => navigate('/policy/pay') },
    { icon: 'gift', label: 'Sponsor someone', onClick: soon('Sponsor someone') },
    { icon: 'gear', label: 'Manage policy', onClick: () => navigate('/policy/manage') },
    { icon: 'help', label: 'Help', onClick: soon('Help') },
  ]

  return (
    <Screen title="EcoSure Health">
      <div className="card row">
        <span className="avatar avatar-lg" aria-hidden="true">
          {initials(holderName)}
        </span>
        <span className="row-text">
          <span className="row-title holder-name">{holderName}</span>
          <span className="row-sub">{customer.msisdn ? `${localMsisdn(customer.msisdn)}, policy holder` : 'Policy holder'}</span>
        </span>
      </div>

      <section className="policy-card">
        <div className="policy-card-top">
          <div>
            <h2>{policy.package.planName}</h2>
            <p>{policy.number}</p>
          </div>
          {policy.status === 'active' ? <StatusPill tone="success">Active</StatusPill> : <StatusPill tone="warning">New</StatusPill>}
        </div>
        <dl className="policy-card-figures">
          <div>
            <dt>Monthly premium</dt>
            <dd>{usd(policy.monthlyPremium)}</dd>
          </div>
          <div>
            <dt>Next collection</dt>
            <dd>{shortDate(policy.nextCollection)}</dd>
          </div>
        </dl>
      </section>

      <div className="tiles">
        {tiles.map((tile) => (
          <button key={tile.label} type="button" className="card tile" onClick={tile.onClick}>
            <IconBadge name={tile.icon} />
            <span className="row-title">{tile.label}</span>
          </button>
        ))}
      </div>

      <div className="section-head">
        <h2 className="heading">Covered members</h2>
        <span className="count">{policy.members.length}</span>
      </div>
      <ul className="card list">
        {policy.members.map((member) => (
          <li key={member.id}>
            <div className="row">
              <Avatar name={member.fullName} />
              <span className="row-text">
                <span className="row-title">{member.fullName}</span>
                <span className="row-sub">{memberRole(member)}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Screen>
  )
}
