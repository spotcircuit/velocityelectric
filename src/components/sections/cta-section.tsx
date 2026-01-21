'use client'

import Link from 'next/link'
import { Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Section } from '@/components/ui/section'
import { formatPhoneForTel } from '@/lib/utils'
import { trackCallClick, trackBookClick } from '@/lib/analytics'

interface CTASectionProps {
  phone: string
  title?: string
  description?: string
}

export function CTASection({
  phone,
  title = 'Ready to Get Started?',
  description = 'Contact us today for a free estimate. Our team is ready to help with all your electrical needs.',
}: CTASectionProps) {
  const handleCallClick = () => {
    trackCallClick('cta_section')
  }

  const handleBookClick = () => {
    trackBookClick('cta_section')
  }

  return (
    <Section background="primary">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-white mb-4">{title}</h2>
        <p className="text-gray-300 text-lg mb-8">{description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`tel:${formatPhoneForTel(phone)}`}
            onClick={handleCallClick}
          >
            <Button variant="call" size="lg">
              <Phone className="h-5 w-5" />
              Call {phone}
            </Button>
          </a>
          <Link href="/contact" onClick={handleBookClick}>
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Request Free Estimate
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  )
}
