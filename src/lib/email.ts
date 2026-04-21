import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface LeadEmailData {
  name: string
  phone: string
  email?: string
  city?: string
  customerType?: string
  serviceRequested?: string
  message?: string
  sourcePage: string
}

export interface SendResult {
  ok: boolean
  error?: string
  messageId?: string
}

export async function sendLeadNotification(lead: LeadEmailData, leadId?: string): Promise<SendResult> {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL

  if (!resend || !ownerEmail) {
    const reason = !resend ? 'RESEND_API_KEY not configured' : 'OWNER_NOTIFICATION_EMAIL not configured'
    console.warn('📧 Email notification SKIPPED —', reason, { leadName: lead.name })
    return { ok: false, error: reason }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Velocity Electric Leads <leads@velocityelectric.co>',
      replyTo: 'josh@velocityelectric.co',
      to: ownerEmail,
      tags: [
        { name: 'kind', value: 'owner_notification' },
        ...(leadId ? [{ name: 'lead_id', value: leadId }] : []),
      ],
      subject: `🔔 New Lead: ${lead.name} - ${lead.serviceRequested || 'General Inquiry'}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0B1F3B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .value { font-size: 16px; color: #111827; }
            .cta { background: #1E88FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 15px; }
            .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Lead Received!</h1>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Name</div>
                <div class="value">${lead.name}</div>
              </div>
              <div class="field">
                <div class="label">Phone</div>
                <div class="value"><a href="tel:${lead.phone}">${lead.phone}</a></div>
              </div>
              ${lead.email ? `
              <div class="field">
                <div class="label">Email</div>
                <div class="value"><a href="mailto:${lead.email}">${lead.email}</a></div>
              </div>
              ` : ''}
              ${lead.city ? `
              <div class="field">
                <div class="label">City</div>
                <div class="value">${lead.city}</div>
              </div>
              ` : ''}
              ${lead.customerType ? `
              <div class="field">
                <div class="label">Customer Type</div>
                <div class="value">${lead.customerType === 'commercial' ? 'Commercial' : 'Residential'}</div>
              </div>
              ` : ''}
              ${lead.serviceRequested ? `
              <div class="field">
                <div class="label">Service Requested</div>
                <div class="value">${lead.serviceRequested}</div>
              </div>
              ` : ''}
              ${lead.message ? `
              <div class="field">
                <div class="label">Message</div>
                <div class="value">${lead.message}</div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">Source Page</div>
                <div class="value">${lead.sourcePage}</div>
              </div>
              <a href="tel:${lead.phone}" class="cta">Call ${lead.name} Now</a>
            </div>
            <div class="footer">
              This lead was submitted via your website.
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Email send error:', error)
      return { ok: false, error: JSON.stringify(error) }
    }

    return { ok: true, messageId: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    return { ok: false, error: error instanceof Error ? error.message : String(error) }
  }
}

export async function sendCustomerAutoReply(lead: LeadEmailData): Promise<boolean> {
  if (!resend || !lead.email) {
    return false
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Velocity Electric <hello@velocityelectric.co>',
      replyTo: 'josh@velocityelectric.co',
      to: lead.email,
      subject: `Thanks for contacting Velocity Electric!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0B1F3B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 22px; }
            .content { background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; }
            .highlight { background: #e0f2fe; border-left: 4px solid #1E88FF; padding: 12px 16px; margin: 16px 0; border-radius: 0 6px 6px 0; }
            .cta { background: #1E88FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 8px; font-weight: bold; }
            .footer { text-align: center; padding: 15px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Thanks for Reaching Out!</h1>
            </div>
            <div class="content">
              <p>Hi ${lead.name},</p>
              <p>We've received your service request and a member of our team will be in touch shortly — typically within a few hours during business hours.</p>
              ${lead.serviceRequested ? `
              <div class="highlight">
                <strong>Service Requested:</strong> ${lead.serviceRequested}
              </div>
              ` : ''}
              <p>If you need immediate assistance or have an electrical emergency, don't hesitate to call us directly:</p>
              <p><a href="tel:+15715321594" class="cta">Call (571) 532-1594</a></p>
              <p style="margin-top: 20px;">We appreciate your trust in Velocity Electric and look forward to helping you!</p>
              <p>Best regards,<br><strong>The Velocity Electric Team</strong><br>VA Licensed Master Electrician</p>
            </div>
            <div class="footer">
              Velocity Electric | (571) 532-1594 | josh@velocityelectric.co
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('Auto-reply email error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Auto-reply email service error:', error)
    return false
  }
}
