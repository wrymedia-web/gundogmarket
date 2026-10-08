# GunDog Exchange — Admin Dashboard

**URL:** https://gundogexchange.com/admin (requires admin role + MFA)

## Accessing it (first time)

Two super-admin accounts exist:
1. **westinyancey@gmail.com** — your everyday Google account (recommended for day-to-day use)
2. **info@gundogexchange.com** — created but has no password/mailbox yet (see "Activating info@" below)

First login:
1. Sign in at https://gundogexchange.com/login with your email + password
2. Go to https://gundogexchange.com/admin → you'll be sent to **Security (MFA)**
3. Tap "Set Up Authenticator", scan the QR with Google Authenticator / 1Password / Authy, enter the 6-digit code
4. You're in. On every future fresh login you'll enter a current 6-digit code once to unlock the dashboard.

## Activating info@gundogexchange.com as Super Admin
The account is pre-created with the super_admin role. To use it you need a password, which requires a reachable mailbox:
- **Option A (recommended):** set up the info@gundogexchange.com mailbox (it has no MX records today), then from the login page use "Forgot password" to set a password, then enroll MFA.
- **Option B:** just use westinyancey@gmail.com — it already has full super-admin control. info@ can stay as a break-glass account.
Never share passwords or MFA codes over chat/email.

## Roles
- **super_admin** — full control incl. role changes, user deletion, refunds
- **admin** — everything except: changing roles, deleting users, issuing refunds
Invite more admins from **Settings → Invite a new admin** (super admin only).

## Sections
- **Overview** — live marketplace + Stripe revenue metrics and 8-week trend charts
- **Listings** — search/filter all listings, edit, feature, change status, reorder/remove photos, reassign to another seller, delete
- **Users** — search, edit profile, ban/unban, send password reset, grant/revoke comp Pro, view their listings & activity; delete (super admin)
- **Subscriptions** — plan definitions, Pro roster (Stripe vs complimentary), grant comp Pro
- **Payments** — GDE subscriptions & invoices (filtered out of the shared OutfitterDesk account), links to Stripe, refunds (super admin)
- **Messages** — conversation metrics + audit-logged thread viewer for moderation
- **Activity Log** — immutable record of every admin action
- **Settings** — admin accounts, invites, system health (Supabase/Stripe/webhook/email)
- **Security (MFA)** — enroll/manage your authenticator

## Security model
- Role + MFA (AAL2) enforced server-side on every admin page and every action
- Service-role DB access only inside role-checked server actions; no client-only checks
- Trust columns (verified/tier/role/stripe_*) writable only by service role (DB trigger)
- Private message access and all mutations written to the audit log with admin email + timestamp
- No secrets/keys ever rendered in the UI
