// Lead qualification: classify a lead into one of:
//   SPAM | TEST | VENDOR | OUT_OF_SCOPE | RESIDENTIAL | COMMERCIAL
//
// Strategy: confident rule-based pass first. If still ambiguous AND ANTHROPIC_API_KEY
// is configured, escalate to Claude Haiku for a tie-break. The rule pass alone is
// good enough for ~80% of real traffic; LLM catches edge cases like "Liz Badley
// liz@commongroundchildcare.org" (a personal-named email at an org domain — likely
// commercial inquiry from a small org).

import Anthropic from '@anthropic-ai/sdk'

export type LeadCategory =
  | 'SPAM'
  | 'TEST'
  | 'VENDOR'
  | 'OUT_OF_SCOPE'
  | 'RESIDENTIAL'
  | 'COMMERCIAL'

export interface LeadInput {
  name: string
  email?: string | null
  phone?: string | null
  city?: string | null
  customerType?: 'residential' | 'commercial' | string | null
  serviceRequested?: string | null
  message?: string | null
  sourcePage?: string | null
}

export interface QualifyResult {
  category: LeadCategory
  confidence: number // 0..1
  reason: string // 1-line human explanation
  source: 'rule' | 'llm' | 'rule+llm'
}

// Service area — kept in sync manually with SiteConfig.citiesServed and ServiceArea
// rows. Loose match: also accept nearby cities not on the list (Herndon, Aldie etc.)
// via a "northern_va_extended" set.
const SERVICE_AREA_PRIMARY = new Set(
  ['Ashburn', 'Fairfax', 'Vienna', 'Sterling', 'Leesburg', 'Purcellville',
    'Winchester', 'Reston', 'Manassas', 'Woodbridge'].map((c) => c.toLowerCase())
)
const SERVICE_AREA_EXTENDED = new Set(
  // Primary NoVA + everything within ~45min drive of the primary service area.
  // When in doubt, ADD the city. Better to mark a faraway lead RESIDENTIAL with low
  // confidence and let Josh review than to silently mark a real lead OUT_OF_SCOPE.
  ['Herndon', 'Aldie', 'Centreville', 'Chantilly', 'Great Falls', 'Mclean',
    'Mc Lean', 'Falls Church', 'Arlington', 'Alexandria', 'Annandale', 'Springfield',
    'Burke', 'Lorton', 'Dulles', 'Stone Ridge', 'Brambleton', 'South Riding',
    'Ashburn', 'Bristow', 'Gainesville', 'Haymarket', 'Warrenton',
    // Loudoun + Warren County + Frederick County (Winchester area) extensions:
    'Linden', 'Front Royal', 'Strasburg', 'Berryville', 'Stephens City',
    'Middletown', 'Boyce', 'Round Hill', 'Hamilton', 'Lovettsville', 'Lucketts',
    'Hillsboro', 'Bluemont', 'Paris', 'Upperville', 'Marshall', 'The Plains',
    'Delaplane', 'Markham', 'Flint Hill', 'Chester Gap', 'Linden Va',
    // Prince William + Fauquier:
    'Manassas Park', 'Nokesville', 'Catlett', 'Bealeton', 'Remington', 'Midland',
    // DC border cities (residential customers commute to NoVA):
    'Washington', 'Bethesda', 'Silver Spring', 'Rockville', 'Tysons', 'Vienna Va',
  ].map((c) => c.toLowerCase())
)

// Hard out-of-scope signals: cities/states clearly far from NoVA.
// If city is in this list OR ends with a known-far state → OUT_OF_SCOPE confidently.
const FAR_OUT_OF_AREA_KEYWORDS = [
  'new york', 'nyc', 'los angeles', 'san francisco', 'chicago', 'houston',
  'miami', 'seattle', 'boston', 'philadelphia', 'phoenix', 'atlanta',
  'dallas', 'denver', 'austin', 'portland', 'minneapolis', 'detroit',
]
function isClearlyFarAway(city?: string | null): boolean {
  if (!city) return false
  const c = city.trim().toLowerCase()
  return FAR_OUT_OF_AREA_KEYWORDS.some((kw) => c.includes(kw))
}

// Specific email addresses that always represent internal testing — never a real customer.
// Add to this list when a tester gets misclassified.
const KNOWN_TEST_EMAILS = new Set([
  'novahokie1998@gmail.com',  // Brian (operator)
  'brian@spotcircuit.com',     // Brian (work)
])

// Domains we know are us, or are vendors pitching us, never customers.
const SELF_DOMAINS = new Set([
  'velocityelectric.co',
  'velocitycapitalholding.com',
  'send.velocityelectric.co',
])
const VENDOR_DOMAINS = new Set([
  'buttonleads.com',
  'gunas.com',
  'alamoequitygroup.com',
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
])
// Generic outreach mailbox names that are never real customers.
const VENDOR_LOCALPARTS = new Set([
  'seo', 'marketing', 'sales', 'noreply', 'no-reply', 'admin', 'info',
  'contact', 'leads', 'partnerships', 'business', 'office', 'support',
])

