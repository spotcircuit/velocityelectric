import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users, FileText, MapPin, Star, Tag, TrendingUp,
  BellRing, BellOff, AlertTriangle, MailCheck, MailX, Mail, Building2,
} from 'lucide-react'
import { LeadCategory } from '@prisma/client'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

const CATEGORY_STYLES: Record<string, { label: string; cls: string }> = {
  RESIDENTIAL:  { label: 'Residential',   cls: 'text-blue-700 bg-blue-50' },
  COMMERCIAL:   { label: 'Commercial',    cls: 'text-emerald-700 bg-emerald-50' },
  OUT_OF_SCOPE: { label: 'Out of scope',  cls: 'text-amber-700 bg-amber-50' },
  VENDOR:       { label: 'Vendor',        cls: 'text-gray-700 bg-gray-100' },
  SPAM:         { label: 'Spam',          cls: 'text-red-700 bg-red-50' },
  TEST:         { label: 'Test',          cls: 'text-purple-700 bg-purple-50' },
}

async function getDashboardStats() {
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0))
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - 7)
  const fixDate = new Date('2026-04-21T19:25:00Z') // when the email-fix deploy went live

  const [
    leadsCount,
    leadsToday,
    leadsThisWeek,
    qualifiedThisWeek,
    notNotifiedSinceFix,
    sendErrorsSinceFix,
    deliveredThisWeek,
    commercialLeadsCount,
    servicesCount,
    areasCount,
    testimonialsCount,
    promosCount,
    recentLeads,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.lead.count({
      where: {
        createdAt: { gte: weekStart },
        qualification: { in: [LeadCategory.RESIDENTIAL, LeadCategory.COMMERCIAL] },
      },
    }),
    prisma.lead.count({
      where: {
        createdAt: { gte: fixDate },
        ownerNotifiedAt: null,
        NOT: { qualification: { in: [LeadCategory.SPAM, LeadCategory.TEST, LeadCategory.VENDOR] } },
      },
    }),
    prisma.lead.count({
      where: {
        createdAt: { gte: fixDate },
        ownerNotifyError: { not: null },
        ownerNotifiedAt: null,
      },
    }),
    prisma.lead.count({
      where: { createdAt: { gte: weekStart }, ownerNotifyDeliveredAt: { not: null } },
    }),
    prisma.lead.count({ where: { qualification: 'COMMERCIAL' } }),
    prisma.service.count({ where: { published: true } }),
    prisma.serviceArea.count({ where: { published: true } }),
    prisma.testimonial.count({ where: { published: true } }),
    prisma.promo.count({ where: { published: true } }),
    prisma.lead.findMany({
      // Hide TEST/SPAM/VENDOR from the dashboard's "recent" view — Josh shouldn't
      // see test rows muddying his daily glance. They're still visible in /admin/leads.
      where: { NOT: { qualification: { in: [LeadCategory.SPAM, LeadCategory.TEST, LeadCategory.VENDOR] } } },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ])

  return {
    leadsCount, leadsToday, leadsThisWeek, qualifiedThisWeek,
    notNotifiedSinceFix, sendErrorsSinceFix, deliveredThisWeek, commercialLeadsCount,
    servicesCount, areasCount, testimonialsCount, promosCount,
    recentLeads,
  }
}

