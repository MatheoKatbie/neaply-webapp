import {
  Button,
  Heading,
  Hr,
  Text,
  Section,
  Link,
} from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface WaitlistWelcomeEmailProps {
  email: string
  position?: number
}

export function WaitlistWelcomeEmail({ email, position }: WaitlistWelcomeEmailProps) {
  return (
    <EmailLayout preview="Welcome to the Neaply waitlist! 🚀">
      {/* Hero Section */}
      <Section style={heroSection}>
        <Text style={emoji}>🎉</Text>
        <Heading style={heading}>
          You&apos;re on the list!
        </Heading>
        <Text style={subheading}>
          Welcome to the Neaply waitlist
        </Text>
      </Section>

      <Hr style={divider} />

      {/* Main Message */}
      <Text style={paragraph}>
        Hey there!
      </Text>
      <Text style={paragraph}>
        Thank you for joining the Neaply waitlist! We&apos;re thrilled to have you as part of our 
        early community of automation enthusiasts.
      </Text>

      {position && (
        <Section style={positionBox}>
          <Text style={positionLabel}>Your position</Text>
          <Text style={positionNumber}>#{position}</Text>
          <Text style={positionHint}>
            Share with friends to move up the list!
          </Text>
        </Section>
      )}

      <Text style={paragraph}>
        <strong style={highlight}>What is Neaply?</strong>
        <br />
        Neaply is the marketplace where you can discover, buy, and sell automation workflows 
        for tools like n8n, Zapier, Make, and more. Whether you&apos;re looking to automate your 
        business or monetize your automation skills, Neaply is the place for you.
      </Text>

      <Text style={paragraph}>
        <strong style={highlight}>What happens next?</strong>
      </Text>
      <ul style={list}>
        <li style={listItem}>We&apos;ll notify you as soon as we launch</li>
        <li style={listItem}>Early access members get exclusive perks</li>
        <li style={listItem}>You&apos;ll be among the first to explore the marketplace</li>
      </ul>

      <Hr style={divider} />

      {/* CTA */}
      <Section style={ctaSection}>
        <Text style={ctaText}>
          In the meantime, follow us on Twitter for updates:
        </Text>
        <Link
          href="https://twitter.com/neaplydev"
          style={button}
        >
          Follow @neaplydev
        </Link>
      </Section>

      {/* Signature */}
      <Text style={signature}>
        See you soon! 👋
        <br />
        <span style={signatureName}>The Neaply Team</span>
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

const positionBox = {
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
  border: '1px solid rgba(99, 102, 241, 0.2)',
}

const positionLabel = {
  color: '#9DA2B3',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 4px',
}

const positionNumber = {
  color: '#818CF8',
  fontSize: '48px',
  fontWeight: '700',
  margin: '0',
  lineHeight: '1',
}

const positionHint = {
  color: '#6B7280',
  fontSize: '13px',
  margin: '12px 0 0',
}

const list = {
  color: '#D1D5DB',
  fontSize: '15px',
  lineHeight: '24px',
  paddingLeft: '20px',
  margin: '0 0 16px',
}

const listItem = {
  marginBottom: '8px',
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
  backgroundColor: '#fcfbfc',
  borderRadius: '8px',
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  display: 'inline-block',
}

const signature = {
  color: '#D1D5DB',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '24px 0 0',
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
}

export default WaitlistWelcomeEmail
