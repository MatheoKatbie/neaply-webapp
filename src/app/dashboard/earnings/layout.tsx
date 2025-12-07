import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Earnings',
  description: 'View your earnings and payouts on Neaply.',
}

export default function EarningsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
