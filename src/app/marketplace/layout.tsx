import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Browse and discover automation workflows for Make, n8n, Zapier, and more.',
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
