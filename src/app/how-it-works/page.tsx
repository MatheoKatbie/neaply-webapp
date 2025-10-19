'use client'

import { Button } from '@/components/ui/button'
import {
  BarChart3,
  CheckCircle,
  CreditCard,
  Download,
  Lock,
  RefreshCw,
  Settings,
  Shield,
  Store,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

export default function HowItWorksPage() {
  const buyerFeatures = [
    {
      icon: Download,
      title: 'Instant Download',
      description: 'Get instant access to workflows immediately after purchase. No waiting, no delays. Start automating right away.',
    },
    {
      icon: Lock,
      title: 'Lifetime Access',
      description: 'Once purchased, the workflow is yours forever. Access it anytime, anywhere, without recurring fees.',
    },
    {
      icon: RefreshCw,
      title: 'Free Updates',
      description: 'Receive all updates and improvements for free. Creators continuously improve workflows, and you benefit automatically.',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'All transactions are protected with industry-standard encryption. Your payment data and personal information are secure.',
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Get help from creators and the community. Leave reviews and access detailed documentation.',
    },
    {
      icon: CheckCircle,
      title: 'Quality Guaranteed',
      description: 'All workflows are reviewed and tested. Browse reviews and ratings from other users before purchasing.',
    },
  ]

  const sellerFeatures = [
    {
      icon: Store,
      title: 'Create Your Store',
      description: 'Set up your seller profile in minutes. Customize your store with branding, bio, and contact information.',
    },
    {
      icon: CreditCard,
      title: 'Stripe Integration',
      description: 'Connect your Stripe account for secure payments. Set up is simple and takes just a few clicks.',
    },
    {
      icon: TrendingUp,
      title: 'Instant Payouts',
      description: 'Earn money instantly. Sales are processed automatically and transferred to your connected Stripe account.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your sales, revenue, and performance in real-time. Understand what workflows are selling best.',
    },
    {
      icon: Zap,
      title: 'Monetize Your Work',
      description: 'Turn your automation knowledge into income. Set your own prices and reach a global audience.',
    },
    {
      icon: Settings,
      title: 'Full Control',
      description: 'Manage versions, updates, and pricing. Update workflows with new features and improvements anytime.',
    },
  ]

  const FeatureCard = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ComponentType<{ className?: string }>
    title: string
    description: string
  }) => (
    <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-6 hover:border-[#505050] transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#2a2a2a] rounded-lg flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2 font-aeonikpro">{title}</h3>
          <p className="text-sm text-[#999999] leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="min-h-screen bg-[#0f0f0f] pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-8">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="flex flex-col items-center text-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-white font-space-grotesk mb-4">
                How It Works
              </h1>
              <div className="w-24 h-1 bg-white rounded-full mb-6"></div>
              <p className="text-xl text-[#999999] max-w-2xl leading-relaxed font-aeonikpro">
                Whether you're looking to automate your workflow or monetize your expertise, FlowMarket makes it simple and secure.
              </p>
            </div>
          </div>

          {/* Buyer Section */}
          <div className="flex flex-col gap-6">
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#2a2a2a] rounded-lg">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white font-space-grotesk">For Buyers</h2>
              </div>
              <p className="text-lg text-[#999999] max-w-2xl font-aeonikpro">
                Browse and purchase powerful workflows to automate your business processes. Get instant access and enjoy lifetime benefits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {buyerFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>

            {/* Buyer Steps */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-8 font-aeonikpro">Getting Started as a Buyer</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Browse Workflows',
                    description: 'Explore our marketplace and find workflows that match your needs.',
                  },
                  {
                    step: '2',
                    title: 'Review Details',
                    description: 'Check ratings, reviews, and documentation to make an informed decision.',
                  },
                  {
                    step: '3',
                    title: 'Purchase Securely',
                    description: 'Complete your purchase with secure payment processing via Stripe.',
                  },
                  {
                    step: '4',
                    title: 'Start Using',
                    description: 'Download and import your workflow immediately. Access it forever.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold mb-4">
                      {item.step}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-[#999999]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Link href="/marketplace">
                <Button className="bg-white text-black hover:bg-[#e0e0e0] px-8 py-3 rounded-lg transition-all font-semibold">
                  Explore Marketplace
                </Button>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="my-20 border-t border-[#3a3a3a]"></div>

          {/* Seller Section */}
          <div className="mb-20">
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="p-3 bg-[#2a2a2a] rounded-lg">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white font-space-grotesk">For Sellers</h2>
              </div>
              <p className="text-lg text-[#999999] max-w-2xl font-aeonikpro">
                Turn your workflow expertise into income. Create a store, list your workflows, and start earning from a global audience.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sellerFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>

            {/* Seller Steps */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-8">
              <h3 className="text-2xl font-bold text-white mb-8 font-aeonikpro">Getting Started as a Seller</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    step: '1',
                    title: 'Create Account',
                    description: 'Sign up for free and set up your seller profile with your information.',
                  },
                  {
                    step: '2',
                    title: 'Connect Stripe',
                    description: 'Link your Stripe account to receive payments. It takes just a few clicks.',
                  },
                  {
                    step: '3',
                    title: 'List Workflows',
                    description: 'Upload your workflows with descriptions, pricing, and documentation.',
                  },
                  {
                    step: '4',
                    title: 'Start Earning',
                    description: 'Receive payments instantly as customers purchase your workflows.',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center text-lg font-bold mb-4">
                      {item.step}
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-[#999999]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info for Sellers */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3 font-aeonikpro">Why Sell on FlowMarket?</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Global reach to thousands of users</span>
                  </li>
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>No upfront fees or commissions</span>
                  </li>
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Full control over pricing and updates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3 font-aeonikpro">Supported Platforms</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>n8n workflows</span>
                  </li>
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Zapier zaps</span>
                  </li>
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Make scenarios</span>
                  </li>
                </ul>
              </div>

              <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-3 font-aeonikpro">Payments & Payouts</h4>
                <ul className="space-y-2">
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Instant Stripe payouts</span>
                  </li>
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Real-time sales tracking</span>
                  </li>
                  <li className="text-sm text-[#999999] flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                    <span>Detailed analytics</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Link href="/become-seller">
                <Button className="bg-white text-black hover:bg-[#e0e0e0] px-8 py-3 rounded-lg transition-all font-semibold">
                  Become a Seller
                </Button>
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-8 font-space-grotesk text-center">Frequently Asked Questions</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  question: 'Is it really free to create a seller account?',
                  answer:
                    'Yes! Creating a seller account is completely free. You only earn money when someone purchases your workflow.',
                },
                {
                  question: 'How do payouts work?',
                  answer:
                    'Payouts are processed instantly to your connected Stripe account. You can withdraw your earnings anytime.',
                },
                {
                  question: 'Can I edit my workflows after publishing?',
                  answer:
                    'Absolutely! You can update your workflows, add new versions, and improve existing ones anytime.',
                },
                {
                  question: 'What payment methods are accepted?',
                  answer:
                    'We accept all major payment methods supported by Stripe, including credit cards, debit cards, and digital wallets.',
                },
                {
                  question: 'Is my workflow data secure?',
                  answer:
                    'Yes, all data is encrypted and protected. We use industry-standard security practices and comply with data protection regulations.',
                },
                {
                  question: 'Can I sell multiple workflows?',
                  answer:
                    'Yes! You can create multiple workflows and sell as many as you want. There are no limits.',
                },
              ].map((faq, index) => (
                <div key={index} className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-3">{faq.question}</h4>
                  <p className="text-sm text-[#999999]">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4 font-space-grotesk">Ready to Get Started?</h2>
            <p className="text-lg text-[#999999] mb-8 max-w-2xl mx-auto">
              Join thousands of users and creators on FlowMarket. Automate your business or start earning from your expertise today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button className="bg-white text-black hover:bg-[#e0e0e0] px-8 py-3 rounded-lg transition-all font-semibold">
                  Browse Workflows
                </Button>
              </Link>
              <Link href="/become-seller">
                <Button
                  variant="outline"
                  className="border-[#3a3a3a] bg-transparent text-white hover:bg-[#2a2a2a] hover:border-[#505050] px-8 py-3 rounded-lg transition-all font-semibold"
                >
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
