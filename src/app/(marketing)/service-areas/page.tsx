import { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { CTASection } from '@/components/sections/cta-section'

export const metadata: Metadata = {
  title: 'Service Areas',
  description:
    'Professional electrical services available in your area. We serve residential and commercial customers throughout the region.',
}

async function getServiceAreasData() {
  const [areas, config] = await Promise.all([
    prisma.serviceArea.findMany({
      where: { published: true },
      orderBy: { city: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { areas, config }
}

export default async function ServiceAreasPage() {
  const { areas, config } = await getServiceAreasData()

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Service Areas
          </h1>
          <p className="text-xl" style={{ color: '#D1D5DB' }}>
            Proudly serving {config.primaryArea} and surrounding communities with
            professional electrical services. Find your city below.
          </p>
        </div>
      </section>

      {/* Service Areas Grid */}
      <Section>
        {areas.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="mb-4">Cities We Serve</h2>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Click on your city to learn more about our electrical services in
                your area.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {areas.map((area: { id: string; slug: string; city: string; state: string; intro: string }) => (
                <Link key={area.id} href={`/service-areas/${area.slug}`}>
                  <Card className="h-full group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent-soft rounded-xl group-hover:bg-accent transition-colors">
                          <MapPin className="h-6 w-6 text-accent group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-primary group-hover:text-accent transition-colors mb-1">
                            {area.city}
                          </h3>
                          <p className="text-sm text-muted mb-3">{area.state}</p>
                          <p className="text-muted text-sm line-clamp-2">
                            {area.intro.slice(0, 100)}...
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted mx-auto mb-4" />
            <h2 className="mb-2">Coming Soon</h2>
            <p className="text-muted max-w-xl mx-auto">
              We're currently updating our service area information. In the
              meantime, give us a call to find out if we serve your area.
            </p>
          </div>
        )}
      </Section>

      {/* Don't See Your Area */}
      <Section background="surface">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="mb-4">Don't See Your Area?</h2>
          <p className="text-muted mb-6">
            We may still be able to help! Give us a call and we'll let you know
            if we can service your location.
          </p>
          <Link href="/contact">
            <button className="btn-primary">Contact Us</button>
          </Link>
        </div>
      </Section>

      {/* CTA */}
      <CTASection phone={config.phone} />
    </>
  )
}
