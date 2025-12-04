import * as React from 'react'
import {
  Button,
  Heading,
  Hr,
  Text,
  Section,
} from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface WaitlistWelcomeEmailProps {
  email: string
  position?: number
}

export function WaitlistWelcomeEmail({ email, position }: WaitlistWelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to the Neaply waitlist">
      {/* Hero Section */}
      <Section style={heroSection}>
        <Heading style={heading}>
          You&apos;re on the list
        </Heading>
        <Text style={subheading}>
          Welcome to the Neaply waitlist
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Main Message */}
      <Text style={paragraph}>
        Hello,
      </Text>
      <Text style={paragraph}>
        Thank you for joining the Neaply waitlist. We&apos;re glad to have you as part of our 
        early community.
      </Text>

      {position && (
        <Section style={positionBox}>
          <Text style={positionLabel}>Your position</Text>
          <Text style={positionNumber}>#{position}</Text>
        </Section>
      )}

      <Section style={infoBox}>
        <Text style={infoTitle}>What is Neaply?</Text>
        <Text style={infoText}>
          Neaply is the marketplace where you can discover, buy, and sell automation workflows 
          for tools like n8n, Zapier, Make, and more.
        </Text>
      </Section>

      <Section style={infoBox}>
        <Text style={infoTitle}>What happens next?</Text>
        <Text style={infoText}>• We&apos;ll notify you when we launch</Text>
        <Text style={infoText}>• Early access members get exclusive perks</Text>
        <Text style={infoText}>• You&apos;ll be among the first to explore the marketplace</Text>
      </Section>

      <Hr style={divider} />

      {/* CTA */}
      <Section style={ctaSection}>
        <Text style={ctaText}>
          Follow us on Twitter for updates
        </Text>
        <Button
          href="https://twitter.com/neaplydev"
          style={button}
        >
          Follow @neaplydev
        </Button>
      </Section>

      {/* Signature */}
      <Text style={signature}>
        — The Neaply Team
      </Text>

      <Hr style={divider} />

      {/* Footer note */}
      <Text style={footerNote}>
        You received this email because {email} was added to the Neaply waitlist.
        If this wasn&apos;t you, you can safely ignore this email.
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

const positionBox = {
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '1px solid rgba(157, 162, 179, 0.1)',
}

const positionLabel = {
  color: '#9DA2B3',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px',
}

const positionNumber = {
  color: '#EDEFF7',
  fontSize: '36px',
  fontWeight: '600',
  margin: '0',
  lineHeight: '1',
}

const infoBox = {
  backgroundColor: 'rgba(255, 255, 255, 0.02)',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 12px',
  border: '1px solid rgba(157, 162, 179, 0.08)',
}

const infoTitle = {
  color: '#EDEFF7',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const infoText = {
  color: '#B8BCC8',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 0',
}

const ctaText = {
  color: '#9DA2B3',
  fontSize: '14px',
  margin: '0 0 16px',
}

const button = {
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

const signature = {
  color: '#9DA2B3',
  fontSize: '14px',
  margin: '24px 0 0',
}

const footerNote = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
  textAlign: 'center' as const,
}

export default WaitlistWelcomeEmail
