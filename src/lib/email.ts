import { Resend } from 'resend'
import { render } from '@react-email/render'
import { WaitlistWelcomeEmail, WaitlistLaunchEmail, AdminBroadcastEmail } from '@/emails'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email sender configuration
// Without a verified domain, use Resend's onboarding email as sender
const FROM_EMAIL = process.env.EMAIL_FROM || 'Neaply <onboarding@resend.dev>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'onboarding@resend.dev'

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * Send waitlist welcome email
 */
export async function sendWaitlistWelcomeEmail(
  email: string,
  position?: number
): Promise<SendEmailResult> {
  try {
    // Pre-render the email to HTML
    const html = await render(WaitlistWelcomeEmail({ email, position }))
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: "🎉 You're on the Neaply waitlist!",
      html,
    })

    if (error) {
      console.error('Failed to send waitlist welcome email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending waitlist welcome email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send waitlist launch announcement email
 */
export async function sendWaitlistLaunchEmail(
  email: string
): Promise<SendEmailResult> {
  try {
    // Pre-render the email to HTML
    const html = await render(WaitlistLaunchEmail({ email }))
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      replyTo: REPLY_TO,
      subject: "🚀 Neaply is Live! Start exploring now",
      html,
    })

    if (error) {
      console.error('Failed to send launch email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending launch email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Send launch email to all waitlist subscribers (batch)
 */
export async function sendBatchLaunchEmails(
  emails: string[]
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    
    const promises = batch.map(async (email) => {
      const result = await sendWaitlistLaunchEmail(email)
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        if (result.error) {
          results.errors.push(`${email}: ${result.error}`)
        }
      }
    })

    await Promise.all(promises)
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}

/**
 * Generic email sending function for custom templates
 */
export async function sendEmail({
  to,
  subject,
  react,
  text,
  html: providedHtml,
}: {
  to: string | string[]
  subject: string
  react?: React.ReactElement
  text?: string
  html?: string
}): Promise<SendEmailResult> {
  try {
    // Pre-render React component to HTML if provided
    const html = react ? await render(react) : providedHtml
    
    if (!html && !text) {
      return { success: false, error: 'Either html or text content is required' }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject,
      ...(html && { html }),
      ...(text && { text }),
    } as any)

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get email configuration info (for debugging)
 */
export function getEmailConfig() {
  return {
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    hasApiKey: !!process.env.RESEND_API_KEY,
  }
}

/**
 * Send broadcast email to multiple users
 */
export async function sendBroadcastEmail({
  emails,
  subject,
  content,
  ctaText,
  ctaUrl,
}: {
  emails: string[]
  subject: string
  content: string
  ctaText?: string
  ctaUrl?: string
}): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[],
  }

  // Pre-render the email template once
  const html = await render(AdminBroadcastEmail({ subject, content, ctaText, ctaUrl }))

  // Process in batches of 10 to avoid rate limits
  const batchSize = 10
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    
    const promises = batch.map(async (email) => {
      try {
        const { error } = await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          replyTo: REPLY_TO,
          subject,
          html,
        })

        if (error) {
          results.failed++
          results.errors.push(`${email}: ${error.message}`)
        } else {
          results.sent++
        }
      } catch (err) {
        results.failed++
        results.errors.push(`${email}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    })

    await Promise.all(promises)
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  return results
}
