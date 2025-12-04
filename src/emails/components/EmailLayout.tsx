import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface EmailLayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Link href="https://neaply.com" style={logoLink}>
              <Img
                src="https://www.neaply.com/images/neaply/logo-light.png"
                width="250"
                alt="Neaply"
                style={logo}
              />
            </Link>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Neaply. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href="https://neaply.com" style={footerLink}>
                Website
              </Link>
              {' • '}
              <Link href="https://x.com/neaplydev" style={footerLink}>
                Twitter
              </Link>
              {' • '}
              <Link href="https://neaply.com/help" style={footerLink}>
                Help Center
              </Link>
            </Text>
            <Text style={footerAddress}>
              Neaply - The AI Automation Marketplace
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#08080A',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container = {
  backgroundColor: '#0D0D0F',
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
  borderRadius: '12px',
  border: '1px solid rgba(157, 162, 179, 0.15)',
}

const header = {
  padding: '32px 48px 24px',
  borderBottom: '1px solid rgba(157, 162, 179, 0.1)',
}

const logoLink = {
  display: 'block',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '32px 48px',
}

const footer = {
  padding: '24px 48px 0',
  borderTop: '1px solid rgba(157, 162, 179, 0.1)',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
}

const footerLinks = {
  color: '#6B7280',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
}

const footerLink = {
  color: '#9DA2B3',
  textDecoration: 'none',
}

const footerAddress = {
  color: '#4B5563',
  fontSize: '11px',
  lineHeight: '14px',
  margin: '16px 0 0',
}

export default EmailLayout
