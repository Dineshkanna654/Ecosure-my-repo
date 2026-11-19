import { useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { api } from './api/client'
import type { PackageId } from './api/types'
import { Screen } from './components/Screen'
import { ErrorState, Loading } from './components/StateViews'
import { useAsync } from './lib/useAsync'
import { useHost } from './sdk/context'
import { readIdentity } from './sdk/identity'
import { isDismissal } from './sdk/types'
import { AppStateContext } from './state'
import { AddMember } from './screens/AddMember'
import { ChoosePackage } from './screens/ChoosePackage'
import { ConfirmDetails } from './screens/ConfirmDetails'
import { MakePayment } from './screens/MakePayment'
import { ManagePolicy } from './screens/ManagePolicy'
import { PaymentResult } from './screens/PaymentResult'
import { PolicyHome } from './screens/PolicyHome'
import { Registered } from './screens/Registered'
import { Welcome } from './screens/Welcome'

function SignedIn() {
  const { sdk } = useHost()
  // Single sign-on. EcoCash issues the identity token; the customer's details are
  // read from it, and our server verifies it to open a session.
  const session = useAsync(async () => {
    const { token } = await sdk.fetchAuthToken()
    const customer = readIdentity(token)
    await api.openSession(token)
    return customer
  })
  const [draftPackage, setDraftPackage] = useState<PackageId>('plus')
  const [enrolled, setEnrolled] = useState(false)

  const customer = session.state.status === 'ready' ? session.state.data : null
  const value = useMemo(
    () => customer && { customer, draftPackage, setDraftPackage, enrolled, setEnrolled },
    [customer, draftPackage, enrolled],
  )

  if (!value) {
    return (
      <Screen title="EcoSure">
        {session.state.status === 'error' ? (
          <ErrorState
            message={
              isDismissal(session.state.error)
                ? 'EcoSure needs your EcoCash details to find or open your policy.'
                : 'We could not sign you in. Please try again.'
            }
            onRetry={session.reload}
          />
        ) : (
          <Loading />
        )}
      </Screen>
    )
  }

  return (
    <AppStateContext value={value}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/med/package" element={<ChoosePackage />} />
        <Route path="/med/confirm" element={<ConfirmDetails />} />
        <Route path="/med/registered" element={<Registered />} />
        <Route path="/policy" element={<PolicyHome />} />
        <Route path="/policy/pay" element={<MakePayment />} />
        <Route path="/policy/pay/result" element={<PaymentResult />} />
        <Route path="/policy/manage" element={<ManagePolicy />} />
        <Route path="/policy/manage/add-member" element={<AddMember />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppStateContext>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SignedIn />
    </BrowserRouter>
  )
}
