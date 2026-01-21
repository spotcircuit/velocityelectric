import { Metadata } from 'next'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our privacy policy explains how we collect, use, and protect your information.',
}

export default async function PrivacyPage() {
  const config = await getSiteConfig()

  return (
    <Section className="pt-24 md:pt-32">
      <div className="max-w-3xl mx-auto prose-custom">
        <h1>Privacy Policy</h1>
        <p className="text-muted">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Information We Collect</h2>
        <p>
          When you contact us through our website, we collect the information you provide,
          including your name, phone number, email address (if provided), and details about
          your service request.
        </p>

        <h2>How We Use Your Information</h2>
        <p>We use the information you provide to:</p>
        <ul>
          <li>Respond to your service requests</li>
          <li>Schedule and perform electrical services</li>
          <li>Send you information about your service</li>
          <li>Improve our services</li>
        </ul>

        <h2>Information Sharing</h2>
        <p>
          We do not sell or share your personal information with third parties for marketing
          purposes. We may share information with service providers who help us operate our
          business (such as email services).
        </p>

        <h2>Data Security</h2>
        <p>
          We take reasonable measures to protect your information from unauthorized access
          or disclosure.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy, please contact us at{' '}
          <a href={`mailto:${config.email}`}>{config.email}</a>.
        </p>
      </div>
    </Section>
  )
}
