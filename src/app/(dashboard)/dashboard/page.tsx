import Link from 'next/link'
import { MOCK_DOGS, formatPrice, TRAINING_LEVEL_LABELS, type TrainingLevel } from '@/lib/mock-data'

const montserrat: React.CSSProperties = {
  fontFamily: "'Montserrat', var(--font-montserrat), system-ui, sans-serif",
}

const inter: React.CSSProperties = {
  fontFamily: "'Inter', var(--font-inter), system-ui, sans-serif",
}

// Use first 3 dogs as mock "my listings"
const myListings = MOCK_DOGS.slice(0, 3)

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-black uppercase mb-1"
          style={{ ...montserrat, color: '#0E0E0E', letterSpacing: '-0.02em' }}
        >
          My Dashboard
        </h1>
        <p className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
          Manage your listings and seller profile.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { label: 'Active Listings', value: '3', icon: '🐕' },
          { label: 'Profile Views (30d)', value: '142', icon: '👁️' },
          { label: 'Inquiries', value: '7', icon: '💬' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 flex items-center gap-4"
            style={{ background: 'white', border: '1px solid #D9C8A6' }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center text-2xl"
              style={{ background: '#F4EFE5' }}
            >
              {stat.icon}
            </div>
            <div>
              <div
                className="text-2xl font-black"
                style={{ ...montserrat, color: '#0E0E0E' }}
              >
                {stat.value}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7C7A6E', ...inter }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Listings table */}
      <div style={{ background: 'white', border: '1px solid #D9C8A6' }}>
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #EAE4D6' }}
        >
          <h2
            className="text-base font-black uppercase"
            style={{ ...montserrat, color: '#0E0E0E' }}
          >
            My Listings
          </h2>
          <Link
            href="/sell"
            className="text-xs font-bold px-4 py-2 text-white uppercase tracking-widest"
            style={{ background: '#D4600A', ...inter }}
          >
            + Create New Listing
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #EAE4D6', background: '#F4EFE5' }}>
                {['Dog', 'Breed', 'Level', 'Price', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#7C7A6E', ...inter }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {myListings.map((dog, i) => (
                <tr
                  key={dog.id}
                  style={{ borderBottom: i < myListings.length - 1 ? '1px solid #EAE4D6' : 'none' }}
                >
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: '#0E0E0E', ...inter }}
                    >
                      {dog.title}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#7C7A6E', ...inter }}>
                      {dog.breed}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-bold px-2 py-1 uppercase tracking-wider"
                      style={{ background: '#EAE4D6', color: '#7C7A6E', ...inter }}
                    >
                      {TRAINING_LEVEL_LABELS[dog.training_level as TrainingLevel]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-sm font-bold"
                      style={{ color: '#D4600A', ...inter }}
                    >
                      {formatPrice(dog.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-bold px-2 py-1 uppercase tracking-wider"
                      style={{ background: '#DCFCE7', color: '#166534', ...inter }}
                    >
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/dogs/${dog.id}`}
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: '#D4600A', ...inter }}
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
