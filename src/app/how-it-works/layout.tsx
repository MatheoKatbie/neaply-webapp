import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how Neaply works for buyers and sellers. Discover, purchase, and sell automation workflows.',
}

export default function HowItWorksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
