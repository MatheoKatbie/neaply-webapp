import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Successful',
  description: 'Your order has been successfully processed.',
}

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
