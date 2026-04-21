// HubSpot CRM integration.
//
// Push flow (called from src/app/actions/lead.ts after qualifyLead):
//   - SPAM/TEST/VENDOR  → no push (lead stays in Postgres only with qualification flag)
//   - OUT_OF_SCOPE      → push as Contact, lifecycle = "other", lead status = "BAD_FIT"
//   - RESIDENTIAL       → upsert Contact + create Deal + associate
//   - COMMERCIAL        → upsert Contact + upsert Company + create Deal + associate all 3
//
// Returns IDs so the caller can persist them on the Lead row.

import type { LeadCategory } from './qualify'

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN

export interface HubSpotLeadInput {
  name: string
  phone: string
  email?: string | null
  city?: string | null
  customerType?: string | null
  serviceRequested?: string | null
  message?: string | null
  sourcePage: string
  qualification: LeadCategory
  qualificationReason?: string | null
}

export interface HubSpotPushResult {
  ok: boolean
  contactId?: string | null
  companyId?: string | null
  dealId?: string | null
  error?: string
  skipped?: 'no_token' | 'spam' | 'test' | 'vendor'
}

const SERVICE_LABELS: Record<string, string> = {
  'electrical-repairs-troubleshooting': 'Electrical Repairs & Troubleshooting',
  'panel-upgrades-breakers': 'Panel Upgrades & Breakers',
  'lighting-ceiling-fans': 'Lighting & Ceiling Fans',
  'ev-charger-installation': 'EV Charger Installation',
  'surge-protection': 'Surge Protection',
  'generator-transfer-switches': 'Generator & Transfer Switches',
  'fire-safety': 'Fire Safety',
  'commercial-electrical': 'Commercial Electrical',
}

function serviceLabel(slug?: string | null): string {
  if (!slug) return 'General Inquiry'
  return SERVICE_LABELS[slug] || slug
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/)
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  }
}

function fakeEmailFromPhone(phone: string): string {
  return `${phone.replace(/\D/g, '')}@noemail.velocityelectric.com`
}

async function hubspotFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return fetch(`https://api.hubapi.com${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HUBSPOT_TOKEN}`,
      ...options.headers,
    },
  })
}

// Lifecycle stage + lead status per qualification category.
function lifecycleFor(cat: LeadCategory): { lifecyclestage: string; hs_lead_status?: string } {
  switch (cat) {
    case 'COMMERCIAL':
    case 'RESIDENTIAL':
      return { lifecyclestage: 'lead', hs_lead_status: 'NEW' }
    case 'OUT_OF_SCOPE':
      return { lifecyclestage: 'other', hs_lead_status: 'BAD_FIT' }
    case 'VENDOR':
      return { lifecyclestage: 'other', hs_lead_status: 'UNQUALIFIED' }
    case 'SPAM':
    case 'TEST':
    default:
      return { lifecyclestage: 'other', hs_lead_status: 'UNQUALIFIED' }
  }
}

// ---- Contact upsert ---------------------------------------------------------

