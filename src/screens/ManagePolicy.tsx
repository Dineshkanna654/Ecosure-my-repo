import { Navigate, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { Icon } from '../components/Icon'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Avatar, Button, IconBadge, Toggle } from '../components/ui'
import { memberRole, usd, usdShort } from '../lib/format'
import { useAsync } from '../lib/useAsync'
import { useHost } from '../sdk/context'

export function ManagePolicy() {
  const navigate = useNavigate()
  const { sdk } = useHost()
  const query = useAsync(api.getPolicy)

  if (query.state.status !== 'ready') {
    return (
      <Screen title="Manage policy">
        <AsyncFallback {...query} />
      </Screen>
    )
  }
  const policy = query.state.data
  if (!policy) return <Navigate to="/" replace />

  const setAutoDebit = async (enabled: boolean) => {
    query.setData({ ...policy, autoDebit: enabled }) // show it at once, undo on failure
    try {
      query.setData(await api.setAutoDebit(enabled))
    } catch {
      query.setData(policy)
      sdk.toast('We could not change auto debit. Please try again.')
    }
  }

  return (
    <Screen title="Manage policy">
      <div className="card row">
        <IconBadge name="shield" />
        <span className="row-text">
          <span className="row-title">{policy.package.planName}</span>
          <span className="row-sub">{usdShort(policy.package.price)} per member a month</span>
        </span>
        <Button variant="outline" small onClick={() => sdk.toast('Upgrades are coming soon')}>
          Upgrade
        </Button>
      </div>

      <div className="section-head">
        <h2 className="heading">Members</h2>
        <span className="sub">{usd(policy.monthlyPremium)} a month</span>
      </div>
      <ul className="card list">
        {policy.members.map((member) => (
          <li key={member.id}>
            <div className="row">
              <Avatar name={member.fullName} />
              <span className="row-text">
                <span className="row-title">{member.fullName}</span>
                <span className="row-sub">
                  {memberRole(member)}
                  {member.relationship && `, ${usd(member.monthlyPremium)}`}
                </span>
              </span>
            </div>
          </li>
        ))}
        <li>
          <button type="button" className="row row-link" onClick={() => navigate('/policy/manage/add-member')}>
            <span className="avatar avatar-add">
              <Icon name="plus" size={18} />
            </span>
            Add a family member
          </button>
        </li>
      </ul>

      <h2 className="heading">Payments</h2>
      <div className="card row">
        <span className="row-text">
          <span className="row-title">Auto debit</span>
          <span className="row-sub">Premium is collected from your wallet each month</span>
        </span>
        <Toggle label="Auto debit" checked={policy.autoDebit} onChange={setAutoDebit} />
      </div>
    </Screen>
  )
}
