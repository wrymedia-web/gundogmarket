import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from './edit-form'

export const dynamic = 'force-dynamic'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/dashboard/edit/${id}`)

  const { data: dog } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!dog) notFound()
  if (dog.seller_id !== user.id) redirect('/dashboard')

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#D4600A', fontWeight: 600, textDecoration: 'none' }}>← My Listings</Link>
      </div>
      <EditListingForm dog={dog} />
    </div>
  )
}
