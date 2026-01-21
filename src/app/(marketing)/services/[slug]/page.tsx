import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, CheckCircle2, Shield, Clock, Award, Star, Zap, MapPin } from 'lucide-react'
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
  const [service, services, serviceAreas, config] = await Promise.all([
    prisma.service.findUnique({
      where: { slug, published: true },
    }),
    prisma.service.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.serviceArea.findMany({
      where: { published: true },
      select: { slug: true, city: true, state: true },
      orderBy: { city: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { service, services, serviceAreas, config }
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

  return services.map((service: { slug: string }) => ({
    slug: service.slug,
  }))
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const { service, services, serviceAreas, config } = await getServiceData(slug)

  if (!service) {
    notFound()
  }

  const faqs = parseJsonSafe<FAQ[]>(service.faqsJson, [])
  const Icon = (Icons[service.iconName as keyof typeof Icons] as LucideIcon) || Icons.Zap
  const otherServices = services.filter((s: { slug: string; title: string }) => s.slug !== service.slug)

  const benefits = [
    { icon: Shield, title: 'Licensed & Insured', text: 'Full protection for your home and family' },
    { icon: Clock, title: 'Same-Day Service', text: 'Fast response when you need us most' },
    { icon: Award, title: 'Quality Guaranteed', text: '100% satisfaction on every job' },
    { icon: Star, title: '5-Star Rated', text: 'Trusted by hundreds of customers' },
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
            href="/services"
            className="inline-flex items-center gap-2 mb-6 transition-colors text-sm hover:opacity-80"
            style={{ color: '#CBD5E1' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to All Services
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <Icon className="h-5 w-5" style={{ color: '#2DD4FF' }} />
                <span className="font-medium text-sm" style={{ color: '#2DD4FF' }}>Professional Service</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#FFFFFF' }}>{service.title}</h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: '#CBD5E1' }}>{service.excerpt}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`tel:${formatPhoneForTel(config.phone)}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1E88FF', color: '#FFFFFF' }}
                >
                  <Phone className="h-5 w-5" />
                  Call {config.phone}
                </a>
                <Link
                  href="#booking-form"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-lg transition-all hover:opacity-90"
                  style={{ backgroundColor: '#FFFFFF', color: '#0B1F3B' }}
                >
                  Get Free Estimate
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: '#FFFFFF' }}>
                <h3 className="text-xl font-bold mb-6 text-center" style={{ color: '#0B1F3B' }}>Why Choose Us</h3>
                <div className="grid grid-cols-2 gap-6">
                  {benefits.map((benefit, i) => (
                    <div key={i} className="text-center">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#EAF3FF' }}>
                        <benefit.icon className="h-7 w-7" style={{ color: '#1E88FF' }} />
                      </div>
                      <h4 className="font-semibold text-sm mb-1" style={{ color: '#0B1F3B' }}>{benefit.title}</h4>
                      <p className="text-xs" style={{ color: '#5B6677' }}>{benefit.text}</p>
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
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                <benefit.icon className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-semibold text-sm text-primary">{benefit.title}</p>
                  <p className="text-xs text-muted">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Section className="py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Service Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-border mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6">About This Service</h2>
              <div
                className="prose-custom prose prose-lg max-w-none
                  prose-headings:text-primary prose-headings:font-semibold
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-muted prose-p:leading-relaxed
                  prose-li:text-muted prose-li:leading-relaxed
                  prose-ul:my-4 prose-ul:space-y-2
                  prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-primary"
                dangerouslySetInnerHTML={{ __html: service.contentHtml }}
              />
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-gradient-to-br from-accent-soft to-cyan-soft rounded-2xl p-8 md:p-10 mb-10">
              <h2 className="text-2xl font-bold text-primary mb-6">Why Choose {config.businessName}?</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Licensed Master Electrician with 20+ years experience',
                  'Upfront, transparent pricing - no surprises',
                  'Same-day and emergency service available',
                  '100% satisfaction guarantee on all work',
                  'Clean, courteous, and respectful service',
                  'Full warranty on parts and labor',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-primary font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-border">
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Frequently Asked Questions
                </h2>
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
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="bg-primary text-white border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-cyan" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Get Started Today</h3>
                    <p className="text-gray-300 text-sm">Free estimates available</p>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-5">
                  Call now for fast, reliable {service.title.toLowerCase()} service.
                </p>
                <a href={`tel:${formatPhoneForTel(config.phone)}`}>
                  <Button variant="call" className="w-full mb-3 text-lg py-6">
                    <Phone className="h-5 w-5" />
                    {config.phone}
                  </Button>
                </a>
                <Link href="#booking-form">
                  <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-primary">
                    Request Online Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Service Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Service Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Monday - Friday</span>
                    <span className="font-medium text-primary">7AM - 6PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Saturday</span>
                    <span className="font-medium text-primary">8AM - 4PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Sunday</span>
                    <span className="font-medium text-primary">Emergency Only</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-success">
                    <Zap className="h-5 w-5" />
                    <span className="font-semibold text-sm">24/7 Emergency Service Available</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Services */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-primary mb-4">Related Services</h3>
                <ul className="space-y-3">
                  {otherServices.slice(0, 6).map((s: { slug: string; title: string }) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="flex items-center gap-2 text-muted hover:text-accent transition-colors group"
                      >
                        <CheckCircle2 className="h-4 w-4 text-border group-hover:text-accent transition-colors" />
                        <span className="text-sm">{s.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href="/services" className="block mt-4 text-accent font-semibold text-sm hover:underline">
                  View All Services →
                </Link>
              </CardContent>
            </Card>

            {/* Service Areas - Sidebar */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  Areas We Serve
                </h3>
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.slice(0, 8).map((area: { slug: string; city: string }) => (
                    <Link
                      key={area.slug}
                      href={`/service-areas/${area.slug}`}
                      className="city-link-pill text-xs"
                    >
                      {area.city}
                    </Link>
                  ))}
                </div>
                <Link href="/service-areas" className="block mt-4 text-accent font-semibold text-sm hover:underline">
                  View All Service Areas →
                </Link>
              </CardContent>
            </Card>

            {/* License Info */}
            <Card className="bg-surface border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-10 w-10 text-success" />
                  <div>
                    <p className="font-bold text-primary">Licensed & Insured</p>
                    <p className="text-sm text-muted">{config.licenseNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Inline Booking Form */}
      <Section background="surface" className="py-16 md:py-24" id="booking-form">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1 bg-accent-soft text-accent font-semibold text-sm rounded-full mb-4">
              Free Estimate
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Request {service.title}</h2>
            <p className="text-lg text-muted">
              Fill out the form below and we'll contact you within 24 hours with a free estimate.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-border">
            <BookingForm services={services} sourcePage={`/services/${service.slug}`} />
          </div>
        </div>
      </Section>

      {/* Service Areas */}
      <Section className="py-16 md:py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {service.title} in Northern Virginia
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            We provide professional {service.title.toLowerCase()} services throughout Northern Virginia.
            Click on your city to learn more about our local services.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {serviceAreas.map((area: { slug: string; city: string; state: string }) => (
            <Link
              key={area.slug}
              href={`/service-areas/${area.slug}`}
              className="group rounded-xl p-4 text-center hover:shadow-lg transition-all"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E3E8F0' }}
            >
              <MapPin className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" style={{ color: '#1E88FF' }} />
              <p className="font-semibold transition-colors" style={{ color: '#0B1F3B' }}>{area.city}</p>
              <p className="text-xs" style={{ color: '#5B6677' }}>{area.state}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/service-areas" className="font-semibold hover:underline" style={{ color: '#1E88FF' }}>
            View All Service Areas →
          </Link>
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
                mainEntity: faqs.map((faq: FAQ) => ({
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
