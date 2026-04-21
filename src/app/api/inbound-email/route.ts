// Inbound email → Lead capture endpoint.
//
// Cloudflare Email Worker parses inbound email (postal-mime) and POSTs the
// structured payload here. We verify the shared secret, extract a phone number
// if mentioned in the body, create a Postgres Lead row, run qualifyLead(), and
// push to HubSpot if it qualifies as a real customer.
//
// Cloudflare also forwards the original email to josh@velocitycapitalholding.com
// so Josh still receives the email itself in his inbox.

import { NextResponse } from 'next/server'
import { extract as parseEmail } from 'letterparser'
import { prisma } from '@/lib/db'
import { qualifyLead } from '@/lib/qualify'
import { pushLeadToHubSpot } from '@/lib/hubspot'

// The Cloudflare Worker sends one of two payload shapes:
//   - parsed:  {from, fromName, fromAddress, to, subject, text, html, messageId}
//   - raw:     {raw: <full RFC 822 message>, fromHint, toHint}
// We accept both and normalize.
interface InboundEmailPayload {
  from?: string
  fromName?: string | null
  fromAddress?: string
  to?: string | null
  subject?: string | null
  text?: string | null
  html?: string | null
  messageId?: string | null
  raw?: string  // full MIME — server-side parsing path
  fromHint?: string
  toHint?: string
}

// Extract a US-style phone number from free-form text. Matches:
//   703-555-1234, (703) 555-1234, +1 703 555 1234, 7035551234, 1-703-555-1234, etc.
function extractPhone(text: string | null | undefined): string | null {
  if (!text) return null
  const match = text.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  return match ? match[0].trim() : null
}

