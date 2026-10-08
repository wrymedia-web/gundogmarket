'use client'

import { useActionState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}

const inputStyle: React.CSSProperties = {
  ...sans, fontSize: 14, fontWeight: 400, color: '#0F0F0E',
  width: '100%', padding: '8px 12px',
  border: '1px solid #D9C8A6', background: 'white',
  outline: 'none',
}

export function AdminForm({ action, children }: { action: (formData: FormData) => Promise<void>; children: React.ReactNode }) {
  return (
    <form action={action} className="space-y-4" style={{ background: 'white', border: '1px solid #D9C8A6', padding: 24 }}>
      {children}
    </form>
  )
}

export function Field({ label, name, defaultValue, type, step, textarea }: {
  label: string; name: string; defaultValue: string; type?: string; step?: string; textarea?: boolean
}) {
  return (
    <div>
      <label style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>{label}</label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      ) : (
        <input name={name} type={type ?? 'text'} step={step} defaultValue={defaultValue} style={inputStyle} />
      )}
    </div>
  )
}

export function SelectField({ label, name, defaultValue, options }: {
  label: string; name: string; defaultValue: string; options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>{label}</label>
      <select name={name} defaultValue={defaultValue} style={{ ...inputStyle, cursor: 'pointer' }}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function CheckboxField({ label, name, defaultChecked }: {
  label: string; name: string; defaultChecked: boolean
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} style={{ accentColor: '#D85A1C' }} />
      <span style={{ ...sans, fontSize: 13, fontWeight: 500, color: '#0F0F0E' }}>{label}</span>
    </label>
  )
}

export function SubmitButton() {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      type="submit"
      disabled={isPending}
      style={{
        ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
        background: isPending ? '#7C7A6E' : '#D85A1C', color: 'white',
        border: 'none', padding: '12px 32px', cursor: isPending ? 'wait' : 'pointer',
      }}
    >
      {isPending ? 'Saving…' : 'Save Changes'}
    </button>
  )
}

export function DeleteButton({ action, label, confirmText, redirectTo }: {
  action: () => Promise<void>; label: string; confirmText: string; redirectTo?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(confirmText)) return
    startTransition(async () => {
      await action()
      if (redirectTo) router.push(redirectTo)
      else router.back()
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      style={{
        ...sans, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
        background: 'transparent', color: '#B03A1F',
        border: '1px solid #B03A1F', padding: '12px 24px',
        cursor: isPending ? 'wait' : 'pointer',
      }}
    >
      {isPending ? 'Deleting…' : label}
    </button>
  )
}
