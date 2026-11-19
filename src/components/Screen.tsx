import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHost } from '../sdk/context'
import { Icon } from './Icon'

interface ScreenProps {
  /** Shown in the EcoCash header via sdk.setTitle. */
  title: string
  children: ReactNode
  /** Primary actions, pinned to the bottom of the screen. */
  footer?: ReactNode
}

/**
 * The frame every screen sits in. Inside EcoCash the native header carries the
 * title and back; the in-page header below is drawn only on the browser dev mock.
 */
export function Screen({ title, children, footer }: ScreenProps) {
  const { sdk, hosted } = useHost()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = title
    sdk.setTitle(title).catch(() => {})
  }, [sdk, title])

  const back = () => {
    const index = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (index > 0) navigate(-1)
    else sdk.close().catch(() => {})
  }

  return (
    <div className="screen">
      {!hosted && (
        <header className="app-header">
          <button type="button" className="app-header-back" aria-label="Back" onClick={back}>
            <Icon name="back" />
          </button>
          <h1>{title}</h1>
        </header>
      )}
      <main className="screen-body">{children}</main>
      {footer && <footer className="screen-footer">{footer}</footer>}
    </div>
  )
}
