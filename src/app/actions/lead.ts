'use server'

import { headers } from 'next/headers'
import { prisma } from '@/lib/db'
import { sendLeadNotification } from '@/lib/email'
import { rateLimit, getClientIP } from '@/lib/rate-limit'
import { leadFormSchema, type LeadFormData } from '@/lib/validations'

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
    sendLeadNotification({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || undefined,
      city: lead.city || undefined,
      serviceRequested: lead.serviceRequested || undefined,
      message: lead.message || undefined,
      sourcePage: lead.sourcePage,
    }).catch((error) => {
      console.error('Failed to send lead notification email:', error)
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
