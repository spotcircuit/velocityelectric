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

  let triagedCount = 0
  for (const event of events) {
    try {
      // Currently we only auto-triage on deal stage changes.
      if (event.subscriptionType === 'deal.propertyChange' && event.propertyName === 'dealstage') {
        const dealId = String(event.objectId)
        const newStage = event.propertyValue || 'unknown'
        const lead = await prisma.lead.findFirst({ where: { hubspotDealId: dealId } })
        if (!lead) {
          console.log(`[HUBSPOT-WEBHOOK] no Lead for dealId=${dealId}, ignoring`)
          continue
        }
        // Don't re-triage if already triaged
        if (lead.triagedAt) {
          console.log(`[HUBSPOT-WEBHOOK] lead ${lead.id} already triaged, ignoring stage change`)
          continue
        }
        await prisma.lead.update({
          where: { id: lead.id },
          data: { triagedAt: new Date(), triagedBy: `hubspot:${newStage}` },
        })
        triagedCount += 1
        console.log(`[HUBSPOT-WEBHOOK] triaged lead ${lead.id} (deal ${dealId} → ${newStage})`)
      } else {
        console.log(`[HUBSPOT-WEBHOOK] ignoring event type=${event.subscriptionType} prop=${event.propertyName}`)
      }
    } catch (err) {
      console.error(`[HUBSPOT-WEBHOOK] error handling event ${event.eventId}:`, err)
    }
  }

  return NextResponse.json({ ok: true, processed: events.length, triaged: triagedCount })
}
