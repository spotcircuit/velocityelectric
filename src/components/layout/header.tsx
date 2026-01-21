'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn, formatPhoneForTel } from '@/lib/utils'
import { trackCallClick, trackBookClick } from '@/lib/analytics'

interface HeaderProps {
  businessName: string
  phone: string
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/service-areas', label: 'Service Areas' },
  { href: '/about', label: 'About' },
  { href: '/reviews', label: 'Reviews' },
  { href: '/specials', label: 'Specials' },
  { href: '/contact', label: 'Contact' },
]

export function Header({ businessName, phone }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCallClick = () => {
    trackCallClick('header')
  }

  const handleBookClick = () => {
    trackBookClick('header')
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-md'
          : 'bg-white'
      )}
    >
      <Container>
        <div className="flex h-24 md:h-32 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.jpg"
              alt={businessName}
              width={400}
              height={120}
              className="h-24 w-auto md:h-32"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-desktop"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={`tel:${formatPhoneForTel(phone)}`}
              onClick={handleCallClick}
              className="hidden sm:flex"
            >
              <Button variant="call" size="sm" className="gap-1.5">
                <Phone className="h-4 w-4" />
                <span className="hidden md:inline">{phone}</span>
                <span className="md:hidden">Call</span>
              </Button>
            </a>

            <Link href="/contact" onClick={handleBookClick}>
              <Button size="sm">Request Service</Button>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 -mr-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-primary" />
              ) : (
                <Menu className="h-6 w-6 text-primary" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300',
          isMenuOpen ? 'max-h-screen' : 'max-h-0'
        )}
        style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E3E8F0' }}
      >
        <Container>
          <nav className="py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link-mobile"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="nav-link-bullet"></span>
                {link.label}
              </Link>
            ))}
            <div className="pt-4 mt-2" style={{ borderTop: '1px solid #E3E8F0' }}>
              <a
                href={`tel:${formatPhoneForTel(phone)}`}
                onClick={handleCallClick}
                className="block"
              >
                <Button variant="call" className="w-full">
                  <Phone className="h-5 w-5" />
                  Call {phone}
                </Button>
              </a>
            </div>
          </nav>
        </Container>
      </div>
    </header>
  )
}
