import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Center',
  description: 'Find answers to your questions about Neaply, buying workflows, selling, and more.',
}

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
