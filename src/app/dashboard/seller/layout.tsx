import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seller Dashboard',
  description: 'Manage your workflows, sales, and store on Neaply.',
}

export default function SellerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
