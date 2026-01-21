import { Metadata } from 'next'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using our electrical services.',
}

export default async function TermsPage() {
  const config = await getSiteConfig()

  return (
    <Section className="pt-24 md:pt-32">
      <div className="max-w-3xl mx-auto prose-custom">
        <h1>Terms of Service</h1>
        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Services</h2>
        <p>
          {config.businessName} provides residential and commercial electrical services.
          All work is performed by licensed electricians and complies with local electrical
          codes and regulations.
        </p>

        <h2>Estimates and Pricing</h2>
        <p>
          We provide written estimates before beginning work. Estimates are valid for 30 days
          unless otherwise noted. Final pricing may vary if additional work is needed beyond
          the original scope.
        </p>

        <h2>Payment Terms</h2>
        <p>
          Payment is due upon completion of work unless other arrangements have been made.
          We accept cash, check, and major credit cards.
        </p>

        <h2>Warranty</h2>
        <p>
          We offer a workmanship warranty on all electrical work performed. Warranty terms
          vary by service type. Product warranties are provided by the manufacturer.
        </p>

        <h2>Cancellation</h2>
        <p>
          Please provide at least 24 hours notice if you need to cancel or reschedule an
          appointment. Same-day cancellations may be subject to a trip fee.
        </p>

        <h2>Liability</h2>
        <p>
          We are fully licensed and insured. Our liability is limited to the cost of the
          services provided.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Contact us at{' '}
          <a href={`mailto:${config.email}`}>{config.email}</a>.
        </p>
      </div>
    </Section>
  )
}
