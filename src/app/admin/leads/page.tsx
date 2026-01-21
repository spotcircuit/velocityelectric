import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Phone, Mail, MapPin, FileText, Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminLeadsPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const leads = await getLeads()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Leads</h1>
          <p className="text-muted">Manage and track customer inquiries.</p>
        </div>
        <Badge variant="secondary">{leads.length} Total</Badge>
      </div>

      {leads.length > 0 ? (
        <div className="grid gap-4">
          {leads.map((lead: { id: string; name: string; phone: string; email: string | null; city: string | null; serviceRequested: string | null; message: string | null; sourcePage: string; createdAt: Date }) => (
            <Card key={lead.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary text-lg">
                        {lead.name}
                      </h3>
                      {lead.serviceRequested && (
                        <Badge>{lead.serviceRequested}</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-accent hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 text-muted hover:text-accent"
                        >
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
                      <p className="text-muted text-sm mt-2 bg-surface p-3 rounded-lg">
                        {lead.message}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-muted flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {lead.sourcePage}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(lead.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted">No leads yet. They will appear here when customers submit the booking form.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
