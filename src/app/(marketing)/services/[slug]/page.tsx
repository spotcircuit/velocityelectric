import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, CheckCircle2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'
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
import { BookingForm } from '@/components/forms/booking-form'
import { CTASection } from '@/components/sections/cta-section'
import type { FAQ } from '@/lib/validations'

interface Props {
  params: Promise<{ slug: string }>
}

async function getServiceData(slug: string) {
  const [service, services, config] = await Promise.all([
    prisma.service.findUnique({
      where: { slug, published: true },
    }),
    prisma.service.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { sortOrder: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { service, services, config }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { service, config } = await getServiceData(slug)

  if (!service) {
    return { title: 'Service Not Found' }
  }

  return {
    title: service.metaTitle || service.title,
    description:
      service.metaDescription ||
      `${service.excerpt} Professional ${service.title.toLowerCase()} services from ${config.businessName}.`,
  }
}

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { published: true },
    select: { slug: true },
  })

  return services.map((service) => ({
    slug: service.slug,
  }))
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const { service, services, config } = await getServiceData(slug)

  if (!service) {
    notFound()
  }

  const faqs = parseJsonSafe<FAQ[]>(service.faqsJson, [])
  const Icon = (Icons[service.iconName as keyof typeof Icons] as LucideIcon) || Icons.Zap

  // Get other services for sidebar
  const otherServices = services.filter((s) => s.slug !== service.slug)

  return (
    <>
      {/* Hero */}
      <Section className="pt-24 md:pt-32 bg-gradient-to-br from-primary to-primary-dark">
        <div className="max-w-3xl">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <Icon className="h-10 w-10 text-cyan" />
            </div>
            <h1 className="text-white">{service.title}</h1>
          </div>
          <p className="text-xl text-gray-300">{service.excerpt}</p>
        </div>
      </Section>

      {/* Main Content */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Service Content */}
          <div className="lg:col-span-2">
            <div
              className="prose-custom mb-12"
              dangerouslySetInnerHTML={{ __html: service.contentHtml }}
            />

            {/* FAQs */}
            {faqs.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-primary mb-6">
                  Frequently Asked Questions
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="bg-accent-soft border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold text-primary mb-4">
                  Get a Free Estimate
                </h3>
                <p className="text-muted text-sm mb-4">
                  Ready to get started? Call us or request a free estimate online.
                </p>
                <a href={`tel:${formatPhoneForTel(config.phone)}`}>
                  <Button variant="call" className="w-full mb-3">
                    <Phone className="h-5 w-5" />
                    {config.phone}
                  </Button>
                </a>
                <Link href="/contact">
                  <Button variant="secondary" className="w-full">
                    Request Estimate
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Why Choose Us */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-primary mb-4">Why Choose Us</h3>
                <ul className="space-y-3">
                  {[
                    'Licensed Master Electrician',
                    'Upfront Pricing',
                    'Same-Day Service',
                    '100% Satisfaction Guarantee',
                    'Clean, Courteous Service',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Other Services */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-primary mb-4">Other Services</h3>
                <ul className="space-y-2">
                  {otherServices.slice(0, 6).map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="text-sm text-muted hover:text-accent transition-colors"
                      >
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Inline Booking Form */}
      <Section background="surface">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="mb-2">Request {service.title}</h2>
            <p className="text-muted">
              Fill out the form below and we'll get back to you shortly.
            </p>
          </div>
          <BookingForm services={services} sourcePage={`/services/${service.slug}`} />
        </div>
      </Section>

      {/* CTA */}
      <CTASection phone={config.phone} />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: service.title,
            description: service.excerpt,
            provider: {
              '@type': 'LocalBusiness',
              name: config.businessName,
              telephone: config.phone,
              email: config.email,
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
