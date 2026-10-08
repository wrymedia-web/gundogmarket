import { redirect } from 'next/navigation'

// Legacy URL — pricing moved to /pricing
export default function UpgradeRedirect() {
  redirect('/pricing')
}
