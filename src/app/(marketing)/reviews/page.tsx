import { Metadata } from 'next'
import Link from 'next/link'
import { Star, ExternalLink } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { ReviewCard } from '@/components/sections/review-card'
import { CTASection } from '@/components/sections/cta-section'

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Read what our customers say about our electrical services. 5-star rated electrician with hundreds of satisfied customers.',
}

async function getReviewsData() {
  const [testimonials, config] = await Promise.all([
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    }),
    getSiteConfig(),
  ])

  return { testimonials, config }
}

export default async function ReviewsPage() {
  const { testimonials, config } = await getReviewsData()

  // Calculate stats
  const totalReviews = testimonials.length
  const avgRating =
    totalReviews > 0
      ? testimonials.reduce((acc: number, t: { rating: number }) => acc + t.rating, 0) / totalReviews
      : 5
  const fiveStarCount = testimonials.filter((t) => t.rating === 5).length
  const fiveStarPercent = totalReviews > 0 ? (fiveStarCount / totalReviews) * 100 : 100

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Customer Reviews
          </h1>
          <p className="text-xl" style={{ color: '#D1D5DB' }}>
            Don't just take our word for it. See what our customers have to say
            about their experience with {config.businessName}.
          </p>
        </div>
      </section>

      {/* Rating Summary */}
      <Section background="surface" padding="sm">
        <div className="bg-white rounded-2xl p-8 shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 mb-2">
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
              <p className="text-muted">Based on {totalReviews} reviews</p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = testimonials.filter((t) => t.rating === stars).length
                const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-12">
                      <span className="text-sm font-medium">{stars}</span>
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted w-8">{count}</span>
                  </div>
                )
              })}
            </div>

            {/* Google Reviews Link */}
            <div className="text-center">
              <p className="text-2xl font-bold text-success mb-1">
                {fiveStarPercent.toFixed(0)}%
              </p>
              <p className="text-muted mb-4">5-Star Reviews</p>
              {config.googleReviewUrl && (
                <a
                  href={config.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm">
                    Leave a Review
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Reviews Grid */}
      <Section>
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="text-center py-12">
            <p className="text-muted">No reviews yet. Be the first to leave a review!</p>
          </div>
        )}
      </Section>

      {/* CTA */}
      <CTASection
        phone={config.phone}
        title="Experience the Difference"
        description="Join our growing list of satisfied customers. Contact us today for reliable, professional electrical service."
      />
    </>
  )
}
