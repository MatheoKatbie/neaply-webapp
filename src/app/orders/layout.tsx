import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Orders',
  description: 'View and manage your workflow purchases on Neaply.',
}

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
