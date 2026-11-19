# Design system

Source: Figma "Moovah & Ecosure", page Ecosure. Frames are 360 x 800, light only. Font: Poppins (400 regular, 500 medium).

## Colour tokens (`src/styles/tokens.css`)

| Token | Light | Dark | Figma style | Use |
|---|---|---|---|---|
| `--bg` | `#FFFFFF` | `#0E1116` | Eco_White | Screen and card background |
| `--bg-muted` | `#F3F4F4` | `#181C23` | Eco_Main_BG | Header, grey detail panels, disabled rows |
| `--text` | `#333333` | `#EAEEF3` | Eco_Dark_Grey | Body and headings |
| `--text-sub` | `#555555` | `#AAB3BF` | Eco_Sub_Heading,Icon | Labels, secondary lines |
| `--text-disabled` | `#9A9A9A` | `#6C7582` | | Disabled text, empty radio ring |
| `--primary` | `#005AAA` | `#6FB1F2` | Eco_Blue | Accent text, icons, borders |
| `--primary-fill` | `#005AAA` | `#1668B8` | Eco_Blue | Filled buttons, hero, policy card |
| `--on-primary` | `#FFFFFF` | `#FFFFFF` | | Text on `--primary-fill` |
| `--primary-soft` | `#E2E7ED` | `#1C2A3B` | Eco_Blue_BG,Divider | Info banner, selected chip, icon badge |
| `--line` | `#E3E6EA` | `#2A313C` | | Card borders, dividers |
| `--success` / `--success-fill` | `#1A9F53` / `#22B15B` | `#4FD08A` / `#1F9E52` | | "Active", "Found on EcoCash", success tick |
| `--success-bg` | `#EDFFF4` | `#10291C` | Eco_BG_Green | Found card, Active pill |
| `--warning` / `--warning-bg` | `#A36A00` / `#FFF3D1` | `#F2C14E` / `#3A2E0E` | | "New" pill |
| `--danger` | `#C5281C` | `#FF8A80` | | Failed payment icon |
| `--disabled-fill` | `#C4C4C4` | `#3A414C` | | Disabled primary button, toggle off |

Dark values are derived (Figma has no dark frames). The dark block appears twice in `tokens.css`: under `prefers-color-scheme: dark` and under `html[data-theme='dark']`, which is the attribute the SDK sets. Change both together.

Greens, ambers, `--line` and `--danger` were matched by eye from the frames, not read from a named Figma style. Confirm against Figma if exactness matters.

## Type

| Class / place | Size | Weight |
|---|---|---|
| `.title` (screen title) | 20px | 500 |
| `.heading` (section heading), header title | 16px | 500 |
| `.row-title`, buttons, detail values | 13-14px | 500 |
| body, `.row-sub`, labels, chips | 12px | 400 |
| pills, stepper labels | 11px | 400-500 |

Line height 145% throughout.

## Shape and spacing

- Gutter 16px (`--gutter`); vertical gap between blocks 16px; gap inside lists 12px.
- Radius: cards 16px (`--radius-lg`), banners 12px (`--radius-md`), chips and pills 20px (`--radius-pill`), buttons and inputs 4px (`--radius-sm`).
- Borders: 1px `--line` on cards; 1.5px on chips, selected cards, outline buttons, inputs.
- Buttons 44px tall, full width. Chips and small buttons are 36px tall with a 44px hit area (`::after`).
- Header 56px, `--bg-muted`, centred title, back arrow left.

## Components

`src/components/Screen.tsx`
- `Screen({ title, footer?, children })`: page frame, sets the host title, sticky footer for primary actions.

`src/components/ui.tsx`
- `Button({ variant: 'primary' | 'outline' | 'text', busy?, small?, ...button props })`
- `IconBadge({ name, tone?: 'soft' | 'muted' })`: 40px rounded square behind an icon.
- `InfoBanner`: blue-grey note with an info icon.
- `Avatar({ name })`: initials disc. Add class `avatar-lg` in markup for the 44px holder variant.
- `StatusPill({ tone: 'success' | 'warning' | 'neutral' })`
- `ChipGroup({ label, options, value, onChange, layout?: 'wrap' | 'equal' | 'segment' })`: radio group. `wrap` for relationship pills, `equal` for the months row, `segment` for the boxed two-way switch.
- `Stepper({ label, step, of })`
- `DetailList({ rows: [label, value][], tone?: 'grey' | 'plain' })`
- `Toggle({ checked, onChange, label })`
- `TextField({ label, hint?, ...input props })`: scrolls itself clear of the keyboard on focus.
- `SuccessTick`

`src/components/StateViews.tsx`: `Loading`, `ErrorState({ message?, onRetry? })`, `AsyncFallback({ state, reload })`.

`src/components/Icon.tsx`: `Icon({ name, size? })`, stroke icons using `currentColor`. Names: back, chevron, shield, user, info, check, card, gift, gear, help, plus, flower, alert. Add new ones to the `paths` map.

CSS building blocks in `components.css`: `.card`, `.row` (+ `.row-text`, `.row-title`, `.row-sub`), `.list` (divided rows inside a card), `.count`, `.section-head`.
