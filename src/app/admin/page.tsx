import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, FileText, MapPin, Star, Tag, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getDashboardStats() {
  const [
    leadsCount,
    leadsToday,
    servicesCount,
    areasCount,
    testimonialsCount,
    promosCount,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.service.count({ where: { published: true } }),
    prisma.serviceArea.count({ where: { published: true } }),
    prisma.testimonial.count({ where: { published: true } }),
    prisma.promo.count({ where: { published: true } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return {
    leadsCount,
    leadsToday,
    servicesCount,
    areasCount,
    testimonialsCount,
    promosCount,
    recentLeads,
  }
}

export default async function AdminDashboard() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const stats = await getDashboardStats()

  const statCards = [
    {
      title: 'Total Leads',
      value: stats.leadsCount,
      icon: Users,
      color: 'bg-accent',
      href: '/admin/leads',
    },
    {
      title: 'Leads Today',
      value: stats.leadsToday,
      icon: TrendingUp,
      color: 'bg-success',
      href: '/admin/leads',
    },
    {
      title: 'Services',
      value: stats.servicesCount,
      icon: FileText,
      color: 'bg-primary',
      href: '/admin/services',
    },
    {
      title: 'Service Areas',
      value: stats.areasCount,
      icon: MapPin,
      color: 'bg-cyan',
      href: '/admin/service-areas',
    },
    {
      title: 'Testimonials',
      value: stats.testimonialsCount,
      icon: Star,
      color: 'bg-warning',
      href: '/admin/testimonials',
    },
    {
      title: 'Active Promos',
      value: stats.promosCount,
      icon: Tag,
      color: 'bg-danger',
      href: '/admin/promos',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted">Welcome to your admin panel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted">{stat.title}</p>
                    <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Leads */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leads</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted">
                      Phone
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-4 font-medium">{lead.name}</td>
                      <td className="py-3 px-4">
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-accent hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-muted">
                        {lead.serviceRequested || '-'}
                      </td>
                      <td className="py-3 px-4 text-muted text-sm">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-8">No leads yet.</p>
          )}
          <div className="mt-4">
            <Link
              href="/admin/leads"
              className="text-accent hover:underline text-sm"
            >
              View all leads →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
