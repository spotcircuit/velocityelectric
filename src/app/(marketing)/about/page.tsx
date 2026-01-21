import { Metadata } from 'next'
import Image from 'next/image'
import { Shield, Award, Users, Clock, CheckCircle2 } from 'lucide-react'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { CTASection } from '@/components/sections/cta-section'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about our team of licensed Master Electricians. Family-owned, community-focused, and committed to excellence in electrical services.',
}

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'Every job is completed to the highest safety standards. Your family\'s safety is our top priority.',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We take pride in our workmanship and stand behind every job with our satisfaction guarantee.',
  },
  {
    icon: Users,
    title: 'Customer Focus',
    description:
      'We treat every customer like family, providing honest advice and transparent pricing.',
  },
  {
    icon: Clock,
    title: 'Reliability',
    description:
      'We show up on time, every time. When you schedule with us, you can count on us being there.',
  },
]

const stats = [
  { value: '20+', label: 'Years Experience' },
  { value: '5000+', label: 'Happy Customers' },
  { value: '24/7', label: 'Emergency Service' },
  { value: '100%', label: 'Satisfaction Rate' },
]

export default async function AboutPage() {
  const config = await getSiteConfig()

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            About {config.businessName}
          </h1>
          <p className="text-xl" style={{ color: '#D1D5DB' }}>
            Your trusted local electrician committed to providing safe, reliable, and
            professional electrical services to our community.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6">Our Story</h2>
            <div className="prose-custom">
              <p>
                {config.aboutText ||
                  `Founded with a simple mission: to provide honest, reliable electrical services that homeowners and businesses can trust. As a licensed Master Electrician, we bring decades of experience and a commitment to excellence to every job we undertake.`}
              </p>
              <p>
                What started as a one-person operation has grown into a trusted name in
                {config.primaryArea}, but our core values remain the same. We believe in
                treating our customers the way we'd want to be treated—with honesty,
                respect, and fair pricing.
              </p>
              <p>
                Whether it's a simple outlet repair or a complete electrical system
                upgrade, we approach every job with the same level of care and
                professionalism. Our reputation is built on the relationships we've
                formed with our customers over the years.
              </p>
            </div>
          </div>
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary flex items-center justify-center">
              <div className="text-center text-white">
                <Shield className="h-20 w-20 mx-auto mb-4 opacity-80" />
                <p className="text-xl font-semibold">Licensed & Insured</p>
                {config.licenseNumber && (
                  <p className="text-gray-300">{config.licenseNumber}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Stats */}
      <Section background="surface">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                {stat.value}
              </div>
              <div className="text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Our Values */}
      <Section>
        <div className="text-center mb-12">
          <h2 className="mb-4">Our Values</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            These principles guide everything we do, from how we treat our customers to
            how we approach every job.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <div key={value.title} className="text-center p-6">
              <div className="w-16 h-16 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
                <value.icon className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{value.title}</h3>
              <p className="text-muted text-sm">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section background="surface">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="mb-6">Why Choose Us?</h2>
            <ul className="space-y-4">
              {[
                'Licensed Master Electrician with extensive training',
                'Fully insured for your peace of mind',
                'Upfront, transparent pricing with no surprises',
                'Clean, courteous service - we respect your home',
                'Same-day and emergency service available',
                '100% satisfaction guarantee on all work',
                'Background-checked and drug-tested technicians',
                'Locally owned and operated',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-card-lg">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Our Guarantee
            </h3>
            <p className="text-muted mb-6">
              We stand behind our work 100%. If you're not completely satisfied with our
              service, we'll make it right—that's our promise to you.
            </p>
            <div className="flex items-center gap-4 p-4 bg-accent-soft rounded-xl">
              <Award className="h-12 w-12 text-accent" />
              <div>
                <p className="font-semibold text-primary">Satisfaction Guaranteed</p>
                <p className="text-sm text-muted">Your happiness is our priority</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CTASection phone={config.phone} />
    </>
  )
}
