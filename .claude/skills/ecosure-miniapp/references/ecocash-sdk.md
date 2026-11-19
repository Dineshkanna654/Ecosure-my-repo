# EcoCash Mini App SDK, condensed

Full docs: `https://superapp.ecocash.co.zw/miniapp/doc/` (pages: `getting-started`, `architecture`, `sdk-setup`, `build-guidelines`, `expectations`, `sso`, `payments`, `api-reference`, `server-api`, `transaction-context`, `device-capabilities`, `error-handling`, `manifest`, `testing-debugging`, `review-go-live`, `faqs`, each `.html`). The docs are marked "Draft for partner review"; re-read the relevant page when something here does not match the SDK file in hand. Only `getting-started`, `sdk-setup`, `build-guidelines`, `api-reference` and `sso` were read when this was written.

## Start-up

```html
<head>
  <script src="/miniapp-sdk.js"></script>   <!-- first, own tag, hosted on our domain, unedited -->
</head>
```

```js
if (!MiniApp.isInSuperApp) { /* show "Please open this from the EcoCash app." and nothing else */ }
const sdk = await MiniApp.build(MiniApp.Constants.Species.web)  // once; { debug: true } as 2nd arg logs bridge traffic
```

In this repo: `src/sdk/init.ts` does this and `useHost()` returns `{ sdk, hosted }`. `MiniApp.isInSuperApp` is the only thing readable before `build`. The app is identified by its allowlisted entry URL, not by any secret. The user agent contains `ecocash-webview` inside the host (analytics/server use only).

The docs describe an EcoCash-supplied `miniapp-mock.js` for desktop browsers (`MiniAppMock.enable()`). This repo uses its own `src/sdk/devMock.ts` instead, since that file was not available. Either way the mock must never be in a production build.

## Methods (all on the `sdk` instance; all promise-returning unless noted)

| Call | Returns / notes |
|---|---|
| `sdk.supports(action)` | boolean, sync. Hide controls that cannot work |
| `sdk.fetchAuthToken()` | `{ token, expiresIn }`. JWT; send to our server, which verifies it against EcoCash's JWKS and opens a session. First call shows a consent prompt. Rejects `CONSENT_DECLINED`, `CANCELLED`, `UNAVAILABLE`, `TIMEOUT` |
| `sdk.openPaymentsPage(merchantName, context, imageURL?, metaData?)` | Opens the native payment sheet. `context` is the server-signed request (amount, order ref, callback URL, nonce, expiry), opaque to the page. `metaData` is an array of single-key objects, display only. Rejects `PAYMENT_DISMISS`, `PAYMENT_TIMEOUT`, `PARAMS_INVALID_OR_INSUFFICIENT`, `INTERNAL_ERROR`. **Resolution is not proof of payment**; read the status from our server |
| `sdk.getAppInfo()` | `{ theme, platform: 'android' | 'ios', appVersion, locale, country }` |
| `sdk.setTitle(title)` | Title in the native header |
| `sdk.setNavBar(visible)` | Show/hide the native header. If hidden, draw our own back control calling `history.back()` (iOS has no hardware back) |
| `sdk.close(reason?)` | Close the mini app |
| `sdk.toast(message)` | Short native message; confirmations only |
| `sdk.setData / getData / removeData` | Small private key-value store. Drafts and baskets only, never secrets |
| `sdk.theme` | `'light' | 'dark'`, sync property. The SDK also sets the theme attribute on `<html>` |
| `sdk.onThemeChange(fn)` | Only needed for things painted by hand (canvas, charts). Returns unsubscribe |
| `sdk.onPause / onResume / onClose(fn)` | Lifecycle. Save as you go; a task-switcher kill gives no warning |
| `sdk.requestPermission(name)`, `getLocation()`, `scan({ type })`, `pickFile()`, `pickContact()`, `saveFile(file)`, `createDeepLink({ screen, params })` | Device actions. Each must be granted in the manifest, else `UNSUPPORTED`; `DENIED` if the customer refuses. Not used by this app yet |
| `sdk.on(event, fn)`, `sdk.call(action, payload)` | Escape hatches for things agreed with EcoCash |

