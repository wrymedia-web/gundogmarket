import Navbar from '@/components/navbar'
import Link from 'next/link'

const sans: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
}
const display: React.CSSProperties = {
  ...sans,
  fontWeight: 900,
  textTransform: 'uppercase',
  letterSpacing: '-0.02em',
  lineHeight: 0.95,
}

export const metadata = {
  title: 'Privacy Policy — GunDog Exchange',
}

export default function PrivacyPage() {
  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 style={{ ...display, fontSize: 32, color: '#0F0F0E', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 32 }}>Last updated: October 2026</p>

        <div style={{ ...sans, fontSize: 15, color: '#4A4A4A', lineHeight: 1.75 }}>
          <Section title="1. Information We Collect">
            We collect information you provide when creating an account (name, email, location) and when creating listings (dog details, photos). We also collect usage data such as pages visited, browser type, and IP address through standard web analytics.
          </Section>

          <Section title="2. How We Use Your Information">
            We use your information to: operate and improve the marketplace; display your listings and seller profile to potential buyers; process subscription payments through Stripe; send transactional emails (account confirmation, messages from buyers); and prevent fraud or abuse.
          </Section>

          <Section title="3. Information Sharing">
            Your seller profile (name, kennel name, state) is visible to all site visitors. Your email address is never displayed publicly. We share payment information with Stripe to process subscriptions. We do not sell your personal information to third parties.
          </Section>

          <Section title="4. Cookies">
            We use essential cookies to maintain your login session. We may use analytics cookies to understand site usage. You can disable cookies in your browser settings, but some features may not work properly.
          </Section>

          <Section title="5. Data Retention">
            We retain your account data as long as your account is active. You may request deletion of your account and associated data by emailing us. Listings that have been publicly visible may be retained in anonymized form.
          </Section>

          <Section title="6. Security">
            We use industry-standard security measures including encrypted connections (HTTPS), secure password hashing, and row-level security on our database. No system is 100% secure, and we cannot guarantee absolute security.
          </Section>

          <Section title="7. Your Rights">
            You may access, update, or delete your personal information through your account settings. For data export or deletion requests, contact us at support@gundogexchange.com.
          </Section>

          <Section title="8. Changes">
            We may update this policy from time to time. We will notify you of material changes via email or site notice.
          </Section>

          <Section title="9. Contact">
            Questions about this policy? Email us at support@gundogexchange.com.
          </Section>
        </div>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid #D9C8A6' }}>
          <Link href="/" style={{ ...sans, fontSize: 13, color: '#D85A1C', fontWeight: 600 }}>← Back to GunDog Exchange</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ ...sans, fontWeight: 800, fontSize: 14, color: '#0F0F0E', marginBottom: 8 }}>{title}</h2>
      <p>{children}</p>
    </div>
  )
}
