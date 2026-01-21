import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { PromoCard } from '@/components/sections/promo-card'
import { CTASection } from '@/components/sections/cta-section'

export const metadata: Metadata = {
  title: 'Specials & Coupons',
  description:
    'Save on electrical services with our current specials and coupons. Check back regularly for new offers!',
}

async function getSpecialsData() {
  const [promos, config] = await Promise.all([
    prisma.promo.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { promos, config }
}

export default async function SpecialsPage() {
  const { promos, config } = await getSpecialsData()

  // Separate active and expired promos
  const now = new Date()
  const activePromos = promos.filter(
    (p) => !p.expiresAt || new Date(p.expiresAt) >= now
  )
  const expiredPromos = promos.filter(
    (p) => p.expiresAt && new Date(p.expiresAt) < now
  )

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Specials & Coupons
          </h1>
          <p className="text-xl" style={{ color: '#D1D5DB' }}>
            Take advantage of our current specials and save on your next
            electrical service. Limited time offers - don't miss out!
          </p>
        </div>
      </section>

      {/* Active Promos */}
      <Section>
        {activePromos.length > 0 ? (
          <>
            <div className="text-center mb-12">
              <h2 className="mb-4">Current Offers</h2>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Save on quality electrical services with these exclusive offers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePromos.map((promo: { id: string; title: string; description: string; code: string | null; expiresAt: Date | null }) => (
                <PromoCard
                  key={promo.id}
                  title={promo.title}
                  description={promo.description}
                  code={promo.code}
                  expiresAt={promo.expiresAt}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="mb-4">No Active Specials</h2>
            <p className="text-muted max-w-xl mx-auto">
              We don't have any active specials at the moment, but check back
              soon! You can also call us directly to ask about current offers.
            </p>
          </div>
        )}
      </Section>

      {/* Terms */}
      {activePromos.length > 0 && (
        <Section background="surface" padding="sm">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-primary mb-4">
              Terms & Conditions
            </h3>
            <ul className="text-sm text-muted space-y-2">
              <li>Offers cannot be combined with other discounts or promotions.</li>
              <li>Must mention offer when scheduling your appointment.</li>
              <li>Some restrictions may apply. Ask for details.</li>
              <li>Offers subject to change without notice.</li>
            </ul>
          </div>
        </Section>
      )}

      {/* Expired Promos (if any, show them faded) */}
      {expiredPromos.length > 0 && (
        <Section>
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-muted mb-2">
              Past Offers
            </h3>
            <p className="text-sm text-muted">
              These offers have expired, but similar deals may return in the future.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expiredPromos.slice(0, 3).map((promo: { id: string; title: string; description: string; code: string | null; expiresAt: Date | null }) => (
              <PromoCard
                key={promo.id}
                title={promo.title}
                description={promo.description}
                code={promo.code}
                expiresAt={promo.expiresAt}
              />
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <CTASection
        phone={config.phone}
        title="Don't Wait to Save!"
        description="Contact us today to take advantage of these special offers. Mention the promo when you call!"
      />
    </>
  )
}
