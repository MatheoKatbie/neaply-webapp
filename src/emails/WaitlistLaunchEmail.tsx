import * as React from 'react'
import {
  Button,
  Heading,
  Hr,
  Text,
  Section,
} from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface WaitlistLaunchEmailProps {
  email: string
}

export function WaitlistLaunchEmail({ email }: WaitlistLaunchEmailProps) {
  return (
    <EmailLayout preview="Neaply is now live - Start exploring the marketplace">
      {/* Hero Section */}
      <Section style={heroSection}>
        <Heading style={heading}>
          We&apos;re Live
        </Heading>
        <Text style={subheading}>
          Neaply is officially open
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Main Message */}
      <Text style={paragraph}>
        Hello,
      </Text>
      <Text style={paragraph}>
        The wait is over. <strong style={highlight}>Neaply is officially live</strong>, and as a 
        waitlist member, you&apos;re among the first to experience it.
      </Text>

      {/* Features Box */}
      <Section style={featuresBox}>
        <Text style={featuresTitle}>What you can do on Neaply</Text>
        <Text style={featureText}>
          <strong>Browse & Buy</strong> — Discover automation workflows from top creators
        </Text>
        <Text style={featureText}>
          <strong>Sell & Earn</strong> — Monetize your automation expertise
        </Text>
        <Text style={featureText}>
          <strong>Save Time</strong> — Skip hours of development with ready-to-use workflows
        </Text>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Button
          href="https://neaply.com/marketplace"
          style={buttonPrimary}
        >
          Explore the Marketplace
        </Button>
      </Section>

      <Hr style={divider} />

      {/* Signature */}
      <Text style={signature}>
        — The Neaply Team
      </Text>

      <Hr style={divider} />

      {/* Footer note */}
      <Text style={footerNote}>
        You received this email because {email} was on the Neaply waitlist.
      </Text>
    </EmailLayout>
  )
}

// Styles - Sober grayscale design
const heroSection = {
  textAlign: 'center' as const,
  padding: '24px 0',
}

const heading = {
  color: '#EDEFF7',
  fontSize: '28px',
  fontWeight: '600',
  margin: '0 0 8px',
  letterSpacing: '-0.3px',
}

const subheading = {
  color: '#9DA2B3',
  fontSize: '15px',
  margin: '0',
}

const divider = {
  borderColor: 'rgba(157, 162, 179, 0.12)',
  margin: '24px 0',
}

const paragraph = {
  color: '#B8BCC8',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const highlight = {
  color: '#EDEFF7',
}

const featuresBox = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '24px 0',
  border: '1px solid rgba(157, 162, 179, 0.1)',
}

const featuresTitle = {
  color: '#EDEFF7',
  fontSize: '13px',
  fontWeight: '600',
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const featureText = {
  color: '#B8BCC8',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 0',
}

const buttonPrimary = {
  backgroundColor: '#EDEFF7',
  borderRadius: '6px',
  color: '#0D0D0F',
  fontSize: '14px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
}

const perksSection = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '8px',
  padding: '20px 24px',
  margin: '0 0 24px',
  border: '1px solid rgba(157, 162, 179, 0.08)',
}

const perksTitle = {
  color: '#EDEFF7',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const signature = {
  color: '#9DA2B3',
  fontSize: '14px',
  margin: '0',
}

const footerNote = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center' as const,
}

export default WaitlistLaunchEmail
