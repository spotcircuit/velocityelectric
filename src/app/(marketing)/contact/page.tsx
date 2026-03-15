import { Metadata } from 'next'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { formatPhoneForTel } from '@/lib/utils'
import { Section } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { BookingForm } from '@/components/forms/booking-form'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact us for a free electrical service estimate. Call now or fill out our online form. Same-day service available.',
}

async function getContactData() {
  const [services, config] = await Promise.all([
    prisma.service.findMany({
      where: { published: true },
      select: { slug: true, title: true },
      orderBy: { sortOrder: 'asc' },
    }),
    getSiteConfig(),
  ])

  return { services, config }
}

export default async function ContactPage() {
  const { services, config } = await getContactData()

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Contact Us
          </h1>
          <p className="text-xl" style={{ color: '#D1D5DB' }}>
            Ready to get started? Fill out the form below or give us a call.
            We offer free estimates and same-day service for most jobs.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <BookingForm services={services} sourcePage="/contact" />
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Phone */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent-soft rounded-xl">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Call Us</h3>
                    <a
                      href={`tel:${formatPhoneForTel(config.phone)}`}
                      className="text-lg font-medium text-accent hover:underline"
                    >
                      {config.phone}
                    </a>
                    <p className="text-sm text-muted mt-1">
                      24/7 Emergency Service Available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Email */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent-soft rounded-xl">
                    <Mail className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Email Us</h3>
                    <a
                      href={`mailto:${config.email}`}
                      className="text-accent hover:underline"
                    >
                      {config.email}
                    </a>
                    <p className="text-sm text-muted mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent-soft rounded-xl">
                    <MapPin className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Service Area</h3>
                    <p className="text-muted">{config.address}</p>
                    <p className="text-sm text-muted mt-1">
                      Serving {config.primaryArea} and surrounding areas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-accent-soft rounded-xl">
                    <Clock className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-1">Hours</h3>
                    <p className="text-muted">{config.hours}</p>
                    <p className="text-sm text-success mt-1 font-medium">
                      Emergency Service 24/7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Map */}
      <Section background="surface" padding="sm">
        <div className="bg-white rounded-2xl overflow-hidden shadow-card">
          {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
            <iframe
              className="w-full aspect-video"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(config.address)}&zoom=12`}
              allowFullScreen
            />
          ) : (
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <div className="text-center text-muted">
                <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Map integration available</p>
                <p className="text-sm">Add Google Maps API key to enable</p>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  )
}
