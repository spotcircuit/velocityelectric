import { prisma } from './db'

export interface SiteConfigData {
  businessName: string
  phone: string
  email: string
  primaryArea: string
  citiesServed: string[]
  hours: string
  emergencyEnabled: boolean
  licenseNumber: string
  googleReviewUrl: string
  address: string
  tagline: string
  aboutText: string
}

const defaultConfig: SiteConfigData = {
  businessName: 'Velocity Electric',
  phone: '(571) 532-1594',
  email: 'info@velocityelectric.com',
  primaryArea: 'Metro Area',
  citiesServed: ['Springfield', 'Riverside', 'Oakville', 'Lakewood', 'Hillcrest'],
  hours: 'Mon-Fri 7AM-6PM, Sat 8AM-4PM',
  emergencyEnabled: true,
  licenseNumber: 'VA Master Electrician #2710047894',
  googleReviewUrl: '',
  address: '123 Main Street, Springfield, ST 12345',
  tagline: 'Your Trusted Master Electrician',
  aboutText: 'With over 20 years of experience, we provide top-quality electrical services to residential and commercial customers.',
}

let cachedConfig: SiteConfigData | null = null
let cacheTime = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

export async function getSiteConfig(): Promise<SiteConfigData> {
  const now = Date.now()

  if (cachedConfig && now - cacheTime < CACHE_DURATION) {
    return cachedConfig
  }

  try {
    const config = await prisma.siteConfig.findFirst({
      where: { id: 'site-config' },
    })

    if (config) {
      cachedConfig = {
        businessName: config.businessName,
        phone: config.phone,
        email: config.email,
        primaryArea: config.primaryArea,
        citiesServed: JSON.parse(config.citiesServed || '[]'),
        hours: config.hours,
        emergencyEnabled: config.emergencyEnabled,
        licenseNumber: config.licenseNumber,
        googleReviewUrl: config.googleReviewUrl,
        address: config.address,
        tagline: config.tagline,
        aboutText: config.aboutText,
      }
      cacheTime = now
      return cachedConfig
    }
  } catch (error) {
    console.error('Error fetching site config:', error)
  }

  return defaultConfig
}

export function clearConfigCache() {
  cachedConfig = null
  cacheTime = 0
}
