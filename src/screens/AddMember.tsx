import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { api } from '../api/client'
import { RELATIONSHIPS } from '../api/types'
import type { Gender, Person, Relationship } from '../api/types'
import { Icon } from '../components/Icon'
import { Screen } from '../components/Screen'
import { AsyncFallback } from '../components/StateViews'
import { Button, ChipGroup, DetailList, InfoBanner, TextField } from '../components/ui'
import { numericDate, usd } from '../lib/format'
import { useBack } from '../lib/useBack'
import { useAsync } from '../lib/useAsync'
import { useHost } from '../sdk/context'

const MODES = ['EcoCash number', 'Enter manually'] as const
const GENDERS = ['Male', 'Female'] as const
const digits = (value: string) => value.replace(/\D/g, '')
/** Zimbabwean mobile number: 07X XXX XXXX */
const isMsisdn = (value: string) => /^07\d{8}$/.test(digits(value))

export function AddMember() {
  const back = useBack('/policy/manage')
  const { sdk } = useHost()
  const policyQuery = useAsync(api.getPolicy)
  const [relationship, setRelationship] = useState<Relationship>('Spouse')
  const [mode, setMode] = useState<(typeof MODES)[number]>('EcoCash number')
  const [msisdn, setMsisdn] = useState('')
  const [manual, setManual] = useState<Person>({ fullName: '', idNumber: '', dateOfBirth: '', gender: 'Female' })
  const [busy, setBusy] = useState(false)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  const number = isMsisdn(msisdn) ? digits(msisdn) : ''
  const lookup = useAsync(() => (number ? api.lookupByEcoCashNumber(number) : Promise.resolve(null)), number)

  if (policyQuery.state.status !== 'ready') {
    return (
      <Screen title="Add a family member">
        <AsyncFallback {...policyQuery} />
      </Screen>
    )
  }
  const policy = policyQuery.state.data
  if (!policy) return <Navigate to="/" replace />

  const found = lookup.state.status === 'ready' ? lookup.state.data : null
  const manualComplete = manual.fullName.trim().length > 2 && manual.idNumber.trim().length > 5 && manual.dateOfBirth !== ''
  const person = mode === 'EcoCash number' ? found : manualComplete ? manual : null

  const add = async () => {
    if (!person) return
    setBusy(true)
    try {
      await api.addMember(relationship, person)
      sdk.toast(`${person.fullName} added to your policy`)
      back()
    } catch {
      setBusy(false)
      sdk.toast('We could not add this member. Please try again.')
    }
  }

  return (
    <Screen
      title="Add a family member"
      footer={
        <Button busy={busy} disabled={!person} onClick={add}>
          Add member
        </Button>
      }
    >
      <h2 className="heading">Who are you adding?</h2>
      <ChipGroup label="Relationship" options={RELATIONSHIPS} value={relationship} onChange={setRelationship} />

      <h2 className="heading">Find them by</h2>
      <ChipGroup label="Find them by" layout="segment" options={MODES} value={mode} onChange={setMode} />

      {mode === 'EcoCash number' ? (
        <>
          <TextField
            id="msisdn"
            label="Their EcoCash number"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            placeholder="077 000 0000"
            value={msisdn}
            onChange={(event) => setMsisdn(event.target.value)}
            hint={msisdn !== '' && !number ? 'Enter a 10 digit number starting with 07' : undefined}
          />
          {number && lookup.state.status === 'loading' && <p className="sub lookup-note">Looking up this number…</p>}
          {number && lookup.state.status === 'error' && (
            <p className="lookup-note">
              We could not look up this number.{' '}
              <button type="button" className="row-link" onClick={lookup.reload}>
                Try again
              </button>
            </p>
          )}
          {number && lookup.state.status === 'ready' && !found && (
            <p className="lookup-note">No EcoCash account was found for this number. Check it, or enter their details manually.</p>
          )}
          {found && (
            <section className="found">
              <h3>
                <Icon name="check" size={16} /> Found on EcoCash
              </h3>
              <DetailList
                tone="plain"
                rows={[
                  ['Full name', found.fullName],
                  ['ID number', found.idNumber],
                  ['Date of birth', numericDate(found.dateOfBirth)],
                  ['Gender', found.gender],
                ]}
              />
            </section>
          )}
        </>
      ) : (
        <>
          <TextField
            id="fullName"
            label="Full name"
            autoComplete="off"
            value={manual.fullName}
            onChange={(event) => setManual({ ...manual, fullName: event.target.value })}
          />
          <TextField
            id="idNumber"
            label="ID number"
            autoComplete="off"
            placeholder="63-123456 A 42"
            value={manual.idNumber}
            onChange={(event) => setManual({ ...manual, idNumber: event.target.value })}
          />
          <TextField
            id="dateOfBirth"
            label="Date of birth"
            type="date"
            max={today}
            value={manual.dateOfBirth}
            onChange={(event) => setManual({ ...manual, dateOfBirth: event.target.value })}
          />
          <div className="field">
            <span>Gender</span>
            <ChipGroup
              label="Gender"
              layout="segment"
              options={GENDERS}
              value={manual.gender}
              onChange={(gender: Gender) => setManual({ ...manual, gender })}
            />
          </div>
        </>
      )}

      <InfoBanner>Adds {usd(policy.package.price)} to your monthly premium.</InfoBanner>
    </Screen>
  )
}
