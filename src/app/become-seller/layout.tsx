import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Seller',
  description: 'Start selling your automation workflows on Neaply. Reach thousands of businesses and earn from your expertise.',
}

export default function BecomeSellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
