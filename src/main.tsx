import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/screens.css'
import App from './App.tsx'
import { HostContext } from './sdk/context'
import { initSdk } from './sdk/init'
import { errorCode } from './sdk/types'

const root = createRoot(document.getElementById('root')!)

initSdk().then(
  (host) =>
    root.render(
      <StrictMode>
        <HostContext value={host}>
          <App />
        </HostContext>
      </StrictMode>,
    ),
  (error) =>
    root.render(
      <div className="screen">
        <div className="state" role="alert">
          <p>
            {errorCode(error) === 'UNAVAILABLE'
              ? 'Please open EcoSure from the EcoCash app.'
              : 'EcoSure could not start. Please close it and try again.'}
          </p>
        </div>
      </div>,
    ),
)
