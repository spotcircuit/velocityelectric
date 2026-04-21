'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { sendLeadNotification, sendCustomerAutoReply } from '@/lib/email'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { leadFormSchema, type LeadFormData } from '@/lib/validations'
import { pushLeadToHubSpot } from '@/lib/hubspot'

interface SubmitLeadResult {
  success: boolean
  error?: string
}

export async function submitLead(data: LeadFormData): Promise<SubmitLeadResult> {
  try {
    // Validate input
    const validated = leadFormSchema.safeParse(data)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'Invalid form data',
      }
    }

    // Check honeypot
    if (validated.data.website) {
      // Silently succeed for bots
      return { success: true }
    }

    // Rate limiting
    const headersList = await headers()
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || '127.0.0.1'

    const rateLimitResult = await rateLimit(`lead:${ip}`)
    if (!rateLimitResult.success) {
      return {
        success: false,
        error: 'Too many requests. Please try again in a few minutes.',
      }
    }

    // Save to database
    const lead = await prisma.lead.create({
      data: {
        name: validated.data.name,
        phone: validated.data.phone,
        email: validated.data.email || null,
        city: validated.data.city || null,
        serviceRequested: validated.data.serviceRequested || null,
        message: validated.data.message || null,
        sourcePage: validated.data.sourcePage,
      },
    })
    console.log('[LEAD-DEBUG] lead.create OK', { leadId: lead.id })

    // Send email notification (async, don't wait)
    const leadEmailData = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email || undefined,
      city: lead.city || undefined,
      customerType: validated.data.customerType || undefined,
      serviceRequested: lead.serviceRequested || undefined,
      message: lead.message || undefined,
      sourcePage: lead.sourcePage,
    }

    // Run side-effects in parallel and AWAIT them. Fire-and-forget gets killed
    // by Vercel's serverless lifecycle after the Server Action returns —
    // promises in .then() callbacks silently never run. Awaiting adds ~1s to
    // form submission but guarantees the DB capture and HubSpot push complete.
    console.log('[LEAD-DEBUG] starting Promise.allSettled', { leadId: lead.id })
    const [ownerResult, autoReplyResult, hubspotResult] = await Promise.allSettled([
      sendLeadNotification(leadEmailData, lead.id),
      sendCustomerAutoReply(leadEmailData),
      pushLeadToHubSpot({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        city: lead.city,
        customerType: validated.data.customerType || null,
        serviceRequested: lead.serviceRequested,
        message: lead.message,
        sourcePage: lead.sourcePage,
      }),
    ])
    console.log('[LEAD-DEBUG] Promise.allSettled finished', {
      leadId: lead.id,
      owner: ownerResult.status,
      autoReply: autoReplyResult.status,
      hubspot: hubspotResult.status,
      ownerOk: ownerResult.status === 'fulfilled' ? ownerResult.value.ok : null,
      ownerErr: ownerResult.status === 'fulfilled' ? ownerResult.value.error : String(ownerResult.reason || ''),
    })

    if (autoReplyResult.status === 'rejected') {
      console.error('Failed to send customer auto-reply:', autoReplyResult.reason)
    }
    if (hubspotResult.status === 'rejected') {
      console.error('Failed to push lead to HubSpot:', hubspotResult.reason)
    }

    // Persist owner-notification outcome so the admin /leads UI can surface
    // gaps. Resend webhooks fill in delivered/bounced/opened/etc. later via
    // /api/webhooks/resend (correlated by lead_id tag).
    const ownerUpdate =
      ownerResult.status === 'fulfilled' && ownerResult.value.ok
        ? {
            ownerNotifiedAt: new Date(),
            ownerNotifyMessageId: ownerResult.value.messageId ?? null,
            ownerNotifyError: null,
          }
        : {
            ownerNotifyError: (
              ownerResult.status === 'rejected'
                ? ownerResult.reason instanceof Error
                  ? ownerResult.reason.message
                  : String(ownerResult.reason)
                : ownerResult.value.error || 'unknown error'
            ).slice(0, 500),
          }

    console.log('[LEAD-DEBUG] writing ownerUpdate', { leadId: lead.id, ownerUpdate })
    await prisma.lead.update({ where: { id: lead.id }, data: ownerUpdate }).catch((e) =>
      console.error('[LEAD-DEBUG] Failed to record notify outcome:', e)
    )
    console.log('[LEAD-DEBUG] DONE', { leadId: lead.id })

    return { success: true }
  } catch (error) {
    console.error('Error submitting lead:', error)
    return {
      success: false,
      error: 'Something went wrong. Please try again or call us directly.',
    }
  }
}
