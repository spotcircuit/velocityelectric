import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface LeadEmailData {
  name: string
  phone: string
  email?: string
  city?: string
  serviceRequested?: string
  message?: string
  sourcePage: string
}

export async function sendLeadNotification(lead: LeadEmailData): Promise<boolean> {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL

  if (!resend || !ownerEmail) {
    console.log('📧 Email notification (dev mode):', {
      to: ownerEmail || 'NOT_CONFIGURED',
      subject: `New Lead: ${lead.name}`,
      lead,
    })
    return true
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Velocity Electric <noreply@resend.dev>',
      to: ownerEmail,
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
      return false
    }

    return true
  } catch (error) {
    console.error('Email service error:', error)
    return false
  }
}
