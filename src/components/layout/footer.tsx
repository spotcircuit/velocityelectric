import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Shield, Award } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { formatPhoneForTel } from '@/lib/utils'

interface FooterProps {
  businessName: string
  phone: string
  email: string
  address: string
  hours: string
  licenseNumber: string
}

const serviceLinks = [
  { href: '/services/electrical-repairs-troubleshooting', label: 'Electrical Repairs' },
  { href: '/services/panel-upgrades-breakers', label: 'Panel Upgrades' },
  { href: '/services/lighting-ceiling-fans', label: 'Lighting Installation' },
  { href: '/services/ev-charger-installation', label: 'EV Charger Installation' },
  { href: '/services/surge-protection', label: 'Surge Protection' },
  { href: '/services/generator-transfer-switches', label: 'Generators' },
  { href: '/services/fire-safety', label: 'Fire Safety' },
  { href: '/services/commercial-electrical', label: 'Commercial' },
]

const quickLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/blog', label: 'Blog' },
  { href: '/specials', label: 'Specials & Coupons' },
  { href: '/service-areas', label: 'Service Areas' },
  { href: '/contact', label: 'Contact Us' },
]

export function Footer({
  businessName,
  phone,
  email,
  address,
  hours,
  licenseNumber,
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white">
      {/* Main Footer */}
      <div className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/brand/logo.svg"
                  alt={businessName}
                  width={48}
                  height={48}
                  className="h-12 w-auto brightness-0 invert"
                />
                <span className="font-bold text-xl">{businessName}</span>
              </Link>
              <p className="text-gray-300 text-sm">
                Your trusted Master Electrician for residential and commercial
                electrical services. Licensed, insured, and committed to
                excellence.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-5 w-5 text-cyan" />
                <span>Licensed & Insured</span>
              </div>
              {licenseNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-5 w-5 text-cyan" />
                  <span>{licenseNumber}</span>
                </div>
              )}
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Our Services</h3>
              <ul className="space-y-2">
                {serviceLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-footer text-sm hover:text-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-footer text-sm hover:text-cyan"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info (NAP) */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href={`tel:${formatPhoneForTel(phone)}`}
                    className="flex items-start gap-3 text-sm hover:text-cyan transition-colors"
                  >
                    <Phone className="h-5 w-5 flex-shrink-0 mt-0.5 text-cyan" />
                    <span>{phone}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="flex items-start gap-3 text-sm hover:text-cyan transition-colors"
                  >
                    <Mail className="h-5 w-5 flex-shrink-0 mt-0.5 text-cyan" />
                    <span>{email}</span>
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-cyan" />
                  <span>{address}</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <Clock className="h-5 w-5 flex-shrink-0 mt-0.5 text-cyan" />
                  <span>{hours}</span>
                </li>
              </ul>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              &copy; {currentYear} {businessName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  )
}
