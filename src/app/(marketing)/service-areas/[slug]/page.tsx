import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, CheckCircle2, ArrowRight, Shield, Clock, Star, Zap, Home, Building2 } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { parseJsonSafe, formatPhoneForTel } from '@/lib/utils'
import { Section } from '@/components/ui/section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ServiceCard } from '@/components/sections/service-card'
import { BookingForm } from '@/components/forms/booking-form'
import { CTASection } from '@/components/sections/cta-section'
import type { FAQ, ServiceHighlight } from '@/lib/validations'

interface Props {
  params: Promise<{ slug: string }>
}

async function getAreaData(slug: string) {
  const [area, services, otherAreas, config] = await Promise.all([
    prisma.serviceArea.findUnique({
      where: { slug, published: true },
    }),
    prisma.service.findMany({
      where: { published: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.serviceArea.findMany({
      where: { published: true, slug: { not: slug } },
      orderBy: { city: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { area, services, otherAreas, config }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { area, config } = await getAreaData(slug)

  if (!area) {
    return { title: 'Area Not Found' }
  }

  return {
    title: `Electrician in ${area.city}, ${area.state} | ${config.businessName}`,
    description: `Professional electrical services in ${area.city}, ${area.state}. ${config.businessName} provides repairs, installations, panel upgrades, EV chargers, and 24/7 emergency service. Call today!`,
  }
}

export async function generateStaticParams() {
  const areas = await prisma.serviceArea.findMany({
    where: { published: true },
    select: { slug: true },
  })

  return areas.map((area: { slug: string }) => ({
    slug: area.slug,
  }))
}

export default async function ServiceAreaPage({ params }: Props) {
  const { slug } = await params
  const { area, services, otherAreas, config } = await getAreaData(slug)

  if (!area) {
    notFound()
  }

  const highlights = parseJsonSafe<ServiceHighlight[]>(area.highlightsJson, [])
  const faqs = parseJsonSafe<FAQ[]>(area.faqsJson, [])

  const trustBadges = [
    { icon: Shield, title: 'Licensed & Insured', text: 'Full liability coverage' },
    { icon: Clock, title: 'Fast Response', text: 'Same-day service available' },
    { icon: Star, title: '5-Star Rated', text: 'Top-rated in the area' },
    { icon: Zap, title: '24/7 Emergency', text: 'Always here when you need us' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ backgroundColor: '#2DD4FF' }}></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl" style={{ backgroundColor: '#1E88FF' }}></div>
        </div>
        <div className="container-custom relative">
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-2 hover:opacity-80 mb-6 transition-colors text-sm"
            style={{ color: '#CBD5E1' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Service Areas
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <MapPin className="h-5 w-5" style={{ color: '#2DD4FF' }} />
                <span className="font-medium text-sm" style={{ color: '#2DD4FF' }}>Local Service Area</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
                Electrician in {area.city}
              </h1>
              <p className="text-2xl font-semibold mb-6" style={{ color: '#2DD4FF' }}>{area.state}</p>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#CBD5E1' }}>{area.intro}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="default" size="lg" asChild>
                  <a href={`tel:${formatPhoneForTel(config.phone)}`}>
                    <Phone className="h-5 w-5" />
                    Call {config.phone}
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link href="#booking-form">Get Free Estimate</Link>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <h3 className="text-primary text-xl font-bold mb-6 text-center">Why {area.city} Trusts Us</h3>
                <div className="grid grid-cols-2 gap-6">
                  {trustBadges.map((badge, i) => (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 bg-accent-soft rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <badge.icon className="h-7 w-7 text-accent" />
                      </div>
                      <h4 className="text-primary font-semibold text-sm mb-1">{badge.title}</h4>
                      <p className="text-muted text-xs">{badge.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - Mobile */}
      <section className="lg:hidden py-8 bg-surface border-b border-border">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-4">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <badge.icon className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-semibold text-sm text-primary">{badge.title}</p>
                  <p className="text-xs text-muted">{badge.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <Section className="py-16 md:py-20">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
              Local Expertise
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why {area.city} Residents Choose Us</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              We've built our reputation in {area.city} through quality work and exceptional customer service.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <Card key={index} className="group hover:shadow-xl transition-shadow border-0 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-soft to-cyan-soft rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{highlight.title}</h3>
                  <p className="text-muted leading-relaxed">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* About Our Service in This Area */}
      <Section background="surface" className="py-16 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
              About Our Service
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Your Trusted Electrician in {area.city}, {area.state}
            </h2>
            <p className="text-lg text-muted mb-6 leading-relaxed">
              {config.businessName} has been serving {area.city} and the surrounding Northern Virginia area for over 20 years.
              Our team of licensed electricians understands the unique electrical needs of {area.city} homes and businesses.
            </p>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              Whether you need a simple repair, a panel upgrade, EV charger installation, or emergency electrical service,
              we're here to help. We take pride in providing honest, reliable service with upfront pricing and quality workmanship.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Home className="h-6 w-6 text-accent" />
                <span className="font-medium text-primary">Residential Service</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-accent" />
                <span className="font-medium text-primary">Commercial Service</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 text-accent" />
                <span className="font-medium text-primary">Emergency Service</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-accent" />
                <span className="font-medium text-primary">Fully Insured</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
            <h3 className="text-xl font-bold text-primary mb-6">Contact Us in {area.city}</h3>
            <div className="space-y-4">
              <a
                href={`tel:${formatPhoneForTel(config.phone)}`}
                className="flex items-center gap-4 p-4 bg-success/10 rounded-xl hover:bg-success/20 transition-colors"
              >
                <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted">Call Now</p>
                  <p className="text-xl font-bold text-primary">{config.phone}</p>
                </div>
              </a>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl">
                <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted">Serving</p>
                  <p className="font-bold text-primary">{area.city}, {area.state} & Surrounding Areas</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-surface rounded-xl">
                <div className="w-12 h-12 bg-cyan rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted">Hours</p>
                  <p className="font-bold text-primary">{config.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Services Available */}
      <Section className="py-16 md:py-20">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
            Our Services
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Electrical Services in {area.city}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            We offer comprehensive electrical services for homes and businesses in {area.city}.
            Click on any service to learn more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 8).map((service: { id: string; slug: string; title: string; excerpt: string; iconName: string }) => (
            <ServiceCard
              key={service.id}
              slug={service.slug}
              title={service.title}
              excerpt={service.excerpt}
              iconName={service.iconName}
            />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/services">
            <Button variant="outline" size="lg">
              View All Services
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </Section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <Section background="surface" className="py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
                FAQ
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Common Questions About Electrical Service in {area.city}
              </h2>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="border-b border-border last:border-0">
                    <AccordionTrigger className="text-left text-primary font-semibold py-5 hover:text-accent">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted pb-5 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </Section>
      )}

      {/* Request Service */}
      <Section className="py-16 md:py-20" id="booking-form">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
              Free Estimate
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Request Service in {area.city}</h2>
            <p className="text-lg text-muted">
              Fill out the form below for a free estimate on electrical services in {area.city}.
              We'll get back to you within 24 hours.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
            <BookingForm
              services={services.map((s: { slug: string; title: string }) => ({ slug: s.slug, title: s.title }))}
              sourcePage={`/service-areas/${area.slug}`}
            />
          </div>
        </div>
      </Section>

      {/* Other Service Areas */}
      {otherAreas.length > 0 && (
        <Section background="surface" className="py-16 md:py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Other Areas We Serve</h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              In addition to {area.city}, we provide electrical services throughout Northern Virginia.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {otherAreas.map((otherArea: { id: string; slug: string; city: string; state: string }) => (
              <Link
                key={otherArea.id}
                href={`/service-areas/${otherArea.slug}`}
                className="group rounded-xl p-4 text-center hover:shadow-lg transition-all"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E8F0' }}
              >
                <MapPin className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: '#1E88FF' }} />
                <p className="font-semibold transition-colors" style={{ color: '#0B1F3B' }}>{otherArea.city}</p>
                <p className="text-xs" style={{ color: '#5B6677' }}>{otherArea.state}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/service-areas" className="font-semibold hover:underline" style={{ color: '#1E88FF' }}>
              View All Service Areas →
            </Link>
          </div>
        </Section>
      )}

      {/* CTA */}
      <CTASection
        phone={config.phone}
        title={`Need an Electrician in ${area.city}?`}
        description={`Contact ${config.businessName} today for reliable electrical service in ${area.city} and surrounding areas. Licensed, insured, and ready to help!`}
      />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/service-areas/${area.slug}`,
            name: config.businessName,
            description: area.intro,
            telephone: config.phone,
            email: config.email,
            address: {
              '@type': 'PostalAddress',
              streetAddress: config.address,
              addressLocality: area.city,
              addressRegion: area.state,
            },
            areaServed: {
              '@type': 'City',
              name: area.city,
            },
            ...(faqs.length > 0 && {
              mainEntity: {
                '@type': 'FAQPage',
                mainEntity: faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                  },
                })),
              },
            }),
          }),
        }}
      />
    </>
  )
}
