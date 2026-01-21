'use client'

import { Phone, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatPhoneForTel } from '@/lib/utils'
import { trackCallClick, trackBookClick } from '@/lib/analytics'

interface MobileStickyBarProps {
  phone: string
}

export function MobileStickyBar({ phone }: MobileStickyBarProps) {
  const handleCallClick = () => {
    trackCallClick('mobile_sticky_bar')
  }

  const handleBookClick = () => {
    trackBookClick('mobile_sticky_bar')
  }

  const scrollToForm = () => {
    handleBookClick()
    const form = document.getElementById('booking-form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.href = '/contact'
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-border shadow-lg safe-area-inset-bottom">
      <div className="flex items-stretch">
        <a
          href={`tel:${formatPhoneForTel(phone)}`}
          onClick={handleCallClick}
          className="flex-1"
        >
          <Button
            variant="call"
            className="w-full h-14 rounded-none gap-2 text-base"
          >
            <Phone className="h-5 w-5" />
            Call Now
          </Button>
        </a>
        <button onClick={scrollToForm} className="flex-1">
          <Button className="w-full h-14 rounded-none gap-2 text-base">
            <Calendar className="h-5 w-5" />
            Book Online
          </Button>
        </button>
      </div>
    </div>
  )
}