export default async function AdminDashboard() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) redirect('/admin/login')

  const stats = await getDashboardStats()

  // Operational stat cards — what Josh/operator needs to see at a glance.
  const opsCards = [
    {
      title: 'Leads today', value: stats.leadsToday, icon: TrendingUp,
      color: 'bg-success', href: '/admin/leads',
    },
    {
      title: 'This week (qualified)', value: `${stats.qualifiedThisWeek}/${stats.leadsThisWeek}`,
      icon: Users, color: 'bg-accent', href: '/admin/leads?filter=qualified',
    },
    {
      title: 'Need attention',
      value: stats.notNotifiedSinceFix + stats.sendErrorsSinceFix,
      icon: stats.sendErrorsSinceFix > 0 ? AlertTriangle : BellOff,
      color: stats.sendErrorsSinceFix > 0 ? 'bg-danger' : (stats.notNotifiedSinceFix > 0 ? 'bg-warning' : 'bg-success'),
      href: '/admin/leads?filter=not_notified',
    },
    {
      title: 'Delivered (7d)', value: stats.deliveredThisWeek, icon: MailCheck,
      color: 'bg-success', href: '/admin/leads?filter=notified',
    },
    {
      title: 'Commercial total', value: stats.commercialLeadsCount, icon: Building2,
      color: 'bg-primary', href: '/admin/leads?filter=commercial',
    },
    {
      title: 'Total leads', value: stats.leadsCount, icon: Users,
      color: 'bg-cyan', href: '/admin/leads?filter=all',
    },
  ]

  // Content stat cards — secondary; site-config CRUD areas.
  const contentCards = [
    { title: 'Services', value: stats.servicesCount, icon: FileText, color: 'bg-primary', href: '/admin/services' },
    { title: 'Service Areas', value: stats.areasCount, icon: MapPin, color: 'bg-cyan', href: '/admin/service-areas' },
    { title: 'Testimonials', value: stats.testimonialsCount, icon: Star, color: 'bg-warning', href: '/admin/testimonials' },
    { title: 'Active Promos', value: stats.promosCount, icon: Tag, color: 'bg-danger', href: '/admin/promos' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-muted">Operational view of incoming leads + delivery status.</p>
      </div>

      {stats.notNotifiedSinceFix > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3 text-sm bg-amber-50 border-l-4 border-amber-400">
            <BellOff className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>{stats.notNotifiedSinceFix}</strong>{' '}
              {stats.notNotifiedSinceFix === 1 ? 'lead has' : 'leads have'} no owner-notification email since the email-pipeline fix.{' '}
              <Link href="/admin/leads?filter=not_notified" className="text-accent underline">Review</Link>
            </span>
          </CardContent>
        </Card>
      )}
      {stats.sendErrorsSinceFix > 0 && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3 text-sm bg-red-50 border-l-4 border-red-400">
            <MailX className="h-5 w-5 text-red-600 shrink-0" />
            <span>
              <strong>{stats.sendErrorsSinceFix}</strong> Resend send errors since the fix —{' '}
              <Link href="/admin/leads?filter=errored" className="text-accent underline">investigate</Link>
            </span>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">Operations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {opsCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted truncate">{stat.title}</p>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.color} shrink-0`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm uppercase tracking-wider text-muted mb-3">Site content</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {contentCards.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-card-hover transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted truncate">{stat.title}</p>
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.color} shrink-0`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads (qualified only — test/spam/vendor hidden)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentLeads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-3 font-medium text-muted">Name</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Category</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Phone</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Email</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">City</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Service</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Notify</th>
                    <th className="text-left py-3 px-3 font-medium text-muted">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentLeads.map((lead) => {
                    const cat = lead.qualification ? CATEGORY_STYLES[lead.qualification] : null
                    return (
                      <tr key={lead.id} className="border-b border-border last:border-0 align-top">
                        <td className="py-3 px-3 font-medium">{lead.name}</td>
                        <td className="py-3 px-3">
                          {cat ? (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.cls}`}>
                              {cat.label}
                              {lead.qualificationConfidence !== null && (
                                <span className="opacity-60 ml-1">
                                  {Math.round(lead.qualificationConfidence * 100)}%
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-xs text-muted italic">unclassified</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <a href={`tel:${lead.phone}`} className="text-accent hover:underline">{lead.phone}</a>
                        </td>
                        <td className="py-3 px-3">
                          {lead.email ? (
                            <a href={`mailto:${lead.email}`} className="text-muted hover:text-accent">{lead.email}</a>
                          ) : (
                            <span className="text-muted italic">no email</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted">{lead.city || '-'}</td>
                        <td className="py-3 px-3 text-muted">{lead.serviceRequested || '-'}</td>
                        <td className="py-3 px-3">
                          {lead.ownerNotifyDeliveredAt ? (
                            <span title="Delivered" className="inline-flex items-center text-green-700">
                              <MailCheck className="h-4 w-4" />
                            </span>
                          ) : lead.ownerNotifiedAt ? (
                            <span title="Sent (delivery pending)" className="inline-flex items-center text-blue-700">
                              <Mail className="h-4 w-4" />
                            </span>
                          ) : lead.ownerNotifyError ? (
                            <span title={`Send error: ${lead.ownerNotifyError}`} className="inline-flex items-center text-red-700">
                              <MailX className="h-4 w-4" />
                            </span>
                          ) : (
                            <span title="Not notified" className="inline-flex items-center text-amber-700">
                              <BellOff className="h-4 w-4" />
                            </span>
                          )}
                          {lead.ownerNotifyClickedAt && (
                            <span title="Clicked" className="ml-1 text-purple-700">●</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-muted text-xs whitespace-nowrap">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-8">No qualified leads yet.</p>
          )}
          <div className="mt-4 flex gap-4 text-sm">
            <Link href="/admin/leads?filter=not_notified" className="text-accent hover:underline">
              Not notified →
            </Link>
            <Link href="/admin/leads?filter=qualified" className="text-accent hover:underline">
              All qualified →
            </Link>
            <Link href="/admin/leads?filter=all" className="text-muted hover:underline">
              Everything (incl. test/spam) →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
