'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  HelpCircle,
  Search,
  ShoppingCart,
  Wallet,
  Package,
  User,
  Shield,
  MessageCircle,
  Download,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: User,
      questions: [
        {
          q: 'What is Neaply?',
          a: 'Neaply is a marketplace where you can buy and sell automation workflows. We specialize in workflows for various automation platforms, making it easy for businesses and individuals to automate their processes.',
        },
        {
          q: 'How do I create an account?',
          a: 'Click on the "Sign Up" button in the top right corner of the page. You can sign up using your email, Google account, or GitHub account. Once registered, you can start browsing and purchasing workflows immediately.',
        },
        {
          q: 'Do I need an account to browse workflows?',
          a: 'No, you can browse the marketplace without an account. However, you need to create an account to purchase workflows, save favorites, or become a seller.',
        },
      ],
    },
    {
      title: 'Buying Workflows',
      icon: ShoppingCart,
      questions: [
        {
          q: 'How do I purchase a workflow?',
          a: 'Browse the marketplace, find a workflow you like, and click "Add to Cart" or "Buy Now". You\'ll be redirected to checkout where you can complete your purchase using a credit card via Stripe.',
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept all major credit and debit cards through our secure payment processor, Stripe. This includes Visa, Mastercard, American Express, and more.',
        },
        {
          q: 'Can I get a refund?',
          a: 'Due to the digital nature of our products, we generally don\'t offer refunds. However, if you experience technical issues with a workflow, please contact our support team or the seller directly.',
        },
        {
          q: 'How do I download my purchased workflows?',
          a: 'After purchase, you can download your workflows from the "Orders" page in your dashboard. You\'ll receive both a JSON file and a ZIP archive containing all workflow assets.',
        },
      ],
    },
    {
      title: 'Selling Workflows',
      icon: Package,
      questions: [
        {
          q: 'How do I become a seller?',
          a: 'Click on "Become a Seller" in the navigation menu. You\'ll need to complete your seller profile, connect your Stripe account for payments, and agree to our seller terms.',
        },
        {
          q: 'What commission does Neaply charge?',
          a: 'Neaply charges a platform fee on each sale. The exact percentage varies based on your seller tier and sales volume. Check your seller dashboard for detailed pricing.',
        },
        {
          q: 'How do I receive payments?',
          a: 'Payments are processed through Stripe Connect. You\'ll receive payouts directly to your bank account according to your payout schedule (usually within 2-7 business days).',
        },
        {
          q: 'Can I create workflow packs?',
          a: 'Yes! You can bundle multiple workflows together into packs at a discounted price. This is a great way to offer value to customers and increase your sales.',
        },
      ],
    },
    {
      title: 'Workflows & Downloads',
      icon: Download,
      questions: [
        {
          q: 'What formats are workflows available in?',
          a: 'Workflows are provided as JSON files that can be imported directly into your automation platform. They also come with documentation and any necessary assets in a ZIP file.',
        },
        {
          q: 'Can I use workflows on multiple projects?',
          a: 'Yes, once you purchase a workflow, you have a perpetual license to use it across unlimited projects. You cannot resell or redistribute the workflow.',
        },
        {
          q: 'How do I import a workflow?',
          a: 'After downloading, go to your automation platform and look for the import function. Upload the JSON file, and the workflow will be imported with all its nodes and configurations.',
        },
        {
          q: 'Are workflows updated?',
          a: 'Some sellers provide updates to their workflows. Check the workflow page for update information. You\'ll be notified if updates are available for workflows you\'ve purchased.',
        },
      ],
    },
    {
      title: 'Payments & Security',
      icon: CreditCard,
      questions: [
        {
          q: 'Is my payment information secure?',
          a: 'Yes, absolutely. We use Stripe for payment processing, which is PCI-compliant and uses industry-standard encryption. We never store your credit card information on our servers.',
        },
        {
          q: 'Why do I need to connect Stripe as a seller?',
          a: 'Stripe Connect allows us to securely transfer payments directly to your bank account. It\'s the most secure and reliable way to handle seller payouts.',
        },
        {
          q: 'Can I see my transaction history?',
          a: 'Yes, you can view all your purchases in the "Orders" section and all your sales in the "Seller Dashboard" under "Earnings".',
        },
      ],
    },
    {
      title: 'Account & Settings',
      icon: Shield,
      questions: [
        {
          q: 'How do I update my profile?',
          a: 'Go to "Settings" from your account menu. Here you can update your email, password, profile picture, and other account details.',
        },
        {
          q: 'Can I enable two-factor authentication?',
          a: 'Yes, we strongly recommend enabling 2FA for added security. You can set this up in your account settings under the Security section.',
        },
        {
          q: 'How do I delete my account?',
          a: 'If you wish to delete your account, go to Settings and scroll to the bottom. Note that this action is permanent and cannot be undone.',
        },
        {
          q: 'Can I change my username or store name?',
          a: 'Yes, you can update your display name and store name in your profile settings. Your unique identifier (slug) can be changed once every 30 days.',
        },
      ],
    },
  ]

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        searchQuery === '' ||
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0)

  return (
    <>
      <div className="min-h-screen bg-[#08080A] pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
              <HelpCircle className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-[#EDEFF7] mb-4 font-aeonikpro">Help Center</h1>
            <p className="text-lg text-[#9DA2B3] font-aeonikpro">
              Find answers to frequently asked questions about Neaply
            </p>
          </div>

          {/* Search Bar */}
          <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 mb-8">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9DA2B3]" />
                <Input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1E1E24] border-[#9DA2B3]/25 text-[#EDEFF7] placeholder-[#9DA2B3] font-aeonikpro"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Categories */}
          {filteredCategories.length > 0 ? (
            <div className="space-y-8">
              {filteredCategories.map((category, idx) => (
                <Card key={idx} className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <h2 className="text-2xl font-semibold text-[#EDEFF7] font-aeonikpro">{category.title}</h2>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, qIdx) => (
                        <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`} className="border-[#9DA2B3]/25">
                          <AccordionTrigger className="text-[#EDEFF7] font-aeonikpro hover:text-blue-400 text-left">
                            {faq.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-[#9DA2B3] font-aeonikpro">
                            {faq.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 text-center py-12">
              <CardContent>
                <Search className="w-12 h-12 mx-auto mb-4 text-[#9DA2B3]" />
                <h3 className="text-lg font-semibold text-[#EDEFF7] mb-2 font-aeonikpro">No results found</h3>
                <p className="text-[#9DA2B3] font-aeonikpro">
                  Try searching with different keywords or browse all categories above.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Contact Support Section */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30 mt-12">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mb-4">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-[#EDEFF7] mb-2 font-aeonikpro">
                Still need help?
              </h3>
              <p className="text-[#9DA2B3] mb-6 font-aeonikpro">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="default">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/how-it-works">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    How It Works
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Package className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                <h4 className="font-semibold text-[#EDEFF7] mb-2 font-aeonikpro">Marketplace</h4>
                <p className="text-sm text-[#9DA2B3] mb-4 font-aeonikpro">
                  Browse workflows
                </p>
                <Link href="/marketplace">
                  <Button variant="outline" size="sm" className="w-full">
                    Explore
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Wallet className="w-8 h-8 mx-auto mb-3 text-green-400" />
                <h4 className="font-semibold text-[#EDEFF7] mb-2 font-aeonikpro">Become a Seller</h4>
                <p className="text-sm text-[#9DA2B3] mb-4 font-aeonikpro">
                  Start selling workflows
                </p>
                <Link href="/become-seller">
                  <Button variant="outline" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-[rgba(64,66,77,0.25)] border-[#9DA2B3]/25 hover:border-blue-500/50 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 mx-auto mb-3 text-purple-400" />
                <h4 className="font-semibold text-[#EDEFF7] mb-2 font-aeonikpro">Account Settings</h4>
                <p className="text-sm text-[#9DA2B3] mb-4 font-aeonikpro">
                  Manage your account
                </p>
                <Link href="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

