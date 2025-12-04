import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for automation workflows on Neaply.',
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
