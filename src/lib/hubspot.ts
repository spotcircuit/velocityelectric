const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN

interface LeadData {
  name: string
  phone: string
  email?: string | null
  city?: string | null
  customerType?: string | null
  serviceRequested?: string | null
  message?: string | null
  sourcePage: string
}

/**
 * Create or update a contact in HubSpot and create a deal for the lead.
 * Fails silently if HUBSPOT_ACCESS_TOKEN is not configured.
 */
export async function pushLeadToHubSpot(lead: LeadData): Promise<void> {
  if (!HUBSPOT_TOKEN) return

  const nameParts = lead.name.trim().split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  // Service slug to readable label
  const serviceLabels: Record<string, string> = {
    'electrical-repairs-troubleshooting': 'Electrical Repairs & Troubleshooting',
    'panel-upgrades-breakers': 'Panel Upgrades & Breakers',
    'lighting-ceiling-fans': 'Lighting & Ceiling Fans',
    'ev-charger-installation': 'EV Charger Installation',
    'surge-protection': 'Surge Protection',
    'generator-transfer-switches': 'Generator & Transfer Switches',
    'fire-safety': 'Fire Safety',
    'commercial-electrical': 'Commercial Electrical',
  }

  const serviceLabel = lead.serviceRequested
    ? serviceLabels[lead.serviceRequested] || lead.serviceRequested
    : 'General Inquiry'

  // 1. Create or update contact
  const contactProperties: Record<string, string> = {
    firstname: firstName,
    lastname: lastName,
    phone: lead.phone,
    city: lead.city || '',
    customer_type: lead.customerType || '',
  }

  // Only set email if provided (HubSpot uses email as unique key)
  if (lead.email) {
    contactProperties.email = lead.email
  }

  let contactId: string | null = null

  try {
    if (lead.email) {
      // Try to find existing contact by email
      const searchRes = await hubspotFetch('/crm/v3/objects/contacts/search', {
        method: 'POST',
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: lead.email,
            }],
          }],
        }),
      })

      const searchData = await searchRes.json()

      if (searchData.total > 0) {
        // Update existing contact
        contactId = searchData.results[0].id
        await hubspotFetch(`/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          body: JSON.stringify({ properties: contactProperties }),
        })
      }
    }

    if (!contactId) {
      // Create new contact
      if (!lead.email) {
        // HubSpot requires email for contacts — use phone-based placeholder
        contactProperties.email = `${lead.phone.replace(/\D/g, '')}@noemail.velocityelectric.com`
      }

      const createRes = await hubspotFetch('/crm/v3/objects/contacts', {
        method: 'POST',
        body: JSON.stringify({ properties: contactProperties }),
      })

      if (createRes.ok) {
        const createData = await createRes.json()
        contactId = createData.id
      }
    }
  } catch (error) {
    console.error('HubSpot contact error:', error)
  }

  // 2. Create a deal for this lead
  if (contactId) {
    try {
      const dealProperties: Record<string, string> = {
        dealname: `${lead.name} - ${serviceLabel}`,
        pipeline: 'default',
        dealstage: 'appointmentscheduled',
        description: [
          `Service: ${serviceLabel}`,
          lead.city ? `City: ${lead.city}` : '',
          lead.message ? `Message: ${lead.message}` : '',
          `Source: ${lead.sourcePage}`,
        ].filter(Boolean).join('\n'),
      }

      const dealRes = await hubspotFetch('/crm/v3/objects/deals', {
        method: 'POST',
        body: JSON.stringify({ properties: dealProperties }),
      })

      if (dealRes.ok) {
        const dealData = await dealRes.json()
        // Associate deal with contact
        await hubspotFetch(
          `/crm/v3/objects/deals/${dealData.id}/associations/contacts/${contactId}/deal_to_contact`,
          { method: 'PUT' }
        )
      }
    } catch (error) {
      console.error('HubSpot deal error:', error)
    }
  }
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
