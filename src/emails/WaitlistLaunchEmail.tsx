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
    <EmailLayout preview="Neaply is live! Start exploring the marketplace 🚀">
      {/* Hero Section */}
      <Section style={heroSection}>
        <Text style={emoji}>🚀</Text>
        <Heading style={heading}>
          We&apos;re Live!
        </Heading>
        <Text style={subheading}>
          Neaply is officially open
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Main Message */}
      <Text style={paragraph}>
        Hey there!
      </Text>
      <Text style={paragraph}>
        The wait is over! <strong style={highlight}>Neaply is officially live</strong>, and as a 
        waitlist member, you&apos;re among the first to experience it.
      </Text>

      {/* Features Box */}
      <Section style={featuresBox}>
        <Text style={featuresTitle}>What you can do on Neaply:</Text>
        <Section style={featureItem}>
          <Text style={featureEmoji}>🛒</Text>
          <Text style={featureText}>
            <strong>Browse & Buy</strong> - Discover powerful automation workflows from top creators
          </Text>
        </Section>
        <Section style={featureItem}>
          <Text style={featureEmoji}>💰</Text>
          <Text style={featureText}>
            <strong>Sell & Earn</strong> - Monetize your automation expertise by selling workflows
          </Text>
        </Section>
        <Section style={featureItem}>
          <Text style={featureEmoji}>⚡</Text>
          <Text style={featureText}>
            <strong>Save Time</strong> - Skip hours of development with ready-to-use workflows
          </Text>
        </Section>
      </Section>

      {/* CTA */}
      <Section style={ctaSection}>
        <Button
          href="https://neaply.com/marketplace"
          style={buttonPrimary}
        >
          Explore the Marketplace
        </Button>
        <Text style={orText}>or</Text>
        <Button
          href="https://neaply.com/become-seller"
          style={buttonSecondary}
        >
          Start Selling
        </Button>
      </Section>

      <Hr style={divider} />

      {/* Early Adopter Perks */}
      <Section style={perksSection}>
        <Text style={perksTitle}>🎁 Early Adopter Perks</Text>
        <Text style={paragraph}>
          As a thank you for being an early supporter, you get:
        </Text>
        <ul style={list}>
          <li style={listItem}>Priority support from our team</li>
          <li style={listItem}>Early access to new features</li>
          <li style={listItem}>Special "Early Adopter" badge on your profile</li>
        </ul>
      </Section>

      {/* Signature */}
      <Text style={signature}>
        Let&apos;s automate the world together! 🌍
        <br />
        <span style={signatureName}>The Neaply Team</span>
      </Text>

      <Hr style={divider} />

      {/* Footer note */}
      <Text style={footerNote}>
        You received this email because {email} was on the Neaply waitlist.
        <br />
        <a href="https://neaply.com/unsubscribe" style={unsubscribeLink}>Unsubscribe</a>
      </Text>
    </EmailLayout>
  )
}

// Styles
const heroSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
}

const emoji = {
  fontSize: '48px',
  margin: '0 0 16px',
}

const heading = {
  color: '#EDEFF7',
  fontSize: '28px',
  fontWeight: '700',
  margin: '0 0 8px',
  letterSpacing: '-0.5px',
}

const subheading = {
  color: '#9DA2B3',
  fontSize: '16px',
  margin: '0',
}

const divider = {
  borderColor: 'rgba(157, 162, 179, 0.15)',
  margin: '24px 0',
}

const paragraph = {
  color: '#D1D5DB',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const highlight = {
  color: '#EDEFF7',
}

const featuresBox = {
  backgroundColor: 'rgba(99, 102, 241, 0.05)',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  border: '1px solid rgba(99, 102, 241, 0.1)',
}

const featuresTitle = {
  color: '#EDEFF7',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const featureItem = {
  marginBottom: '16px',
}

const featureEmoji = {
  fontSize: '20px',
  margin: '0 0 4px',
}

const featureText = {
  color: '#D1D5DB',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '16px 0',
}

const buttonPrimary = {
  backgroundColor: '#6366F1',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  display: 'inline-block',
}

const orText = {
  color: '#6B7280',
  fontSize: '13px',
  margin: '12px 0',
}

const buttonSecondary = {
  backgroundColor: 'transparent',
  borderRadius: '8px',
  border: '1px solid rgba(99, 102, 241, 0.5)',
  color: '#818CF8',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
}

const perksSection = {
  backgroundColor: 'rgba(34, 197, 94, 0.05)',
  borderRadius: '12px',
  padding: '20px 24px',
  margin: '0 0 24px',
  border: '1px solid rgba(34, 197, 94, 0.1)',
}

const perksTitle = {
  color: '#4ADE80',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px',
}

const list = {
  color: '#D1D5DB',
  fontSize: '14px',
  lineHeight: '22px',
  paddingLeft: '20px',
  margin: '0',
}

const listItem = {
  marginBottom: '6px',
}

const signature = {
  color: '#D1D5DB',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
}

const signatureName = {
  color: '#EDEFF7',
  fontWeight: '600',
}

const footerNote = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center' as const,
}

const unsubscribeLink = {
  color: '#9DA2B3',
  textDecoration: 'underline',
}

export default WaitlistLaunchEmail
