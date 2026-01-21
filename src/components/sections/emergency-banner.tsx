'use client'

import { AlertTriangle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { formatPhoneForTel } from '@/lib/utils'
import { trackCallClick } from '@/lib/analytics'

interface EmergencyBannerProps {
  phone: string
  enabled: boolean
}

export function EmergencyBanner({ phone, enabled }: EmergencyBannerProps) {
  if (!enabled) return null

  const handleCallClick = () => {
    trackCallClick('emergency_banner')
  }

  return (
    <div className="bg-gradient-to-r from-danger to-red-600 text-white py-3">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            <span className="font-semibold">24/7 Emergency Service Available</span>
          </div>
          <a
            href={`tel:${formatPhoneForTel(phone)}`}
            onClick={handleCallClick}
          >
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-danger border-white hover:bg-gray-100 hover:text-danger"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </Button>
          </a>
        </div>
      </Container>
    </div>
  )
}
