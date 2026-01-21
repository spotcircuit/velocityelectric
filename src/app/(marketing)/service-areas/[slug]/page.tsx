import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Phone, CheckCircle2, ArrowRight } from 'lucide-react'
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
      take: 6,
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
    title: `Electrician in ${area.city}, ${area.state}`,
    description: `Professional electrical services in ${area.city}, ${area.state}. ${config.businessName} provides repairs, installations, and 24/7 emergency service.`,
  }
}

export async function generateStaticParams() {
  const areas = await prisma.serviceArea.findMany({
    where: { published: true },
    select: { slug: true },
  })

  return areas.map((area) => ({
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

  return (
    <>
      {/* Hero */}
      <Section className="pt-24 md:pt-32 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-3xl">
          <Link
            href="/service-areas"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Service Areas
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <MapPin className="h-10 w-10 text-cyan" />
            </div>
            <div>
              <h1 className="text-white">Electrician in {area.city}</h1>
              <p className="text-gray-300 text-lg">{area.state}</p>
            </div>
          </div>
          <p className="text-xl text-gray-300">{area.intro}</p>
        </div>
      </Section>

      {/* Highlights */}
      {highlights.length > 0 && (
        <Section>
          <div className="text-center mb-12">
            <h2 className="mb-4">Why {area.city} Residents Choose Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((highlight, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <CheckCircle2 className="h-8 w-8 text-success mb-4" />
                  <h3 className="font-semibold text-primary mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-muted text-sm">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Services Available */}
      <Section background="surface">
        <div className="text-center mb-12">
          <h2 className="mb-4">Services Available in {area.city}</h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Our licensed electricians provide comprehensive electrical services
            to homes and businesses in {area.city}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 8).map((service) => (
            <ServiceCard
              key={service.id}
              slug={service.slug}
              title={service.title}
              excerpt={service.excerpt}
              iconName={service.iconName}
            />
          ))}
        </div>
      </Section>

      {/* FAQs */}
      {faqs.length > 0 && (
        <Section>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-center mb-8">
              Frequently Asked Questions About Electrical Services in {area.city}
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>
      )}

      {/* Request Service */}
      <Section background="surface">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="mb-2">Request Service in {area.city}</h2>
            <p className="text-muted">
              Fill out the form below for a free estimate on electrical services
              in {area.city}.
            </p>
          </div>
          <BookingForm
            services={services.map((s) => ({ slug: s.slug, title: s.title }))}
            sourcePage={`/service-areas/${area.slug}`}
          />
        </div>
      </Section>

      {/* Other Service Areas */}
      {otherAreas.length > 0 && (
        <Section>
          <div className="text-center mb-8">
            <h2 className="mb-4">Other Areas We Serve</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {otherAreas.map((otherArea) => (
              <Link
                key={otherArea.id}
                href={`/service-areas/${otherArea.slug}`}
                className="px-4 py-2 bg-surface rounded-full text-sm font-medium text-primary hover:bg-accent hover:text-white transition-colors"
              >
                {otherArea.city}
              </Link>
            ))}
            <Link
              href="/service-areas"
              className="px-4 py-2 bg-accent text-white rounded-full text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>
      )}

      {/* CTA */}
      <CTASection
        phone={config.phone}
        title={`Need an Electrician in ${area.city}?`}
        description={`Contact ${config.businessName} today for reliable electrical service in ${area.city} and surrounding areas.`}
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
