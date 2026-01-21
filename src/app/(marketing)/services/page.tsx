import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { ServiceCard } from '@/components/sections/service-card'
import { CTASection } from '@/components/sections/cta-section'

export const metadata: Metadata = {
  title: 'Our Electrical Services',
  description:
    'Professional electrical services including repairs, installations, panel upgrades, EV charger installation, lighting, smart home, and commercial electrical work.',
}

async function getServicesData() {
  const [services, config] = await Promise.all([
    prisma.service.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { services, config }
}

export default async function ServicesPage() {
  const { services, config } = await getServicesData()

  return (
    <>
      {/* Hero */}
      <Section className="pt-24 md:pt-32 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-3xl">
          <h1 className="text-white mb-4">Our Electrical Services</h1>
          <p className="text-xl text-gray-300">
            From simple repairs to complex installations, our licensed electricians
            provide comprehensive electrical services for residential and commercial
            properties.
          </p>
        </div>
      </Section>

      {/* Services Grid */}
      <Section>
        {services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">No services available at this time.</p>
          </div>
        )}
      </Section>

      {/* Why Choose Us */}
      <Section background="surface">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="mb-6">Why Choose Our Electrical Services?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div>
              <h3 className="font-semibold text-primary mb-2">Licensed Experts</h3>
              <p className="text-muted text-sm">
                Our Master Electricians have years of experience and stay current
                with the latest codes and technologies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Upfront Pricing</h3>
              <p className="text-muted text-sm">
                No surprises. We provide detailed estimates before starting any
                work so you know exactly what to expect.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Guaranteed Work</h3>
              <p className="text-muted text-sm">
                We stand behind our work with a satisfaction guarantee. If you're
                not happy, we'll make it right.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CTASection
        phone={config.phone}
        title="Need Electrical Service?"
        description="Contact us today for a free estimate. Our team is ready to help with all your electrical needs."
      />
    </>
  )
}
