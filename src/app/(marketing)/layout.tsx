import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileStickyBar } from '@/components/layout/mobile-sticky-bar'
import { EmergencyBanner } from '@/components/sections/emergency-banner'
import { getSiteConfig } from '@/lib/config'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const config = await getSiteConfig()

  return (
    <>
      {config.emergencyEnabled && (
        <EmergencyBanner phone={config.phone} enabled={config.emergencyEnabled} />
      )}
      <Header businessName={config.businessName} phone={config.phone} />
      <main id="main-content" className="pb-20 lg:pb-0">
        {children}
      </main>
      <Footer
        businessName={config.businessName}
        phone={config.phone}
        email={config.email}
        address={config.address}
        hours={config.hours}
        licenseNumber={config.licenseNumber}
      />
      <MobileStickyBar phone={config.phone} />
    </>
  )
}
