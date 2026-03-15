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

    // Send email notification (async, don't wait)
    const leadEmailData = {
      name: lead.name,
      phone: lead.phone,
      email: lead.email || undefined,
      city: lead.city || undefined,
      serviceRequested: lead.serviceRequested || undefined,
      message: lead.message || undefined,
      sourcePage: lead.sourcePage,
    }

    sendLeadNotification(leadEmailData).catch((error) => {
      console.error('Failed to send lead notification email:', error)
    })

    // Send auto-reply to customer (async, don't wait)
    sendCustomerAutoReply(leadEmailData).catch((error) => {
      console.error('Failed to send customer auto-reply:', error)
    })

    // Push to HubSpot CRM (async, don't wait)
    pushLeadToHubSpot({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      serviceRequested: lead.serviceRequested,
      message: lead.message,
      sourcePage: lead.sourcePage,
    }).catch((error) => {
      console.error('Failed to push lead to HubSpot:', error)
    })

    return { success: true }
  } catch (error) {
    console.error('Error submitting lead:', error)
    return {
      success: false,
      error: 'Something went wrong. Please try again or call us directly.',
    }
  }
}
