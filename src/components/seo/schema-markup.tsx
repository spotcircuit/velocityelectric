import { getSiteConfig } from '@/lib/config'

export async function LocalBusinessSchema() {
  const config = await getSiteConfig()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    '@id': process.env.NEXT_PUBLIC_SITE_URL || 'https://velocityelectric.com',
    name: config.businessName,
    description: `${config.businessName} provides professional electrical services including repairs, installations, panel upgrades, EV charger installation, and emergency electrical service.`,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velocityelectric.com',
    telephone: config.phone,
    email: config.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: config.address.split(',')[0]?.trim() || '',
      addressLocality: config.primaryArea,
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Note: Add actual coordinates for better local SEO
    },
    openingHours: config.hours,
    priceRange: '$$',
    image: `${process.env.NEXT_PUBLIC_SITE_URL || ''}/brand/logo.png`,
    sameAs: [],
    areaServed: config.citiesServed.map((city) => ({
      '@type': 'City',
      name: city,
    })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Electrical Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Electrical Repairs & Troubleshooting',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Panel Upgrades & Breakers',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'EV Charger Installation',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Lighting & Ceiling Fans',
          },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      reviewCount: '500',
      bestRating: '5',
      worstRating: '1',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

interface FAQSchemaProps {
  faqs: { question: string; answer: string }[]
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  if (faqs.length === 0) return null

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