// Names that are obvious tests/jokes.
const FAKE_NAME_PATTERNS = [
  /^test\b/i, /\btest$/i, /^asdf/i, /^qwerty/i, /\bjoe dirt\b/i,
  /^tango cash$/i, /^your boo$/i, /^second chance$/i, /^aaa\b/i,
  /^test ?ing/i, /^x{2,}/i, /lorem ipsum/i,
]

function emailDomain(email?: string | null): string | null {
  if (!email) return null
  const parts = email.toLowerCase().trim().split('@')
  return parts.length === 2 ? parts[1] : null
}

function emailLocalPart(email?: string | null): string | null {
  if (!email) return null
  const parts = email.toLowerCase().trim().split('@')
  return parts.length === 2 ? parts[0] : null
}

function looksLikeOrgEmail(email?: string | null): boolean {
  const domain = emailDomain(email)
  if (!domain) return false
  // Personal email providers
  const personal = new Set([
    'gmail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'aol.com', 'comcast.net', 'verizon.net', 'msn.com',
    'me.com', 'live.com', 'mail.com',
  ])
  return !personal.has(domain)
}

function digitsOnly(s?: string | null): string {
  return (s || '').replace(/\D+/g, '')
}

function isPlausiblePhone(phone?: string | null): boolean {
  const d = digitsOnly(phone)
  if (d.length < 10) return false
  // Reject 555 area code (fictional in US)
  if (d.length === 10 && d.startsWith('555')) return false
  if (d.length === 11 && d.startsWith('1555')) return false
  // Reject all-same-digit patterns (e.g. 5555555555, 5435435456)
  const last10 = d.slice(-10)
  if (/^(\d)\1{9}$/.test(last10)) return false
  return true
}

function cityClassification(city?: string | null): 'primary' | 'extended' | 'unknown' | 'no_city' {
  if (!city || !city.trim()) return 'no_city'
  const c = city.trim().toLowerCase()
  if (SERVICE_AREA_PRIMARY.has(c)) return 'primary'
  if (SERVICE_AREA_EXTENDED.has(c)) return 'extended'
  return 'unknown'
}

function commercialNameSignal(name: string): boolean {
  return /\b(LLC|L\.L\.C\.|Inc\.?|Corp\.?|Corporation|Company|Co\.|Group|Holdings|Federal|Contractors?|Construction|Services?|Solutions?|Properties?|Capital|Equity|Realty|Builders?)\b/i.test(name)
}

function ruleBasedClassify(lead: LeadInput): QualifyResult {
  const name = (lead.name || '').trim()
  const email = lead.email || null
  const domain = emailDomain(email)
  const localPart = emailLocalPart(email)
  const cityClass = cityClassification(lead.city)
  const phoneOk = isPlausiblePhone(lead.phone)
  const hasEmail = !!email
  const hasPhone = !!lead.phone

  // ---- TEST: known internal test email (Brian's emails) or self-domain emails
  if (email && KNOWN_TEST_EMAILS.has(email.toLowerCase().trim())) {
    return {
      category: 'TEST',
      confidence: 0.99,
      reason: `Known internal test email (${email})`,
      source: 'rule',
    }
  }
  if (domain && SELF_DOMAINS.has(domain)) {
    return {
      category: 'TEST',
      confidence: 0.95,
      reason: `Self-domain email (${domain}) — internal test`,
      source: 'rule',
    }
  }

  // ---- VENDOR: known vendor/outreach senders
  if (domain && VENDOR_DOMAINS.has(domain)) {
    return {
      category: 'VENDOR',
      confidence: 0.95,
      reason: `Known vendor/outreach domain (${domain})`,
      source: 'rule',
    }
  }
  if (localPart && VENDOR_LOCALPARTS.has(localPart) && looksLikeOrgEmail(email)) {
    return {
      category: 'VENDOR',
      confidence: 0.85,
      reason: `Generic outreach mailbox (${localPart}@${domain})`,
      source: 'rule',
    }
  }

  // ---- SPAM: obvious junk patterns
  for (const pattern of FAKE_NAME_PATTERNS) {
    if (pattern.test(name)) {
      return {
        category: 'SPAM',
        confidence: 0.9,
        reason: `Fake/test name pattern matched (${pattern.source})`,
        source: 'rule',
      }
    }
  }
  // No name + no usable contact info
  if (!name && !hasEmail && !phoneOk) {
    return {
      category: 'SPAM',
      confidence: 0.9,
      reason: 'No name, no email, no valid phone',
      source: 'rule',
    }
  }
  // Single-word lowercase name with no contact info
  if (name && /^[a-z]+$/.test(name) && !hasEmail && !phoneOk) {
    return {
      category: 'SPAM',
      confidence: 0.8,
      reason: 'Single-word lowercase name with no contact info',
      source: 'rule',
    }
  }
  // Implausible phone + no email
  if (!hasEmail && !phoneOk && hasPhone) {
    return {
      category: 'SPAM',
      confidence: 0.75,
      reason: 'No email and phone is implausible (555/repeating/short)',
      source: 'rule',
    }
  }

  // ---- COMMERCIAL: explicit type, org name, or org email domain
  if (lead.customerType === 'commercial') {
    return {
      category: 'COMMERCIAL',
      confidence: 0.9,
      reason: 'User selected "Commercial" on form',
      source: 'rule',
    }
  }
  if (commercialNameSignal(name)) {
    return {
      category: 'COMMERCIAL',
      confidence: 0.85,
      reason: `Business name signal in "${name}" (LLC/Inc/Corp/Group/etc.)`,
      source: 'rule',
    }
  }
  // Org-domain email + person-looking name → commercial inquiry
  // (e.g. Liz Badley liz@commongroundchildcare.org)
  if (looksLikeOrgEmail(email) && /\s/.test(name)) {
    return {
      category: 'COMMERCIAL',
      confidence: 0.7,
      reason: `Person-named lead at org domain (${domain})`,
      source: 'rule',
    }
  }

  // ---- OUT_OF_SCOPE: only when CLEARLY far (NYC/LA/etc.). Unknown VA-area cities
  // fall through to RESIDENTIAL with low confidence — better to surface for review
  // than silently sideline a real customer who happens to live in a small VA town.
  if (isClearlyFarAway(lead.city)) {
    return {
      category: 'OUT_OF_SCOPE',
      confidence: 0.9,
      reason: `City "${lead.city}" is clearly outside our service region`,
      source: 'rule',
    }
  }

  // ---- RESIDENTIAL default — has at least name + (email or valid phone)
  if (name && (hasEmail || phoneOk)) {
    return {
      category: 'RESIDENTIAL',
      confidence:
        cityClass === 'primary' ? 0.85 :
        cityClass === 'extended' ? 0.75 :
        cityClass === 'no_city' ? 0.65 :
        0.55, // unknown VA city — likely real but flag for review
      reason: `Real-looking name + contact${
        cityClass === 'primary' ? ', in primary service area' :
        cityClass === 'extended' ? ', in extended NoVA area' :
        cityClass === 'no_city' ? ', no city given' :
        `, city "${lead.city}" not in known list — review`
      }`,
      source: 'rule',
    }
  }

  // ---- Fallback: low-confidence spam
  return {
    category: 'SPAM',
    confidence: 0.5,
    reason: 'Could not satisfy any positive signal',
    source: 'rule',
  }
}

