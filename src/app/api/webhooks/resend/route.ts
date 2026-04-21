import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/db'

// Resend webhook events we care about. Anything else returns 200 and no-ops.
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.bounced'
  | 'email.complained'
  | 'email.opened'
  | 'email.clicked'

interface ResendWebhookEvent {
  type: ResendEventType | string
  created_at: string
  data: {
    email_id?: string
    from?: string
    to?: string[]
    subject?: string
    // Resend sends tags as either an array of {name,value} or an object {name: value}.
    // We normalize below.
    tags?: Array<{ name: string; value: string }> | Record<string, string>
  }
}

function tagValue(
  tags: ResendWebhookEvent['data']['tags'],
  name: string
): string | undefined {
  if (!tags) return undefined
  if (Array.isArray(tags)) {
    return tags.find((t) => t.name === name)?.value
  }
  return tags[name]
}

const FIELD_BY_EVENT: Record<string, string> = {
  'email.delivered': 'ownerNotifyDeliveredAt',
  'email.delivery_delayed': 'ownerNotifyDelayedAt',
  'email.bounced': 'ownerNotifyBouncedAt',
  'email.complained': 'ownerNotifyComplainedAt',
  'email.opened': 'ownerNotifyOpenedAt',
  'email.clicked': 'ownerNotifyClickedAt',
  'email.failed': 'ownerNotifyFailedAt',
  'email.suppressed': 'ownerNotifySuppressedAt',
}
// Events we acknowledge but don't write columns for:
//   email.sent       — we already capture this synchronously from the API response
//   email.scheduled  — we don't schedule sends, so should never see this
//   email.received   — for inbound parsing, not relevant for owner notifications

export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (!secret) {
    console.error('RESEND_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'webhook not configured' }, { status: 500 })
  }

  // Resend signs webhooks with Svix.
  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'missing svix headers' }, { status: 400 })
  }

  const rawBody = await request.text()

  let event: ResendWebhookEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ResendWebhookEvent
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  // Only act on owner-notification emails for our leads. Anything else
  // (Dr Coins, customer auto-replies, untagged sends) is silently ignored.
  const kind = tagValue(event.data?.tags, 'kind')
  const leadId = tagValue(event.data?.tags, 'lead_id')

  if (kind !== 'owner_notification' || !leadId) {
    return NextResponse.json({ ok: true, ignored: 'not_owner_notification_or_no_lead_id' })
  }

  const field = FIELD_BY_EVENT[event.type]
  if (!field) {
    // email.sent, or any unknown type — no column to update.
    return NextResponse.json({ ok: true, ignored: `no_field_for_${event.type}` })
  }

  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: { [field]: new Date(event.created_at) },
    })
  } catch (err) {
    // Lead may have been deleted, or id mismatch. Don't 500 to Resend —
    // it would just retry. Log and acknowledge.
    console.error(`Webhook update failed for lead ${leadId} field ${field}:`, err)
  }

  return NextResponse.json({ ok: true, leadId, field })
}
