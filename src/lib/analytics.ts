'use client'

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer: unknown[]
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

export const pageview = (url: string) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  })
}

type EventName = 'click_to_call' | 'submit_lead' | 'click_book' | 'view_service' | 'view_area'

interface EventParams {
  category?: string
  label?: string
  value?: number
  [key: string]: unknown
}

export const trackEvent = (eventName: EventName, params?: EventParams) => {
  if (!GA_TRACKING_ID || typeof window === 'undefined') return

  window.gtag('event', eventName, {
    ...params,
  })
}

// Convenience functions for common events
export const trackCallClick = (source: string) => {
  trackEvent('click_to_call', {
    category: 'engagement',
    label: source,
  })
}

export const trackBookClick = (source: string) => {
  trackEvent('click_book', {
    category: 'engagement',
    label: source,
  })
}

export const trackLeadSubmit = (service?: string) => {
  trackEvent('submit_lead', {
    category: 'conversion',
    label: service || 'general',
    value: 1,
  })
}

export const trackServiceView = (serviceSlug: string) => {
  trackEvent('view_service', {
    category: 'engagement',
    label: serviceSlug,
  })
}

export const trackAreaView = (areaSlug: string) => {
  trackEvent('view_area', {
    category: 'engagement',
    label: areaSlug,
  })
}
