'use client'

import { useEffect } from 'react'
import { fbTrack } from '@/components/meta-pixel'

export default function ViewContentTracker({ id, name, value }: { id: string; name: string; value?: number }) {
  useEffect(() => {
    fbTrack('ViewContent', { content_ids: [id], content_name: name, content_type: 'product', ...(value ? { value, currency: 'USD' } : {}) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  return null
}