// Parse "Display Name <email@x.com>" → {name, email}.
function parseFromHeader(from: string): { name: string; email: string } {
  const angle = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  if (angle) {
    return { name: angle[1].replace(/['"]/g, '').trim(), email: angle[2].trim().toLowerCase() }
  }
  const email = from.trim().toLowerCase()
  return { name: '', email }
}

// Crude city extraction from body — looks for "in <City>" or signature blocks.
// Best-effort; qualification doesn't strictly need it.
function extractCity(text: string | null | undefined): string | null {
  if (!text) return null
  const cities = ['Ashburn','Fairfax','Vienna','Sterling','Leesburg','Purcellville','Winchester','Reston','Manassas','Woodbridge','Herndon','Aldie','Centreville','Chantilly','Linden','Front Royal','Berryville','Stephens City','Middletown','Marshall','Warrenton','Gainesville','Haymarket']
  const lower = text.toLowerCase()
  for (const c of cities) {
    if (new RegExp(`\\b${c.toLowerCase()}\\b`).test(lower)) return c
  }
  return null
}

export async function POST(request: Request) {
  const secret = process.env.INBOUND_SECRET
  if (!secret) {
    console.error('[INBOUND-EMAIL] INBOUND_SECRET not configured')
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }

  const provided = request.headers.get('x-inbound-secret')
  if (provided !== secret) {
    const fingerprint = (s: string | null | undefined) =>
      s ? `len=${s.length} first2=${s.slice(0, 2)} last2=${s.slice(-2)}` : 'null/empty'
    console.warn('[INBOUND-EMAIL] bad secret', {
      provided: fingerprint(provided),
      expected: fingerprint(secret),
      providedTrimmed: provided?.trim() === secret ? 'matches-after-trim' : 'no-match-even-trimmed',
    })
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let payload: InboundEmailPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  // If the worker sent raw MIME, parse it server-side.
  if (payload.raw && (!payload.text && !payload.html)) {
    try {
      const result = parseEmail(payload.raw)
      payload.text = result.text || null
      payload.html = result.html || null
      payload.subject = payload.subject || result.subject || null
      payload.from = payload.from || (result.from?.raw || payload.fromHint || '')
      const toField = result.to as unknown
      const toRaw = Array.isArray(toField)
        ? (toField[0] as { raw?: string } | undefined)?.raw
        : (toField as { raw?: string } | undefined)?.raw
      payload.to = payload.to || toRaw || payload.toHint || null
    } catch (err) {
      console.warn('[INBOUND-EMAIL] letterparser failed, using hints:', err)
      payload.from = payload.from || payload.fromHint || ''
      payload.to = payload.to || payload.toHint || null
    }
  }

  const parsed = parseFromHeader(payload.from || '')
  const senderName = (payload.fromName || parsed.name || '').trim() || 'Unknown sender'
  const senderEmail = (payload.fromAddress || parsed.email || '').trim().toLowerCase()
  if (!senderEmail) {
    return NextResponse.json({ error: 'no sender email' }, { status: 400 })
  }

  const bodyText = payload.text || (payload.html ? payload.html.replace(/<[^>]+>/g, ' ') : '') || ''
  const phone = extractPhone(`${payload.subject || ''} ${bodyText}`) || ''
  const city = extractCity(bodyText)
  const subject = (payload.subject || '').slice(0, 200)
  const message = `Subject: ${subject}\n\n${bodyText}`.slice(0, 4000)

  console.log('[INBOUND-EMAIL] received', {
    from: senderEmail,
    name: senderName,
    subject,
    hasPhone: !!phone,
    hasCity: !!city,
    bodyLen: bodyText.length,
  })

  try {
    // Idempotency: if we've already captured this Message-ID, skip.
    if (payload.messageId) {
      const existing = await prisma.lead.findFirst({
        where: { sourcePage: `email:${payload.messageId}` },
      })
      if (existing) {
        console.log('[INBOUND-EMAIL] duplicate message-id, skipping', { id: existing.id })
        return NextResponse.json({ ok: true, deduplicated: true, leadId: existing.id })
      }
    }

    const lead = await prisma.lead.create({
      data: {
        name: senderName,
        phone: phone || 'unknown',
        email: senderEmail,
        city: city || null,
        serviceRequested: null, // emails don't map to a single service slug
        message,
        sourcePage: payload.messageId ? `email:${payload.messageId}` : `email:${senderEmail}`,
      },
    })
    console.log('[INBOUND-EMAIL] lead.create OK', { leadId: lead.id })

    const qual = await qualifyLead({
      name: senderName,
      email: senderEmail,
      phone: phone || null,
      city,
      customerType: null,
      serviceRequested: null,
      message,
      sourcePage: `email:inbound`,
    })
    console.log('[INBOUND-EMAIL] qualified', { leadId: lead.id, qual })

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        qualification: qual.category,
        qualificationReason: qual.reason.slice(0, 500),
        qualificationConfidence: qual.confidence,
        qualifiedAt: new Date(),
      },
    })

    const isJunk = qual.category === 'SPAM' || qual.category === 'TEST' || qual.category === 'VENDOR'
    if (isJunk) {
      console.log('[INBOUND-EMAIL] junk — skipping HubSpot', { leadId: lead.id, category: qual.category })
      return NextResponse.json({ ok: true, leadId: lead.id, qualification: qual.category, skipped: 'junk' })
    }

    // Push to HubSpot. NO Resend owner-notification — Josh already gets the email
    // itself via Cloudflare's forward to capitalholding. NO customer auto-reply
    // — the customer expects Josh to reply personally to their email.
    const hsResult = await pushLeadToHubSpot({
      name: senderName,
      phone: phone || 'unknown',
      email: senderEmail,
      city,
      customerType: null,
      serviceRequested: null,
      message,
      sourcePage: `email:inbound`,
      qualification: qual.category,
      qualificationReason: qual.reason,
    })

    if (hsResult.ok) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          hubspotContactId: hsResult.contactId ?? null,
          hubspotCompanyId: hsResult.companyId ?? null,
          hubspotDealId: hsResult.dealId ?? null,
        },
      })
    }

    console.log('[INBOUND-EMAIL] DONE', { leadId: lead.id, qualification: qual.category, hsResult })
    return NextResponse.json({
      ok: true,
      leadId: lead.id,
      qualification: qual.category,
      hubspot: hsResult,
    })
  } catch (err) {
    console.error('[INBOUND-EMAIL] error:', err)
    return NextResponse.json({ error: 'internal error', detail: String(err) }, { status: 500 })
  }
}