async function upsertContact(
  lead: HubSpotLeadInput
): Promise<{ id: string | null; error?: string }> {
  const { firstName, lastName } = splitName(lead.name)
  const lifecycle = lifecycleFor(lead.qualification)

  const properties: Record<string, string> = {
    firstname: firstName,
    lastname: lastName,
    phone: lead.phone,
    city: lead.city || '',
    customer_type: lead.customerType || '',
    lifecyclestage: lifecycle.lifecyclestage,
  }
  if (lifecycle.hs_lead_status) properties.hs_lead_status = lifecycle.hs_lead_status
  if (lead.email) properties.email = lead.email

  try {
    if (lead.email) {
      const searchRes = await hubspotFetch('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [
            { filters: [{ propertyName: 'email', operator: 'EQ', value: lead.email }] },
          ],
        }),
      })
      const searchData = await searchRes.json()
      if (searchData.total > 0) {
        const id = searchData.results[0].id as string
        await hubspotFetch(`/crm/v3/objects/contacts/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ properties }),
        })
        return { id }
      }
    }

    if (!lead.email) properties.email = fakeEmailFromPhone(lead.phone)

    const createRes = await hubspotFetch('/crm/v3/objects/contacts', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })
    if (!createRes.ok) {
      return { id: null, error: `contact create ${createRes.status}` }
    }
    const data = await createRes.json()
    return { id: data.id as string }
  } catch (err) {
    return { id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

// ---- Company upsert (commercial only) ---------------------------------------

function inferCompanyName(lead: HubSpotLeadInput): string {
  // Best guess from available data:
  //   1. Business name in lead.name (LLC/Inc/Corp/etc.)
  //   2. Org domain after "@" — capitalized
  //   3. "{Customer Name}'s Business" placeholder
  if (/\b(LLC|Inc\.?|Corp\.?|Corporation|Company|Co\.?|Group|Holdings|Federal|Contractors?|Construction|Services?|Solutions?|Properties?|Capital|Equity|Realty|Builders?)\b/i.test(lead.name)) {
    return lead.name.trim()
  }
  if (lead.email && lead.email.includes('@')) {
    const domain = lead.email.split('@')[1].toLowerCase()
    const personal = ['gmail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'comcast.net', 'verizon.net', 'msn.com', 'me.com', 'live.com', 'mail.com']
    if (!personal.includes(domain)) {
      const root = domain.split('.')[0]
      return root.charAt(0).toUpperCase() + root.slice(1)
    }
  }
  return `${lead.name.trim()} (Pending — Commercial)`
}

function inferCompanyDomain(lead: HubSpotLeadInput): string | null {
  if (lead.email && lead.email.includes('@')) {
    const domain = lead.email.split('@')[1].toLowerCase()
    const personal = ['gmail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'comcast.net', 'verizon.net', 'msn.com', 'me.com', 'live.com', 'mail.com']
    if (!personal.includes(domain)) return domain
  }
  return null
}

async function upsertCompany(
  lead: HubSpotLeadInput
): Promise<{ id: string | null; error?: string }> {
  const name = inferCompanyName(lead)
  const domain = inferCompanyDomain(lead)
  const properties: Record<string, string> = {
    name,
    city: lead.city || '',
  }
  if (domain) properties.domain = domain

  try {
    // Search by domain (HubSpot's preferred dedup key for companies)
    if (domain) {
      const searchRes = await hubspotFetch('/crm/v3/objects/companies/search', {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [
            { filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] },
          ],
        }),
      })
      const searchData = await searchRes.json()
      if (searchData.total > 0) {
        const id = searchData.results[0].id as string
        await hubspotFetch(`/crm/v3/objects/companies/${id}`, {
          method: 'PATCH',
          body: JSON.stringify({ properties }),
        })
        return { id }
      }
    }

    const createRes = await hubspotFetch('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })
    if (!createRes.ok) {
      return { id: null, error: `company create ${createRes.status}` }
    }
    const data = await createRes.json()
    return { id: data.id as string }
  } catch (err) {
    return { id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

// ---- Deal create + associate ------------------------------------------------

async function createDealAndAssociate(
  lead: HubSpotLeadInput,
  contactId: string,
  companyId: string | null
): Promise<{ id: string | null; error?: string }> {
  const label = serviceLabel(lead.serviceRequested)
  const properties: Record<string, string> = {
    dealname: `${lead.name} - ${label}`,
    pipeline: 'default',
    dealstage: 'appointmentscheduled',
    description: [
      `Service: ${label}`,
      `Qualification: ${lead.qualification}${lead.qualificationReason ? ` (${lead.qualificationReason})` : ''}`,
      lead.city ? `City: ${lead.city}` : '',
      lead.message ? `Message: ${lead.message}` : '',
      `Source: ${lead.sourcePage}`,
    ].filter(Boolean).join('\n'),
  }

  try {
    const createRes = await hubspotFetch('/crm/v3/objects/deals', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    })
    if (!createRes.ok) {
      return { id: null, error: `deal create ${createRes.status}` }
    }
    const data = await createRes.json()
    const dealId = data.id as string

    // Associate deal → contact
    await hubspotFetch(
      `/crm/v3/objects/deals/${dealId}/associations/contacts/${contactId}/deal_to_contact`,
      { method: 'PUT' }
    )

    // Associate deal → company (commercial)
    if (companyId) {
      await hubspotFetch(
        `/crm/v3/objects/deals/${dealId}/associations/companies/${companyId}/deal_to_company`,
        { method: 'PUT' }
      )
      // Also associate contact → company
      await hubspotFetch(
        `/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
        { method: 'PUT' }
      )
    }

    return { id: dealId }
  } catch (err) {
    return { id: null, error: err instanceof Error ? err.message : String(err) }
  }
}

// ---- Public entry point -----------------------------------------------------

export async function pushLeadToHubSpot(lead: HubSpotLeadInput): Promise<HubSpotPushResult> {
  if (!HUBSPOT_TOKEN) return { ok: false, skipped: 'no_token' }

  // Suppress full-junk categories — these never make it into the CRM.
  if (lead.qualification === 'SPAM') return { ok: true, skipped: 'spam' }
  if (lead.qualification === 'TEST') return { ok: true, skipped: 'test' }
  if (lead.qualification === 'VENDOR') return { ok: true, skipped: 'vendor' }

  const contactRes = await upsertContact(lead)
  if (!contactRes.id) {
    return { ok: false, error: contactRes.error || 'contact upsert failed' }
  }

  let companyId: string | null = null
  if (lead.qualification === 'COMMERCIAL') {
    const compRes = await upsertCompany(lead)
    if (compRes.id) {
      companyId = compRes.id
    } else {
      console.warn('Company upsert failed, proceeding without:', compRes.error)
    }
  }

  // OUT_OF_SCOPE → no deal (just a contact tagged as bad fit)
  if (lead.qualification === 'OUT_OF_SCOPE') {
    return { ok: true, contactId: contactRes.id, companyId }
  }

  const dealRes = await createDealAndAssociate(lead, contactRes.id, companyId)
  return {
    ok: !!dealRes.id,
    contactId: contactRes.id,
    companyId,
    dealId: dealRes.id,
    error: dealRes.error,
  }
}

// ---- Backfill helpers (used by scripts/backfill-qualify.ts) ----------------

export async function archiveContact(contactId: string): Promise<{ ok: boolean; error?: string }> {
  if (!HUBSPOT_TOKEN) return { ok: false, error: 'no token' }
  try {
    const res = await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, { method: 'DELETE' })
    return { ok: res.ok, error: res.ok ? undefined : `archive ${res.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export async function setContactProperties(
  contactId: string,
  properties: Record<string, string>
): Promise<{ ok: boolean; error?: string }> {
  if (!HUBSPOT_TOKEN) return { ok: false, error: 'no token' }
  try {
    const res = await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties }),
    })
    return { ok: res.ok, error: res.ok ? undefined : `patch ${res.status}` }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}
