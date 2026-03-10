import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  MapPin,
  Star,
  Tag,
  Settings,
  Users,
  LogOut,
  BookOpen,
} from 'lucide-react'
import { Container } from '@/components/ui/container'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Leads', icon: Users },
  { href: '/admin/services', label: 'Services', icon: FileText },
  { href: '/admin/service-areas', label: 'Service Areas', icon: MapPin },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/promos', label: 'Promos', icon: Tag },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await checkAuth()

  // Allow login page to render without auth
  // Other pages will be protected by individual page checks

  return (
    <div className="min-h-screen bg-surface">
      {isAuthenticated && (
        <header className="bg-primary text-white sticky top-0 z-50">
          <Container>
            <div className="flex items-center justify-between h-16">
              <Link href="/admin" className="font-bold text-lg">
                Admin Panel
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {navItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="text-sm text-gray-300 hover:text-white"
                >
                  View Site
                </Link>
                <form action="/admin/logout" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-gray-300 hover:text-white flex items-center gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </Container>
        </header>
      )}

      <div className="flex">
        {isAuthenticated && (
          <aside className="hidden lg:block w-64 bg-white border-r border-border min-h-[calc(100vh-4rem)] p-4">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-muted hover:text-primary hover:bg-surface rounded-lg transition-colors"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        )}

        <main className={`flex-1 p-6 ${isAuthenticated ? 'lg:p-8' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
