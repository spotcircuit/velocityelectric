import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Velocity Electric | Master Electrician Services',
    template: '%s | Velocity Electric',
  },
  description:
    'Professional electrical services for residential and commercial properties. Licensed Master Electrician offering repairs, installations, panel upgrades, EV chargers, and 24/7 emergency service.',
  keywords: [
    'electrician',
    'electrical contractor',
    'electrical repairs',
    'panel upgrades',
    'EV charger installation',
    'lighting installation',
    'fire safety',
    'commercial electrician',
  ],
  authors: [{ name: 'Velocity Electric' }],
  creator: 'Velocity Electric',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Velocity Electric',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-bg font-sans antialiased">
        {GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '${GA_TRACKING_ID}', {page_path: window.location.pathname});`,
              }}
            />
          </>
        )}
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
