'use client'

import Link from 'next/link'
import { Phone, Star, Shield, Clock, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { formatPhoneForTel } from '@/lib/utils'
import { trackCallClick, trackBookClick } from '@/lib/analytics'

interface HeroProps {
  businessName: string
  phone: string
  tagline: string
  licenseNumber?: string
}

export function Hero({ businessName, phone, tagline, licenseNumber }: HeroProps) {
  const handleCallClick = () => {
    trackCallClick('hero')
  }

  const handleBookClick = () => {
    trackBookClick('hero')
  }

  return (
    <section className="relative bg-gradient-to-br from-primary via-primary to-primary-dark pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Container className="relative">
        <div className="max-w-4xl">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-cyan-soft text-cyan border-0">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Licensed & Insured
            </Badge>
            <Badge className="bg-cyan-soft text-cyan border-0">
              <Clock className="h-3.5 w-3.5 mr-1" />
              Same-Day Service
            </Badge>
            {licenseNumber && (
              <Badge className="bg-cyan-soft text-cyan border-0">
                Master Electrician
              </Badge>
            )}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
            {tagline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
            Professional electrical services for your home and business.
            Fast, reliable, and backed by our satisfaction guarantee.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <a
              href={`tel:${formatPhoneForTel(phone)}`}
              onClick={handleCallClick}
            >
              <Button variant="call" size="lg" className="w-full sm:w-auto">
                <Phone className="h-5 w-5" />
                Call {phone}
              </Button>
            </a>
            <Link href="/contact" onClick={handleBookClick}>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100"
              >
                Request Free Estimate
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-white">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-yellow-400 text-yellow-400"
                />
              ))}
              <span className="ml-2 font-semibold">5.0</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <span>|</span>
              <span>500+ 5-Star Reviews</span>
            </div>
          </div>

          {/* Trust Points */}
          <div className="mt-8 pt-8 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-cyan flex-shrink-0" />
              <span className="text-sm">Upfront Pricing - No Surprises</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-cyan flex-shrink-0" />
              <span className="text-sm">Background Checked Technicians</span>
            </div>
            <div className="flex items-center gap-3 text-white">
              <CheckCircle2 className="h-6 w-6 text-cyan flex-shrink-0" />
              <span className="text-sm">100% Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
