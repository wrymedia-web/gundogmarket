'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function PhotoManager({
  label,
  images,
  onChange,
  max,
  tag,
  hint,
}: {
  label: string
  images: string[]
  onChange: (next: string[]) => void
  max: number
  tag?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in.'); return }
    const incoming = Array.from(files).slice(0, Math.max(0, max - images.length))
    if (files.length > max - images.length) setError(`Only ${max - images.length} photo slot${max - images.length === 1 ? '' : 's'} left.`)
    setUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of incoming) {
        if (file.size > MAX_PHOTO_BYTES) { setError(`"${file.name}" is over 5 MB — skipped.`); continue }
        if (!IMAGE_TYPES.includes(file.type)) { setError(`"${file.name}" isn't a JPG, PNG, or WEBP — skipped.`); continue }
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('dog-photos')
          .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type })
        if (upErr) { setError(`Upload failed: ${upErr.message}`); continue }
        const { data: pub } = supabase.storage.from('dog-photos').getPublicUrl(path)
        uploaded.push(pub.publicUrl)
      }
      if (uploaded.length > 0) onChange([...images, ...uploaded])
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      <label style={{ ...inter, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', display: 'block', marginBottom: 4 }}>
        {label}
      </label>
      {hint && <p style={{ ...inter, fontSize: 12, color: '#7C7A6E', marginBottom: 6 }}>{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        multiple={max > 1}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {images.map((url) => (
          <div key={url} style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', border: '1px solid #D9C8A6' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={tag ? `${tag} photo` : 'Listing photo'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {tag && (
              <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, ...inter, fontWeight: 700, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(15,15,14,0.75)', color: 'white', textAlign: 'center', padding: '2px 0' }}>{tag}</span>
            )}
            <button
              type="button"
              onClick={() => onChange(images.filter((u) => u !== url))}
              aria-label="Remove photo"
              style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(15,15,14,0.85)', color: 'white', border: 'none', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 11, lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            onClick={() => !uploading && inputRef.current?.click()}
            className="flex items-center justify-center"
            style={{ aspectRatio: '1 / 1', border: '2px dashed #D9C8A6', background: '#EFE7D4', cursor: uploading ? 'wait' : 'pointer', ...inter, fontSize: 11, color: '#7C7A6E' }}
          >
            {uploading ? '…' : '+ Add'}
          </button>
        )}
      </div>
      {error && <p style={{ ...inter, fontSize: 12, color: '#B03A1F', marginTop: 4 }}>{error}</p>}
    </div>
  )
}
