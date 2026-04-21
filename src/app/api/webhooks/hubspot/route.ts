// HubSpot webhook endpoint. Subscribed to deal.propertyChange events filtered
// to dealstage. When Josh moves a deal out of "appointmentscheduled" (or any
// other stage change), we mark the matching Postgres Lead as triaged so it
// disappears from the "Not notified" queue automatically.
//
// HubSpot signs payloads with HMAC-SHA256 using the app's Client Secret as the
// key, signing the concatenation of:
//   method + URI + body + timestamp
// (HubSpot v3 signing). We verify before acting.
//
// Environment:
//   HUBSPOT_APP_SECRET — Client Secret from the HubSpot Developer App that owns
//   the webhook subscription. NOT the same as HUBSPOT_ACCESS_TOKEN (which is
//   the private-app token used for outbound calls in src/lib/hubspot.ts).

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/db'

interface HubSpotEvent {
  eventId: number
  subscriptionId: number
  portalId: number
  appId: number
  occurredAt: number
  subscriptionType: string  // e.g. "deal.propertyChange"
  attemptNumber: number
  objectId: number          // the deal ID (or contact ID, depending on subscription)
  propertyName?: string
  propertyValue?: string
  changeSource?: string
  isSensitive?: boolean
}

function verifySignature(
  method: string,
  url: string,
  body: string,
  timestamp: string | null,
  signature: string | null,
  secret: string,
): { ok: boolean; reason?: string } {
  if (!signature) return { ok: false, reason: 'missing X-HubSpot-Signature-v3 header' }
  if (!timestamp) return { ok: false, reason: 'missing X-HubSpot-Request-Timestamp header' }

  // Reject stale (>5 min) requests to prevent replay
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    return { ok: false, reason: 'timestamp out of tolerance' }
  }

  const baseString = `${method}${url}${body}${timestamp}`
  const expected = crypto.createHmac('sha256', secret).update(baseString).digest('base64')

  // Constant-time compare
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length) return { ok: false, reason: 'signature length mismatch' }
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return { ok: false, reason: 'signature mismatch' }
  return { ok: true }
}

export async function POST(request: Request) {
  const secret = process.env.HUBSPOT_APP_SECRET
  if (!secret) {
    console.error('[HUBSPOT-WEBHOOK] HUBSPOT_APP_SECRET not configured')
    return NextResponse.json({ error: 'not configured' }, { status: 500 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-hubspot-signature-v3')
  const timestamp = request.headers.get('x-hubspot-request-timestamp')

  // Reconstruct the URL HubSpot signed against. Vercel sends headers we can use.
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host') || 'www.velocityelectric.co'
  const reqUrl = new URL(request.url)
  const fullUrl = `${proto}://${host}${reqUrl.pathname}${reqUrl.search}`

  const verify = verifySignature('POST', fullUrl, rawBody, timestamp, signature, secret)
  if (!verify.ok) {
    console.warn('[HUBSPOT-WEBHOOK] signature verification failed:', verify.reason)
    return NextResponse.json({ error: 'unauthorized', reason: verify.reason }, { status: 401 })
  }

  let events: HubSpotEvent[]
  try {
    events = JSON.parse(rawBody)
    if (!Array.isArray(events)) events = [events as unknown as HubSpotEvent]
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  // Triage signal mapping: when these property values change, mark Lead as triaged.
  // The actual triage value tag becomes "hubspot:<source>:<value>" so admin UI can
  // show why a lead got triaged.
  const triageSignal = (event: HubSpotEvent): string | null => {
    if (event.subscriptionType === 'deal.propertyChange' && event.propertyName === 'dealstage') {
      return `dealstage:${event.propertyValue || 'unknown'}`
    }
    if (event.subscriptionType === 'contact.propertyChange' && event.propertyName === 'hs_lead_status') {
      return `lead_status:${event.propertyValue || 'unknown'}`
    }
    if (event.subscriptionType === 'contact.propertyChange' && event.propertyName === 'notes_last_contacted') {
      // Any engagement (email, call, meeting note) updates this — Josh worked the lead.
      return `engagement`
    }
    return null
  }

  // Find the Lead row matching a HubSpot object — by deal id for deal events,
  // by contact id for contact events. Returns null if no match (maybe a deal
  // we didn't create, or one whose Lead was deleted on our side).
  async function findLeadFor(event: HubSpotEvent) {
    const objectId = String(event.objectId)
    if (event.subscriptionType.startsWith('deal.')) {
      return prisma.lead.findFirst({ where: { hubspotDealId: objectId } })
    }
    if (event.subscriptionType.startsWith('contact.')) {
      return prisma.lead.findFirst({ where: { hubspotContactId: objectId } })
    }
    return null
  }

  let triagedCount = 0
  let cleanedCount = 0
  for (const event of events) {
    try {
      // Deletion: clear the matching Lead's HubSpot ID so the admin UI link
      // doesn't 404. Don't delete the Lead itself — keeps audit trail.
      if (event.subscriptionType === 'deal.deletion') {
        const lead = await findLeadFor(event)
        if (lead) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { hubspotDealId: null, hubspotCompanyId: null },
          })
          cleanedCount += 1
          console.log(`[HUBSPOT-WEBHOOK] cleaned deal ref on lead ${lead.id} (deal ${event.objectId} deleted in HS)`)
        }
        continue
      }
      if (event.subscriptionType === 'contact.deletion') {
        const lead = await findLeadFor(event)
        if (lead) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { hubspotContactId: null },
          })
          cleanedCount += 1
          console.log(`[HUBSPOT-WEBHOOK] cleaned contact ref on lead ${lead.id} (contact ${event.objectId} deleted in HS)`)
        }
        continue
      }

      // Property changes that are triage signals
      const signal = triageSignal(event)
      if (!signal) {
        console.log(`[HUBSPOT-WEBHOOK] ignoring ${event.subscriptionType} prop=${event.propertyName}`)
        continue
      }

      const lead = await findLeadFor(event)
      if (!lead) {
        console.log(`[HUBSPOT-WEBHOOK] no Lead for ${event.subscriptionType} objectId=${event.objectId}`)
        continue
      }
      if (lead.triagedAt) {
        console.log(`[HUBSPOT-WEBHOOK] lead ${lead.id} already triaged, signal=${signal} ignored`)
        continue
      }
      await prisma.lead.update({
        where: { id: lead.id },
        data: { triagedAt: new Date(), triagedBy: `hubspot:${signal}` },
      })
      triagedCount += 1
      console.log(`[HUBSPOT-WEBHOOK] triaged lead ${lead.id} (signal=${signal})`)
    } catch (err) {
      console.error(`[HUBSPOT-WEBHOOK] error handling event ${event.eventId}:`, err)
    }
  }

  return NextResponse.json({
    ok: true,
    processed: events.length,
    triaged: triagedCount,
    cleaned: cleanedCount,
  })
}
