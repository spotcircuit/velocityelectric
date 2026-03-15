import { getSiteConfig } from '@/lib/config'
import { prisma } from '@/lib/db'

export async function LocalBusinessSchema() {
  const [config, testimonials] = await Promise.all([
    getSiteConfig(),
    prisma.testimonial.aggregate({
      where: { published: true },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ])

  const ratingValue = testimonials._avg.rating ?? 5
  const reviewCount = testimonials._count.rating

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    '@id': process.env.NEXT_PUBLIC_SITE_URL || 'https://velocityelectric.co',
    name: config.businessName,
    description: `${config.businessName} provides professional electrical services including repairs, installations, panel upgrades, EV charger installation, and emergency electrical service.`,
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velocityelectric.co',
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
    ...(reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: ratingValue.toFixed(1),
        reviewCount: String(reviewCount),
        bestRating: '5',
        worstRating: '1',
      },
    }),
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
