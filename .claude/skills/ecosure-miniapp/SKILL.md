---
name: ecosure-miniapp
description: Build, change or review the EcoSure Health mini app in this repo (React + TypeScript + Vite, rendered in the EcoCash Super App webview). Use for any work on its screens, components, styles, navigation, EcoCash Mini App SDK calls (window.MiniApp, sign-in, payments), the mock API, or when turning a Figma frame from "Moovah & Ecosure" into code.
---

# EcoSure Health mini app

A single-page web app that the EcoCash Super App opens inside its own webview. A customer picks an EcoSureMed package, registers, pays premiums from their EcoCash wallet and manages covered family members. EcoCash reviews every mini app before go-live; the rules below are what that review checks.

- Design: Figma file "Moovah & Ecosure", page **Ecosure** (`https://www.figma.com/design/gPQSNaPTzyTcXDxfcUGMGu/`). Screens and node ids are in [references/screens.md](references/screens.md).
- Requirements: "EcoSure Health Mini App BRD" (BRD 01, v1.1 draft). Business rules BR-01 to BR-36 and use cases UC01 to UC12; ask the user for the file when a rule matters.
- Platform docs: `https://superapp.ecocash.co.zw/miniapp/doc/`. Condensed in [references/ecocash-sdk.md](references/ecocash-sdk.md).
- Tokens and components: [references/design-system.md](references/design-system.md).

Read the reference that matches the task before writing code. Open Figma and the docs with the Claude in Chrome tools when a detail is not in the references.

## Layout of the code

```
index.html              loads /miniapp-sdk.js by its own <script>, before the bundle
public/miniapp-sdk.js   PLACEHOLDER until the file from EcoCash is dropped in
src/main.tsx            initSdk(), then render; "open from EcoCash" notice on failure
src/App.tsx             sign-in gate, app state, routes
src/state.ts            AppStateContext: customer (from the identity token), draft package, enrolled flag
src/sdk/                types.ts (SDK types, errorCode, isDismissal), init.ts, context.ts (useHost),
                        identity.ts (readIdentity: customer details from the token), devMock.ts
src/api/                types.ts (the Api contract), mock.ts (in-memory backend), client.ts (exports `api`)
src/lib/                useAsync, useBack, format
src/components/         Screen, ui (Button, ChipGroup, DetailList, ...), StateViews, Icon
src/screens/            one file per screen
src/styles/             tokens.css, base.css, components.css, screens.css
```

## Rules that are not negotiable

1. **Never draw a PIN, OTP or password screen**, or anything resembling one. Figma shows "EcoCash PIN" and "Receipt" frames; those are the host app's own screens. Payment is `sdk.openPaymentsPage(...)` and nothing else.
2. **The page never sets or computes an amount that is charged.** The server prices and signs the payment request; the page passes the signed string through and afterwards asks the server for the real status. Totals shown on screen come from `api.quotePayment`.
3. **The signed-in customer's details come from EcoCash through the SDK, never from our API.** Name, mobile number, ID number, date of birth and gender are claims in the identity token from `sdk.fetchAuthToken()`, read by `readIdentity` in `src/sdk/identity.ts` and exposed as `useAppState().customer`. The API only receives the token (`api.openSession`) and never returns customer details. The page shows the claims but does not trust them; the backend verifies the token and uses its own copy. Any claim may be null: handle it, never invent a value. Details of *other* people (a dependant looked up by EcoCash number) do come from the API.
4. **No secrets in the bundle.** No keys, no tokens, nothing sensitive in `sdk.setData` or web storage.
5. **`miniapp-sdk.js` is never imported or edited.** It stays a separate script tag in `<head>`. All SDK access goes through `useHost()`; do not touch `window.MiniApp` in screens.
6. **The SDK dev mock must not ship.** It is imported only behind `import.meta.env.DEV` in `src/sdk/init.ts`. Keep it that way.
7. **Every colour is a variable from `tokens.css`** with a light and a dark value. No hex codes in components or other stylesheets. (One documented exception: the hero badge icon on its fixed white disc.)
8. **Every screen has loading, ready and error states**, and nothing waits forever. Use `useAsync` + `AsyncFallback`.
9. **History mirrors the screens.** One route per screen; any future sheet, modal or picker pushes a history entry and closes on `popstate`. Do not push entries for keystrokes, chips or toggles. The host owns the back button.
10. **Phone first.** One column, works at 320px wide with no sideways scroll, touch targets 44px, no hover-only behaviour, inputs stay visible above the keyboard (`TextField` handles it).
11. **No ad SDKs, trackers or session replay.** Keep dependencies short; each one is questioned at review.
12. **Stay on the allowlisted origin.** No `window.location` to other sites, no external fonts or scripts (Poppins is self-hosted via `@fontsource/poppins`).

## Adding or changing a screen

1. Find the frame in Figma; read copy, sizes and colour style names from the Properties panel. Map colours to existing tokens; add a token (light and dark) only if none fits.
2. Create `src/screens/Name.tsx`. Wrap everything in `<Screen title="...">`; it calls `sdk.setTitle`, and draws the in-page header only on the browser dev mock (inside EcoCash the native header is used). Put primary actions in the `footer` prop.
3. Load data with `useAsync(() => api.something())`; early-return `<Screen><AsyncFallback {...query} /></Screen>` until ready.
4. Add the route in `src/App.tsx`.
5. Need new backend data? Extend the `Api` interface in `src/api/types.ts` first, then implement it in `mock.ts`. Screens depend on the interface only.
6. Reuse components from `src/components/ui.tsx` before writing new markup. Screen-specific CSS goes in `screens.css`, shared CSS in `components.css`.
7. Going back in code: `useBack(fallback)`, never a bare `navigate(-1)`, so a deep-linked screen still has somewhere to go.
8. SDK errors: `isDismissal(error)` means the customer backed out; return quietly. Anything else gets `sdk.toast(...)` or an error state. Hide a control with `sdk.supports(action)` rather than letting it fail.

## Verifying

```
npm run build     # tsc + vite; must pass
npm run lint      # oxlint; must be clean
npm run dev       # browser run on the dev mock
```

- The dev customer is the sample token in `src/sdk/devMock.ts`; edit its claims to test other customers or a missing claim.
- `http://localhost:5173/` starts as a new customer; `/?seed=1` (or any route with `?seed=1`) starts with the three-member policy drawn in Figma.
- Check each changed screen at 360px and 320px wide, and in both themes: set `document.documentElement.dataset.theme = 'dark'` / `'light'`.
- Walk the back button from the deepest screen to the first; it must retrace one screen per press.
- `grep -c "EcoCash mock" dist/assets/*.js` must print 0 after a build.
- Before a sandbox or production build, replace `public/miniapp-sdk.js` with the file from EcoCash and replace `src/api/mock.ts` with real endpoints.
