import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id },
      select: {
        title: true,
        shortDesc: true,
        heroImageUrl: true,
        seller: {
          select: {
            displayName: true,
          },
        },
      },
    })

    if (!workflow) {
      return {
        title: 'Workflow Not Found',
      }
    }

    return {
      title: workflow.title,
      description: workflow.shortDesc || `${workflow.title} - Automation workflow by ${workflow.seller.displayName} on Neaply.`,
      openGraph: {
        title: `${workflow.title} | Neaply`,
        description: workflow.shortDesc || `Automation workflow by ${workflow.seller.displayName} on Neaply.`,
        images: workflow.heroImageUrl ? [{ url: workflow.heroImageUrl }] : undefined,
      },
    }
  } catch (error) {
    return {
      title: 'Workflow',
    }
  }
}

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
