import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { initials } from '../lib/format'
import { Icon } from './Icon'
import type { IconName } from './Icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'text'
  busy?: boolean
  small?: boolean
}
export function Button({ variant = 'primary', busy = false, small = false, disabled, children, ...rest }: ButtonProps) {
  return (
    <button type="button" className={`btn btn-${variant}${small ? ' btn-small' : ''}`} disabled={disabled || busy} aria-busy={busy} {...rest}>
      {busy ? <span className="spinner" aria-label="Please wait" /> : children}
    </button>
  )
}

export function IconBadge({ name, tone = 'soft' }: { name: IconName; tone?: 'soft' | 'muted' }) {
  return (
    <span className={`icon-badge icon-badge-${tone}`}>
      <Icon name={name} size={20} />
    </span>
  )
}

export function InfoBanner({ children }: { children: ReactNode }) {
  return (
    <p className="info-banner">
      <Icon name="info" size={18} />
      <span>{children}</span>
    </p>
  )
}

export function Avatar({ name }: { name: string }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initials(name)}
    </span>
  )
}

export function StatusPill({ tone, children }: { tone: 'success' | 'warning' | 'neutral'; children: ReactNode }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

interface ChipGroupProps<T extends string | number> {
  label: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  /** "wrap" for pill chips, "equal" for a row of equal-width chips, "segment" for boxed tabs */
  layout?: 'wrap' | 'equal' | 'segment'
}
export function ChipGroup<T extends string | number>({ label, options, value, onChange, layout = 'wrap' }: ChipGroupProps<T>) {
  return (
    <div className={`chips chips-${layout}`} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={option === value}
          className="chip"
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  )
}

export function Stepper({ label, step, of }: { label: string; step: number; of: number }) {
  return (
    <div className="stepper">
      <div className="stepper-labels">
        <span className="stepper-current">{label}</span>
        <span>
          Step {step} of {of}
        </span>
      </div>
      <div className="stepper-bars" role="progressbar" aria-valuemin={1} aria-valuemax={of} aria-valuenow={step}>
        {Array.from({ length: of }, (_, i) => (
          <span key={i} className={i < step ? 'done' : ''} />
        ))}
      </div>
    </div>
  )
}

/** Label / value pairs. `tone` picks the grey, green or plain panel behind them. */
export function DetailList({ rows, tone = 'grey' }: { rows: [string, ReactNode][]; tone?: 'grey' | 'plain' }) {
  return (
    <dl className={`details details-${tone}`}>
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="toggle" onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
}
export function TextField({ label, hint, id, ...rest }: TextFieldProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        id={id}
        // Keep the field clear of the on-screen keyboard.
        onFocus={(event) => setTimeout(() => event.target.scrollIntoView({ block: 'center', behavior: 'smooth' }), 250)}
        {...rest}
      />
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function SuccessTick() {
  return (
    <span className="success-tick">
      <Icon name="check" size={28} />
    </span>
  )
}
