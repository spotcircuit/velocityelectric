import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Hero } from '@/components/sections/hero'
import { WhatToExpect } from '@/components/sections/what-to-expect'
import { TrustBadges } from '@/components/sections/trust-badges'
import { CTASection } from '@/components/sections/cta-section'
import { ServiceCard } from '@/components/sections/service-card'
import { ReviewCard } from '@/components/sections/review-card'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Professional Electrician Services | Velocity Electric',
  description:
    'Licensed Master Electrician providing professional electrical services. Repairs, installations, panel upgrades, EV chargers, and 24/7 emergency service. Free estimates!',
}

async function getHomePageData() {
  const [services, testimonials, config] = await Promise.all([
    prisma.service.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
      take: 8,
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    getSiteConfig(),
  ])

  return { services, testimonials, config }
}

export default async function HomePage() {
  const { services, testimonials, config } = await getHomePageData()

  // Calculate average rating
  const avgRating =
    testimonials.length > 0
      ? testimonials.reduce((acc: number, t: { rating: number }) => acc + t.rating, 0) / testimonials.length
      : 5

  return (
    <>
      {/* Hero Section */}
      <Hero
        businessName={config.businessName}
        phone={config.phone}
        tagline={config.tagline}
        licenseNumber={config.licenseNumber}
      />

      {/* Trust Badges */}
      <Section padding="sm">
        <TrustBadges />
      </Section>

      {/* Services Section */}
      <Section background="surface">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
            Our Services
          </span>
          <h2 className="mb-4">Professional Electrical Services</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            From simple repairs to complex installations, our licensed electricians
            handle all your residential and commercial electrical needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              slug={service.slug}
              title={service.title}
              excerpt={service.excerpt}
              iconName={service.iconName}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/services">
            <Button variant="secondary">
              View All Services
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* What to Expect */}
      <WhatToExpect />

      {/* Reviews Section */}
      {testimonials.length > 0 && (
        <Section>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.round(avgRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold text-primary">
                {avgRating.toFixed(1)}
              </span>
            </div>
            <h2 className="mb-4">What Our Customers Say</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers
              have to say about our electrical services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <ReviewCard
                key={testimonial.id}
                name={testimonial.name}
                rating={testimonial.rating}
                text={testimonial.text}
                location={testimonial.location}
              />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/reviews">
              <Button variant="secondary">
                Read More Reviews
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Section>
      )}

      {/* Service Areas Preview */}
      <Section background="surface">
        <div className="text-center mb-8">
          <h2 className="mb-4">Service Areas</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Proudly serving {config.primaryArea} and surrounding communities with
            professional electrical services.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {config.citiesServed.slice(0, 8).map((city) => (
            <Link
              key={city}
              href={`/service-areas/${city.toLowerCase().replace(/\s+/g, '-')}`}
              className="city-link-pill"
            >
              {city}
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/service-areas">
            <Button variant="secondary">
              View All Service Areas
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* CTA Section */}
      <CTASection phone={config.phone} />
    </>
  )
}
