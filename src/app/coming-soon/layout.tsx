import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coming Soon',
  description: 'Neaply is launching soon. Join our waitlist to be the first to know!',
}

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
