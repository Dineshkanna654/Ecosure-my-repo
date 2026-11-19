# Screens

Figma: `https://www.figma.com/design/gPQSNaPTzyTcXDxfcUGMGu/Moovah---Ecosure?node-id=<node>` (page Ecosure, section "EcoSure Health").

| Screen | Route | File | Figma node | Host title |
|---|---|---|---|---|
| Welcome | `/` | `Welcome.tsx` | `5-10963` | EcoSure |
| Choose package | `/med/package` | `ChoosePackage.tsx` | `5-11007` | EcoSureMed |
| Confirm details | `/med/confirm` | `ConfirmDetails.tsx` | `5-11053` | EcoSureMed |
| Registered | `/med/registered` | `Registered.tsx` | `5-11095` | EcoSureMed |
| Policy home | `/policy` | `PolicyHome.tsx` | `5-11124` | EcoSure Health |
| Make a payment | `/policy/pay` | `MakePayment.tsx` | `5-11199` | Make a payment |
| Payment result | `/policy/pay/result?ref=` | `PaymentResult.tsx` | none (ours) | Payment |
| Manage policy | `/policy/manage` | `ManagePolicy.tsx` | `5-11432` | Manage policy |
| Add a family member | `/policy/manage/add-member` | `AddMember.tsx` | `5-11485` | Add a family member |

Not built, on purpose:

| Figma frame | Node | Why |
|---|---|---|
| EcoCash home | `5-10962` area | The host app's home with our tile |
| EcoCash PIN | `5-11237` | Host's native payment sheet. A mini app must never show a PIN screen |
| Receipt / Transaction Details | `5-11318` | Host's receipt. We show Payment result instead |

## Where the data comes from

| Data | Source |
|---|---|
| Signed-in customer: full name, ID number, date of birth, gender (Confirm details), name and mobile number (Policy home holder card) | EcoCash, via the identity token: `useAppState().customer` (BRD BR-04, FR-005, section 10.1) |
| Packages, policy, members, premiums, payment quote and status | EcoSure backend: `api.*` |
| A dependant's details found by EcoCash wallet number | EcoSure backend: `api.lookupByEcoCashNumber` (BRD BR-12 says "retrieved"; the SDK has no call for another person's details) |

## Flow

```
Welcome ──EcoSureMed (no policy)──> Choose package ─> Confirm details ─> Registered
   │                                                                      │        │
   └──EcoSureMed (has policy)─────────────────────────────> Policy home <─┘        │
                                                              │      │             │
                                                 Make a payment <────┼─────────────┘ ("Pay first premium now")
                                                       │             │
                                         sdk.openPaymentsPage   Manage policy ─> Add a family member
                                                       │
                                                 Payment result ─> back to Policy home
```

History handling worth knowing:
- Confirm is **replaced** by Registered; both Registered exits **replace** it with Policy home. Backing into Choose package after enrolling skips straight past it (`enrolled` flag in app state).
- Make a payment is **replaced** by Payment result, so back from the result lands on Policy home.

## Copy and behaviour

**Welcome**: hero "Health cover from USD 5 a month" / "For you and your family, paid from your EcoCash wallet." (the 5 is the lowest package price from the API). Section "EcoSure Health": rows "EcoSureMed" (sub "Care, Plus or Prime", or "View my policy" when one exists) and "Individual products" (sub "Cover just for you"). Section "EcoSure Funeral": disabled row, sub "Not available in the app yet", pill "Soon".

**Choose package**: stepper "Package", Step 1 of 2. Title "Choose your package"; lead "Monthly premium per member. Family members you add later share your package." Radio cards: EcoSure Care USD 5, EcoSure Plus USD 7 (default), EcoSure Prime USD 10, each "Benefits to be confirmed" / "a month". Banner "Your cover starts once your first premium is collected." Button "Continue".

**Confirm details**: stepper "Confirm", Step 2 of 2. Title "Confirm your details". Package card with "Change" (goes back). Grey panel: Full name, ID number, Date of birth (dd/mm/yyyy), Gender, read-only, from the EcoCash identity token. If any of the four is missing from the token the screen shows an error state and no register button. Card "Terms and conditions": "A full list of terms and conditions are found at www.Ecosurehealth.co.zw or any Econet outlet." Buttons "I accept and register", "Cancel and exit" (`sdk.close`).

**Registered**: green tick, "You're registered", "Your cover starts once your first premium is collected from your wallet." Panel: Policy number, Package, Monthly premium, Status (pill "New"). Buttons "Go to my policy", "Pay first premium now".

**Policy home**: holder card (initials, name, "077 123 4567, policy holder"). Blue card: plan name "EcoSureMed Plus", policy number, pill "Active" or "New", inner panel Monthly premium / Next collection. Tiles: Make a payment, Sponsor someone, Manage policy, Help. "Covered members" with count badge; rows show name and "You, principal member" or the relationship.

**Make a payment**: "How many months?" chips 1, 2, 3 (default), 6, 12. Panel: Monthly premium, Months, Total (blue). Banner "Covers you, Rudo and Tanaka until 28 Feb 2027." Button "Pay USD 63.00". All figures come from `api.quotePayment(months)`.

**Payment result**: paid: tick, "Premium paid", "Your EcoSureMed cover is active.", panel Policy / Service name / Months / Amount / Covered until, button "Back to my policy". Pending: spinner, "Confirming your payment", "Check again". Failed: "Payment not completed", "Try again".

**Manage policy**: package card "EcoSureMed Plus" / "USD 7 per member a month" with outline "Upgrade". "Members" with "USD 21.00 a month"; rows show role plus ", USD 7.00" for non-principal members; last row "+ Add a family member". "Payments": "Auto debit" / "Premium is collected from your wallet each month" with toggle (optimistic, reverts on failure).

**Add a family member**: "Who are you adding?" chips Spouse (default), Child below 18, Child above 18, Father, Mother, Father in law, Mother in law. "Find them by": EcoCash number (default) or Enter manually. Number mode: field "Their EcoCash number"; a valid 07XXXXXXXX number triggers a lookup; green card "Found on EcoCash" with Full name, ID number, Date of birth, Gender, or a not-found note. Manual mode: Full name, ID number, Date of birth, Gender. Banner "Adds USD 7.00 to your monthly premium." Button "Add member", enabled once a person is identified.

## Not designed yet

No Figma frames exist for these; the app shows a "coming soon" toast: Individual products, Sponsor someone, Help, Upgrade. Ask for a frame before building any of them.

The BRD requires more than is drawn or built. Not yet in the app:
- Help options: toll free 147, WhatsApp 0778775200, enquiries@ecosurehealth.co.zw (BR-24).
- Remove dependant, with "Are you sure you want to remove Dependent [number] [name]" Yes / No (BR-20).
- Change benefit package: confirm first; downgrade immediate, upgrade only if funds cover it (BR-08 to BR-10).
- Sponsor family and friends: cellphone or EcoSure Health number, then months, then PIN (BR-23).
- Auto debit change needs a Yes / No confirmation before it applies (BR-21); the toggle currently applies at once.
- Add dependant: a Confirm / Cancel review step before saving (BR-12); manual ID format 67-1111111A12 and date format dd/mm/yyyy validation (BR-13); student option with proof for a child above 18 (BR-16).
- Policy statuses NTU and TERMINATED (section 5.3); the app only knows NEW and ACTIVE.
- New customers should see Register and Need Help (BR-02).
