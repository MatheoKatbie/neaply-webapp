import type { Metadata } from 'next'
import VantaBackground from '@/components/VantaBackground';

export const metadata: Metadata = {
  title: 'FlowMarket - Buy & Sell n8n Workflows | Automation Marketplace',
  description: 'The premier marketplace for n8n workflow automation. Discover ready-to-use workflows or sell your own creations to the automation community. Join thousands of users automating their workflows.',
  keywords: 'n8n, workflows, automation, marketplace, buy workflows, sell workflows, no-code automation',
  openGraph: {
    title: 'FlowMarket - Buy & Sell n8n Workflows',
    description: 'The premier marketplace for n8n workflow automation. Discover ready-to-use workflows or sell your own creations.',
    type: 'website',
    url: 'https://flowmarket.com',
    images: [
      {
        url: '/images/hero.png',
        width: 1200,
        height: 630,
        alt: 'FlowMarket - n8n Workflow Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowMarket - Buy & Sell n8n Workflows',
    description: 'The premier marketplace for n8n workflow automation.',
    images: ['/images/hero.png'],
  },
}

export default function Home() {
  return (
    <VantaBackground />
  );
}