// Optional LLM tie-breaker for low-confidence rule results (~< 0.7).
async function llmTieBreaker(lead: LeadInput, ruleResult: QualifyResult): Promise<QualifyResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return ruleResult

  try {
    const client = new Anthropic({ apiKey })
    const prompt = `You are classifying a lead form submission for a residential & commercial electrician serving Northern Virginia.

Lead data:
- Name: ${JSON.stringify(lead.name)}
- Email: ${JSON.stringify(lead.email || null)}
- Phone: ${JSON.stringify(lead.phone || null)}
- City: ${JSON.stringify(lead.city || null)}
- Customer type (selected on form): ${JSON.stringify(lead.customerType || null)}
- Service requested: ${JSON.stringify(lead.serviceRequested || null)}
- Message: ${JSON.stringify(lead.message || null)}
- Source page: ${JSON.stringify(lead.sourcePage || null)}

Service area: Northern Virginia (Ashburn, Fairfax, Vienna, Sterling, Leesburg, Reston, Manassas, Woodbridge, Herndon, surrounding ~25mi). Anything else is OUT_OF_SCOPE.

Initial rule classification (likely but uncertain): ${ruleResult.category} (confidence ${ruleResult.confidence.toFixed(2)}, "${ruleResult.reason}")

Choose ONE category from: SPAM | TEST | VENDOR | OUT_OF_SCOPE | RESIDENTIAL | COMMERCIAL.

Return STRICT JSON only:
{"category":"<one>","confidence":0.0-1.0,"reason":"<one short sentence>"}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim()
    // Extract first JSON object
    const match = text.match(/\{[^}]*\}/)
    if (!match) return ruleResult
    const parsed = JSON.parse(match[0]) as { category?: string; confidence?: number; reason?: string }
    const validCats: LeadCategory[] = ['SPAM', 'TEST', 'VENDOR', 'OUT_OF_SCOPE', 'RESIDENTIAL', 'COMMERCIAL']
    if (!parsed.category || !validCats.includes(parsed.category as LeadCategory)) return ruleResult

    return {
      category: parsed.category as LeadCategory,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
      reason: parsed.reason || ruleResult.reason,
      source: 'rule+llm',
    }
  } catch (err) {
    console.warn('LLM tie-breaker failed, using rule result:', err)
    return ruleResult
  }
}

export async function qualifyLead(lead: LeadInput): Promise<QualifyResult> {
  const ruleResult = ruleBasedClassify(lead)
  // Only escalate to LLM for borderline cases (saves cost + latency on obvious ones)
  if (ruleResult.confidence < 0.7) {
    return await llmTieBreaker(lead, ruleResult)
  }
  return ruleResult
}

// Sync version for places that can't await (e.g. UI). Always returns rule result.
export function qualifyLeadSync(lead: LeadInput): QualifyResult {
  return ruleBasedClassify(lead)
}
