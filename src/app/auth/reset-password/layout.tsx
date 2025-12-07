import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your Neaply account password.',
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