Types live in `src/sdk/types.ts`. Extend them there when a new method is used.

## Single sign-on and the customer's details

The customer is already signed in to EcoCash. The mini app never shows a login form.

1. Page: `const { token } = await sdk.fetchAuthToken()`. The first call makes EcoCash show a consent prompt naming the mini app and the details it will share; the choice is remembered. Declined → rejects `CONSENT_DECLINED`.
2. Page: reads the claims for display (`readIdentity(token)` in `src/sdk/identity.ts`) and posts the token to the backend (`api.openSession(token)`).
3. Backend: verifies the RS256 signature against EcoCash's JWKS (fetch and cache; keys rotate), and checks `iss`, `aud` (our appId) and `exp`. Only then does it trust the claims, find or create the account keyed on `sub`, and open its own session.

Token payload:

| Claim | Meaning | Status |
|---|---|---|
| `iss`, `aud`, `iat`, `exp` | Issuer (EcoCash), audience (our appId), issued-at, expiry (short-lived) | Documented |
| `sub` | Stable, opaque customer id, specific to this mini app | Documented |
| `name`, `email`, `mobileNumber` | Customer details, as granted. `mobileNumber` looks like `2637........` | Documented |
| `idNumber`, `dateOfBirth`, `gender` | Needed for registration (BRD BR-04) | **Assumed names.** Which extra claims a token carries is agreed with EcoCash at design review; confirm names and formats, then update `CLAIMS` in `src/sdk/identity.ts` |

Rules: a page can be edited, so claims read in the page are for display only and the backend never accepts customer details from the page. Request only the claims the journey needs. Ask for a fresh token when identity must be confirmed again.

## Error codes

Every failure is a rejected promise with `error.code`:

| Code | Meaning | Do |
|---|---|---|
| `NOT_INITIALIZED` | Called before `build` finished | Bug: use the built `sdk` |
| `UNAVAILABLE` | Not inside EcoCash, or URL not allowlisted | "Open from EcoCash" notice |
| `UNAUTHORIZED` | appId does not match the entry URL | Config: check manifest and environment |
| `TIMEOUT` | Host did not answer | Offer the action again; never an endless spinner |
| `UNSUPPORTED` | Not available or not granted | Hide the feature |
| `CANCELLED` | Customer dismissed a native sheet | Return quietly |
| `DENIED` | Permission refused | Explain and let them retry |
| `INVALID` | Bad arguments | Bug in our code |
| `FAILED` | Anything else | Generic failure, log it |

Helpers: `errorCode(error)` and `isDismissal(error)` in `src/sdk/types.ts`.

## Payment flow

1. Page: `api.createPayment(months)` → server prices it, signs the request, returns `{ signedRequest, orderRef }`.
2. Page: `sdk.openPaymentsPage('EcoSure Health', signedRequest, logoUrl?, metaData)`. EcoCash shows the confirmation sheet and collects the PIN.
3. EcoCash calls the server's callback URL; the server verifies it with EcoCash's callback JWKS.
4. Page: `api.getPayment(orderRef)` and render paid / pending / failed.

## What EcoCash provisions (per environment)

`miniapp-sdk.js`, App ID (public, reverse-domain), our signing key pair (private key server-side only), SSO JWKS, callback JWKS, granted action list, allowlisted entry URLs, sandbox access, merchant portal access.

## Review checklist (from Build guidelines)

- Used on a real mid-range Android phone and a real iPhone.
- Back retraces one screen at a time, overlays first, never exits early.
- Works in light and dark, including when the theme switches while open.
- HTTPS with valid certificates on sandbox and production; every API call HTTPS.
- Single page, short dependency list, dependencies patched, security test report ready.
- Payment through a server-signed request; the page never sets the amount.
- No PIN/OTP screen, no secrets in the bundle, no trackers, mock not shipped.
- Loading, empty and error states on every screen.
- Manifest lists the actions used and the origins contacted.
- First screen visible in about two seconds on a mid-range phone on a slow connection.
