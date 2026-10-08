import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updateListing, deleteListing, removeListingPhoto, makeListingPhotoPrimary, reassignListing } from '@/app/admin/actions'
import { AdminForm, Field, SelectField, CheckboxField, SubmitButton, DeleteButton } from '@/app/admin/form-components'
import { ConfirmActionButton } from '@/app/admin/action-buttons'
import { createServiceClient } from '@/lib/supabase/service'
import { ALL_BREEDS, US_STATES } from '@/lib/mock-data'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = {
  ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em',
}

export const dynamic = 'force-dynamic'

export default async function AdminListingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: dog } = await supabase
    .from('dogs')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!dog) notFound()

  const { data: seller } = await supabase
    .from('profiles')
    .select('full_name, kennel_name')
    .eq('id', dog.seller_id)
    .maybeSingle()

  const updateWithId = updateListing.bind(null, id)
  const deleteWithId = deleteListing.bind(null, id)

  // Users for the reassign dropdown (emails via service role)
  const service = createServiceClient()
  const [{ data: allProfiles }, authList] = await Promise.all([
    service.from('profiles').select('id, full_name, kennel_name'),
    service.auth.admin.listUsers({ perPage: 1000 }),
  ])
  const emailById = new Map((authList.data?.users ?? []).map((u) => [u.id, u.email ?? '']))
  const allUsers = (allProfiles ?? [])
    .map((p) => ({ id: p.id, label: `${p.kennel_name || p.full_name || '(no name)'} — ${emailById.get(p.id) ?? ''}` }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/listings" style={{ ...sans, fontSize: 13, color: '#D85A1C', fontWeight: 600, textDecoration: 'none' }}>← Listings</Link>
        <span style={{ color: '#D9C8A6' }}>/</span>
        <span style={{ ...sans, fontSize: 13, color: '#7C7A6E' }}>{dog.title}</span>
      </div>

      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>Edit Listing</h1>
      <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', marginBottom: 24 }}>
        Seller: {seller?.kennel_name || seller?.full_name || 'Unknown'} · Created {new Date(dog.created_at).toLocaleDateString()}
      </p>

      <AdminForm action={updateWithId}>
        <Field label="Title" name="title" defaultValue={dog.title ?? ''} />

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Breed" name="breed" defaultValue={dog.breed ?? ''} options={ALL_BREEDS.map(b => ({ value: b, label: b }))} />
          <SelectField label="Gender" name="gender" defaultValue={dog.gender ?? ''} options={[
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
          ]} />
          <Field label="Age (months)" name="age_months" type="number" defaultValue={String(dog.age_months ?? '')} />
          <SelectField label="Training Level" name="training_level" defaultValue={dog.training_level ?? ''} options={[
            { value: 'puppy', label: 'Puppy' },
            { value: 'started', label: 'Started' },
            { value: 'finished', label: 'Finished' },
            { value: 'brood', label: 'Brood' },
          ]} />
          <Field label="Price ($)" name="price" type="number" step="0.01" defaultValue={String((dog.price ?? 0) / 100)} />
          <SelectField label="Status" name="status" defaultValue={dog.status ?? 'active'} options={[
            { value: 'active', label: 'Active' },
            { value: 'draft', label: 'Draft' },
            { value: 'pending', label: 'Pending' },
            { value: 'sold', label: 'Sold' },
          ]} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="City" name="location_city" defaultValue={dog.location_city ?? ''} />
          <SelectField label="State" name="location_state" defaultValue={dog.location_state ?? ''} options={US_STATES.map(s => ({ value: s, label: s }))} />
        </div>

        <Field label="Description" name="description" defaultValue={dog.description ?? ''} textarea />
        <Field label="Video URL" name="video_url" defaultValue={dog.video_url ?? ''} />
        <Field label="Pedigree URL" name="pedigree_url" defaultValue={dog.pedigree_url ?? ''} />

        <div className="mt-4">
          <CheckboxField label="Featured listing" name="featured" defaultChecked={dog.featured ?? false} />
        </div>

        {dog.images && (dog.images as string[]).length > 0 && (
          <div className="mt-4">
            <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', marginBottom: 8 }}>Photos ({(dog.images as string[]).length}) — first photo is the cover</p>
            <div className="flex gap-3 flex-wrap">
              {(dog.images as string[]).map((img: string, i: number) => (
                <div key={i} className="flex flex-col gap-1" style={{ width: 96 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Photo ${i + 1}`} style={{ width: 96, height: 96, objectFit: 'cover', border: i === 0 ? '2px solid #D85A1C' : '1px solid #D9C8A6' }} />
                  <div className="flex gap-1">
                    {i !== 0 && <ConfirmActionButton action={makeListingPhotoPrimary.bind(null, id, img)} label="Cover" />}
                    <ConfirmActionButton action={removeListingPhoto.bind(null, id, img)} label="✕" confirmText="Remove this photo from the listing?" danger />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {dog.health_certs && (dog.health_certs as string[]).length > 0 && (
          <div className="mt-4">
            <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', marginBottom: 8 }}>Health Certs</p>
            <div className="flex gap-2 flex-wrap">
              {(dog.health_certs as string[]).map((cert: string, i: number) => (
                <span key={i} style={{ ...sans, fontSize: 12, padding: '4px 10px', background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534' }}>{cert}</span>
              ))}
            </div>
          </div>
        )}

        {dog.hunt_titles && (dog.hunt_titles as string[]).length > 0 && (
          <div className="mt-4">
            <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7C7A6E', marginBottom: 8 }}>Hunt Titles</p>
            <div className="flex gap-2 flex-wrap">
              {(dog.hunt_titles as string[]).map((title: string, i: number) => (
                <span key={i} style={{ ...sans, fontSize: 12, padding: '4px 10px', background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' }}>{title}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <SubmitButton />
          <DeleteButton action={deleteWithId} label="Delete Listing" confirmText="Permanently delete this listing (and its conversations)?" redirectTo="/admin/listings" />
        </div>
      </AdminForm>

      {/* Reassign to another seller */}
      <div className="mt-6" style={{ background: 'white', border: '1px solid #D9C8A6', padding: 24 }}>
        <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D85A1C', marginBottom: 10 }}>Reassign listing to another seller</p>
        <form action={reassignListing.bind(null, id)} className="flex gap-2 flex-wrap items-center">
          <select name="new_seller_id" defaultValue="" style={{ ...sans, fontSize: 13, padding: '8px 12px', border: '1px solid #D9C8A6', background: 'white', minWidth: 260 }}>
            <option value="" disabled>Select a user…</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} disabled={u.id === dog.seller_id}>
                {u.label}{u.id === dog.seller_id ? ' (current)' : ''}
              </option>
            ))}
          </select>
          <button type="submit" style={{ ...sans, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', background: '#0F0F0E', color: '#EFE7D4', border: 'none', padding: '10px 16px', cursor: 'pointer' }}>Reassign</button>
        </form>
        <p style={{ ...sans, fontSize: 11, color: '#7C7A6E', marginTop: 8 }}>Keeps the listing and its photos; only ownership changes. Logged to the activity log.</p>
      </div>
    </div>
  )
}
