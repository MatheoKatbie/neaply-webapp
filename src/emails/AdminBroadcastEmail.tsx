import * as React from 'react'
import {
  Heading,
  Hr,
  Text,
  Section,
  Button,
} from '@react-email/components'
import { EmailLayout } from './components/EmailLayout'

interface AdminBroadcastEmailProps {
  subject: string
  content: string
  ctaText?: string
  ctaUrl?: string
}

export function AdminBroadcastEmail({ 
  subject, 
  content, 
  ctaText, 
  ctaUrl 
}: AdminBroadcastEmailProps) {
  // Split content by newlines to create paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim())

  return (
    <EmailLayout preview={subject}>
      {/* Header */}
      <Section style={headerSection}>
        <Heading style={heading}>
          {subject}
        </Heading>
      </Section>

      <Hr style={divider} />

      {/* Content */}
      <Section style={contentSection}>
        {paragraphs.map((paragraph, index) => (
          <Text key={index} style={paragraphStyle}>
            {paragraph}
          </Text>
        ))}
      </Section>

      {/* CTA Button (optional) */}
      {ctaText && ctaUrl && (
        <Section style={ctaSection}>
          <Button href={ctaUrl} style={button}>
            {ctaText}
          </Button>
        </Section>
      )}

      <Hr style={divider} />

      {/* Signature */}
      <Text style={signature}>
        — The Neaply Team
      </Text>
    </EmailLayout>
  )
}

// Styles - Sober grayscale design
const headerSection = {
  textAlign: 'center' as const,
  padding: '24px 0 16px',
}

const heading = {
  color: '#EDEFF7',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0',
  letterSpacing: '-0.3px',
}

const divider = {
  borderColor: 'rgba(157, 162, 179, 0.12)',
  margin: '24px 0',
}

const contentSection = {
  padding: '0',
}

const paragraphStyle = {
  color: '#B8BCC8',
  fontSize: '15px',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const ctaSection = {
  textAlign: 'center' as const,
  padding: '8px 0 16px',
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
  margin: '0',
}

export default AdminBroadcastEmail
