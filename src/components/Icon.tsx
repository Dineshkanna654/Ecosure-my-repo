import type { ReactNode } from 'react'

const paths = {
  back: <path d="M19 12H5m6-6-6 6 6 6" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6l-7-3Z" />
      <path d="M12 15.2s-2.8-1.7-2.8-3.6a1.5 1.5 0 0 1 2.8-.8 1.5 1.5 0 0 1 2.8.8c0 1.9-2.8 3.6-2.8 3.6Z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.6-3.6 3.4-5.5 7-5.5s6.4 1.9 7 5.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5m0-8.5v.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  card: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17M7 14.5h3" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="1.5" />
      <path d="M3 7h18v3H3zM12 7v13M12 7s-1-3.5-3.5-3.5a1.75 1.75 0 0 0 0 3.5H12Zm0 0s1-3.5 3.5-3.5a1.75 1.75 0 0 1 0 3.5H12Z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.7 9.5a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.8m0 3v.2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  flower: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4v4m0 8v4M4 12h4m8 0h4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 3 19h18L12 4Z" />
      <path d="M12 10v4m0 2.5v.5" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof paths

export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
