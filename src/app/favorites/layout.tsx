import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Favorites',
  description: 'Your saved automation workflows on Neaply.',
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
