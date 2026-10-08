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
  title: 'Terms of Service — GunDog Exchange',
}

export default function TermsPage() {
  return (
    <div style={{ background: '#EFE7D4', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 style={{ ...display, fontSize: 32, color: '#0F0F0E', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ ...sans, fontSize: 13, color: '#7C7A6E', marginBottom: 32 }}>Last updated: October 2026</p>

        <div style={{ ...sans, fontSize: 15, color: '#4A4A4A', lineHeight: 1.75 }}>
          <Section title="1. Overview">
            GunDog Exchange (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates gundogexchange.com, a marketplace connecting buyers and sellers of working bird dogs. By using the site you agree to these terms.
          </Section>

          <Section title="2. Accounts">
            You must provide accurate information when creating an account. You are responsible for all activity under your account and for keeping your password secure. We may suspend or terminate accounts that violate these terms.
          </Section>

          <Section title="3. Listings">
            Sellers are responsible for the accuracy of their listings, including descriptions, photos, health certifications, and hunt titles. Misrepresentation may result in listing removal and account suspension. We reserve the right to remove any listing at our discretion.
          </Section>

          <Section title="4. Transactions">
            GunDog Exchange is a listing and communication platform. All transactions — including price negotiation, payment, and delivery — are between the buyer and seller. We do not handle payments, hold funds, or provide escrow services. We are not a party to any sale.
          </Section>

          <Section title="5. Subscriptions">
            Paid plans (Breeder Pro) are billed monthly through Stripe. You may cancel at any time from your account settings. Cancellation takes effect at the end of the current billing period. No refunds for partial months.
          </Section>

          <Section title="6. Prohibited Conduct">
            You may not: post fraudulent listings; misrepresent a dog&apos;s health, lineage, or training; harass other users; use the platform for any illegal purpose; or attempt to circumvent listing limits or security measures.
          </Section>

          <Section title="7. Limitation of Liability">
            GunDog Exchange provides a platform for connecting buyers and sellers. We do not verify the health, training, lineage, or condition of any dog listed. We are not liable for any disputes, losses, or damages arising from transactions between users.
          </Section>

          <Section title="8. Changes">
            We may update these terms at any time. Continued use of the site after changes constitutes acceptance. Material changes will be communicated via email or site notice.
          </Section>

          <Section title="9. Contact">
            Questions about these terms? Email us at support@gundogexchange.com.
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
