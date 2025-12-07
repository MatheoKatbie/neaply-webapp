import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Join Neaply to discover and purchase automation workflows, or start selling your own.',
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
