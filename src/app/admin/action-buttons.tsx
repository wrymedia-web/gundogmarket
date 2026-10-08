'use client'

import { useTransition, useState } from 'react'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

export function ConfirmActionButton({ action, label, confirmText, danger }: {
  action: () => Promise<void>
  label: string
  confirmText?: string
  danger?: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  function handleClick() {
    if (confirmText && !confirm(confirmText)) return
    setError(null)
    startTransition(async () => {
      try {
        await action()
        setDone(true)
        setTimeout(() => setDone(false), 2500)
      } catch (e) {
        setError((e as Error).message)
      }
    })
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        style={{
          ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: danger ? 'transparent' : '#0F0F0E',
          color: danger ? '#B03A1F' : '#EFE7D4',
          border: danger ? '1px solid #B03A1F' : 'none',
          padding: '9px 16px', cursor: isPending ? 'wait' : 'pointer',
        }}
      >
        {isPending ? 'Working…' : done ? '✓ Done' : label}
      </button>
      {error && <span style={{ ...sans, fontSize: 11, color: '#B03A1F', maxWidth: 220 }}>{error}</span>}
    </span>
  )
}
