import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Phone, Mail, MapPin, FileText, Calendar, BellOff, BellRing, AlertTriangle, MailCheck, MailX, MousePointerClick, Eye, Clock } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type FilterValue = 'all' | 'not_notified' | 'notified' | 'errored'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

function whereForFilter(filter: FilterValue) {
  if (filter === 'not_notified') return { ownerNotifiedAt: null }
  if (filter === 'notified') return { ownerNotifiedAt: { not: null } }
  if (filter === 'errored') return { ownerNotifyError: { not: null }, ownerNotifiedAt: null }
  return {}
}

async function getLeads(filter: FilterValue) {
  return prisma.lead.findMany({
    where: whereForFilter(filter),
    orderBy: { createdAt: 'desc' },
  })
}

async function getCounts() {
  const [total, notNotified, errored] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { ownerNotifiedAt: null } }),
    prisma.lead.count({ where: { ownerNotifyError: { not: null }, ownerNotifiedAt: null } }),
  ])
  return { total, notNotified, errored }
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) redirect('/admin/login')

  const params = await searchParams
  const allowed: FilterValue[] = ['all', 'not_notified', 'notified', 'errored']
  const filter: FilterValue = (allowed as string[]).includes(params.filter || '')
    ? (params.filter as FilterValue)
    : 'not_notified' // default view: things Josh hasn't been emailed about

  const [leads, counts] = await Promise.all([getLeads(filter), getCounts()])

  const tabs: Array<{ value: FilterValue; label: string; count?: number }> = [
    { value: 'not_notified', label: 'Not notified', count: counts.notNotified },
    { value: 'errored', label: 'Send errors', count: counts.errored },
    { value: 'notified', label: 'Notified' },
    { value: 'all', label: 'All', count: counts.total },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Leads</h1>
          <p className="text-muted">
            Default view shows leads where Josh has not received an owner notification email.
          </p>
        </div>
        <Badge variant="secondary">{counts.total} Total</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = t.value === filter
          return (
            <Link
              key={t.value}
              href={`/admin/leads?filter=${t.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                active
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted border-gray-300 hover:border-accent hover:text-accent'
              }`}
            >
              {t.label}
              {typeof t.count === 'number' && (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${active ? 'bg-white/20' : 'bg-gray-100 text-muted'}`}>
                  {t.count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {counts.notNotified > 0 && filter !== 'not_notified' && (
        <Card>
          <CardContent className="p-4 flex items-center gap-3 text-sm bg-amber-50 border-l-4 border-amber-400">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <span>
              <strong>{counts.notNotified}</strong>{' '}
              {counts.notNotified === 1 ? 'lead has' : 'leads have'} no owner notification on file.{' '}
              <Link href="/admin/leads?filter=not_notified" className="text-accent underline">
                Review
              </Link>
            </span>
          </CardContent>
        </Card>
      )}

      {leads.length > 0 ? (
        <div className="grid gap-4">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-primary text-lg">{lead.name}</h3>
                      {lead.serviceRequested && <Badge>{lead.serviceRequested}</Badge>}
                      {lead.ownerNotifiedAt ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                          <BellRing className="h-3 w-3" /> Notified
                        </span>
                      ) : lead.ownerNotifyError ? (
                        <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Send error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <BellOff className="h-3 w-3" /> Not notified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-accent hover:underline">
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-muted hover:text-accent">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </a>
                      )}
                      {lead.city && (
                        <span className="flex items-center gap-1 text-muted">
                          <MapPin className="h-4 w-4" />
                          {lead.city}
                        </span>
                      )}
                    </div>
                    {lead.message && (
                      <p className="text-muted text-sm mt-2 bg-surface p-3 rounded-lg">{lead.message}</p>
                    )}
                    {lead.ownerNotifyError && (
                      <p className="text-red-700 text-xs mt-2 bg-red-50 p-2 rounded font-mono break-all">
                        Notify error: {lead.ownerNotifyError}
                      </p>
                    )}
                    {(lead.ownerNotifyDeliveredAt ||
                      lead.ownerNotifyBouncedAt ||
                      lead.ownerNotifyComplainedAt ||
                      lead.ownerNotifyDelayedAt ||
                      lead.ownerNotifyOpenedAt ||
                      lead.ownerNotifyClickedAt ||
                      lead.ownerNotifyFailedAt ||
                      lead.ownerNotifySuppressedAt) && (
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        {lead.ownerNotifyDeliveredAt && (
                          <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            <MailCheck className="h-3 w-3" /> Delivered
                          </span>
                        )}
                        {lead.ownerNotifyBouncedAt && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <MailX className="h-3 w-3" /> Bounced
                          </span>
                        )}
                        {lead.ownerNotifyComplainedAt && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" /> Complained
                          </span>
                        )}
                        {lead.ownerNotifyDelayedAt && !lead.ownerNotifyDeliveredAt && (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Clock className="h-3 w-3" /> Delayed
                          </span>
                        )}
                        {lead.ownerNotifyOpenedAt && (
                          <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            <Eye className="h-3 w-3" /> Opened
                          </span>
                        )}
                        {lead.ownerNotifyClickedAt && (
                          <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                            <MousePointerClick className="h-3 w-3" /> Clicked
                          </span>
                        )}
                        {lead.ownerNotifyFailedAt && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <MailX className="h-3 w-3" /> Failed
                          </span>
                        )}
                        {lead.ownerNotifySuppressedAt && (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="h-3 w-3" /> Suppressed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted flex flex-col items-end gap-1 shrink-0">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {lead.sourcePage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(lead.createdAt).toLocaleString()}
                    </span>
                    {lead.ownerNotifiedAt && (
                      <span className="text-xs text-green-700">
                        Emailed {new Date(lead.ownerNotifiedAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted">
              {filter === 'not_notified'
                ? 'All leads have an owner notification on file. ✅'
                : filter === 'errored'
                ? 'No notification send errors. ✅'
                : 'No leads to display.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
