'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function PhotoGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)
  if (!images || images.length === 0) return null

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length)
  const next = () => setActive((a) => (a + 1) % images.length)

  return (
    <div className="w-full mb-6">
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{ background: '#0F0F0E', border: '1px solid #D9C8A6', height: 400, position: 'relative' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[active]}
          alt={`${title} photo ${active + 1}`}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous photo"
              className="flex items-center justify-center"
              style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(15,15,14,0.65)', color: '#EFE7D4', border: 'none', cursor: 'pointer' }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next photo"
              className="flex items-center justify-center"
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, background: 'rgba(15,15,14,0.65)', color: '#EFE7D4', border: 'none', cursor: 'pointer' }}
            >
              <ChevronRight size={20} />
            </button>
            <span
              style={{ position: 'absolute', bottom: 8, right: 10, background: 'rgba(15,15,14,0.65)', color: '#EFE7D4', fontSize: 11, padding: '2px 8px', fontFamily: 'system-ui, sans-serif' }}
            >
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              className="shrink-0 p-0"
              style={{
                width: 80,
                height: 80,
                border: i === active ? '2px solid #D85A1C' : '1px solid #D9C8A6',
                opacity: i === active ? 1 : 0.75,
                overflow: 'hidden',
                background: 'none',
                cursor: 'pointer',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`${title} photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
