import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const seller = await prisma.sellerProfile.findFirst({
      where: { slug },
      select: {
        storeName: true,
        bio: true,
        logoUrl: true,
      },
    })

    if (!seller) {
      return {
        title: 'Store Not Found',
      }
    }

    return {
      title: seller.storeName,
      description: seller.bio || `Browse automation workflows from ${seller.storeName} on Neaply.`,
      openGraph: {
        title: `${seller.storeName} | Neaply`,
        description: seller.bio || `Browse automation workflows from ${seller.storeName} on Neaply.`,
        images: seller.logoUrl ? [{ url: seller.logoUrl }] : undefined,
      },
    }
  } catch (error) {
    return {
      title: 'Store',
    }
  }
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
