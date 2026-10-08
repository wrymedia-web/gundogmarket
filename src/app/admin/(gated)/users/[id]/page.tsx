import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { getAdminContext } from '@/lib/admin'
import { updateUser, deleteUser, banUser, unbanUser, sendPasswordReset, grantCompPro, revokeCompPro } from '@/app/admin/actions'
import { AdminForm, Field, SelectField, CheckboxField, SubmitButton, DeleteButton } from '@/app/admin/form-components'
import { ConfirmActionButton } from '@/app/admin/action-buttons'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = {
  ...sans, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em',
}

export const dynamic = 'force-dynamic'

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!user) notFound()

  const { count: listingCount } = await supabase
    .from('dogs')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', id)

  const ctx = await getAdminContext()
  const service = createServiceClient()
  const [{ data: authData }, { data: userDogs }, { count: convCount }] = await Promise.all([
    service.auth.admin.getUserById(id),
    service.from('dogs').select('id, title, status, price, created_at').eq('seller_id', id).order('created_at', { ascending: false }),
    service.from('conversations').select('id', { count: 'exact', head: true }).or(`buyer_id.eq.${id},seller_id.eq.${id}`),
  ])
  const authUser = authData?.user
  const banned = !!(authUser as unknown as { banned_until?: string })?.banned_until &&
    new Date((authUser as unknown as { banned_until: string }).banned_until).getTime() > Date.now()

  const updateWithId = updateUser.bind(null, id)
  const deleteWithId = deleteUser.bind(null, id)
  const banBound = banUser.bind(null, id)
  const unbanBound = unbanUser.bind(null, id)
  const resetBound = sendPasswordReset.bind(null, id)
  const grantBound = grantCompPro.bind(null, id)
  const revokeBound = revokeCompPro.bind(null, id)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" style={{ ...sans, fontSize: 13, color: '#D85A1C', fontWeight: 600, textDecoration: 'none' }}>← Users</Link>
        <span style={{ color: '#D9C8A6' }}>/</span>
        <span style={{ ...sans, fontSize: 13, color: '#7C7A6E' }}>{user.full_name || '(no name)'}</span>
      </div>

      <h1 style={{ ...display, fontSize: 24, color: '#0F0F0E', marginBottom: 4 }}>
        Edit User {banned && <span style={{ ...sans, fontSize: 11, fontWeight: 700, padding: '3px 8px', background: '#B03A1F', color: 'white', verticalAlign: 'middle' }}>BANNED</span>}
      </h1>
      <p style={{ ...sans, fontSize: 12, color: '#7C7A6E', marginBottom: 6, fontFamily: 'monospace' }}>
        {user.id} · Joined {new Date(user.created_at).toLocaleDateString()} · {listingCount ?? 0} listing{listingCount === 1 ? '' : 's'} · {convCount ?? 0} conversation{convCount === 1 ? '' : 's'}
      </p>
      <p style={{ ...sans, fontSize: 13, color: '#0F0F0E', marginBottom: 20 }}>
        <strong>{authUser?.email ?? 'no email'}</strong>
        {authUser?.last_sign_in_at && <span style={{ color: '#7C7A6E' }}> · last sign-in {new Date(authUser.last_sign_in_at).toLocaleString()}</span>}
        {user.stripe_customer_id && <> · <a href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`} target="_blank" style={{ color: '#D85A1C' }}>Stripe customer ↗</a></>}
      </p>

      {/* Account actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        {banned
          ? <ConfirmActionButton action={unbanBound} label="Unban Account" confirmText="Reactivate this account?" />
          : <ConfirmActionButton action={banBound} label="Ban Account" confirmText="Ban this account? They will be unable to sign in." danger />}
        <ConfirmActionButton action={resetBound} label="Send Password Reset" confirmText={`Email a password-reset link to ${authUser?.email}?`} />
        {user.subscription_tier === 'pro'
          ? <ConfirmActionButton action={revokeBound} label="Revoke Comp Pro" confirmText="Downgrade to Free? (Blocked if they have a real Stripe subscription.)" danger />
          : <ConfirmActionButton action={grantBound} label="Grant Comp Pro" confirmText="Give this account Breeder Pro for free?" />}
      </div>

      <AdminForm action={updateWithId}>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Full Name" name="full_name" defaultValue={user.full_name ?? ''} />
          <Field label="Kennel Name" name="kennel_name" defaultValue={user.kennel_name ?? ''} />
          <Field label="City" name="location_city" defaultValue={user.location_city ?? ''} />
          <Field label="State" name="location_state" defaultValue={user.location_state ?? ''} />
          <Field label="Phone" name="phone" defaultValue={user.phone ?? ''} />
          <Field label="Website" name="website" defaultValue={user.website ?? ''} />
        </div>
        <Field label="Bio" name="bio" defaultValue={user.bio ?? ''} textarea />

        <div style={{ height: 1, background: '#D9C8A6', margin: '20px 0' }} />
        <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#D85A1C', marginBottom: 12 }}>Trust & Subscription</p>

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Plan" name="subscription_tier" defaultValue={user.subscription_tier ?? 'free'} options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Breeder Pro' },
          ]} />
          <SelectField label="Verification" name="verification_status" defaultValue={user.verification_status ?? 'unverified'} options={[
            { value: 'unverified', label: 'Unverified' },
            { value: 'pending', label: 'Pending' },
            { value: 'verified', label: 'Verified' },
            { value: 'rejected', label: 'Rejected' },
          ]} />
          {ctx?.role === 'super_admin' ? (
            <SelectField label="Role (super admin only)" name="role" defaultValue={user.role ?? 'user'} options={[
              { value: 'user', label: 'User' },
              { value: 'admin', label: 'Admin' },
              { value: 'super_admin', label: 'Super Admin' },
            ]} />
          ) : (
            <div>
              <p style={{ ...sans, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7C7A6E', marginBottom: 4 }}>Role</p>
              <p style={{ ...sans, fontSize: 14 }}>{user.role ?? 'user'} <span style={{ color: '#7C7A6E', fontSize: 11 }}>(change requires super admin)</span></p>
            </div>
          )}
        </div>

        <div className="flex gap-6 mt-4">
          <CheckboxField label="Verified badge" name="verified" defaultChecked={user.verified ?? false} />
          <CheckboxField label="Breeder Pro badge" name="breeder_pro" defaultChecked={user.breeder_pro ?? false} />
        </div>

        <div className="flex items-center justify-between mt-8">
          <SubmitButton />
          {ctx?.role === 'super_admin' && (
            <DeleteButton action={deleteWithId} label="Delete User" confirmText="Permanently delete this user, their auth account, and ALL their listings?" redirectTo="/admin/users" />
          )}
        </div>
      </AdminForm>

      {/* Listings */}
      {(userDogs ?? []).length > 0 && (
        <div className="mt-8">
          <p style={{ ...sans, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D85A1C', marginBottom: 10 }}>Listings</p>
          <div style={{ background: 'white', border: '1px solid #D9C8A6' }}>
            {(userDogs ?? []).map((d) => (
              <Link key={d.id} href={`/admin/listings/${d.id}`} className="flex items-center justify-between px-4 py-3" style={{ textDecoration: 'none', borderBottom: '1px solid #EAE4D6' }}>
                <span style={{ ...sans, fontSize: 13, color: '#0F0F0E', fontWeight: 600 }}>{d.title}</span>
                <span style={{ ...sans, fontSize: 11, color: '#7C7A6E' }}>{d.status} · ${((d.price ?? 0) / 100).toLocaleString()} · {new Date(d.created_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
