import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toggleServicePublished, deleteService } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getServices() {
  return prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function AdminServicesPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const services = await getServices()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Services</h1>
          <p className="text-muted">Manage your electrical services.</p>
        </div>
        <Link href="/admin/services/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        </Link>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center text-sm text-muted bg-surface px-3 py-1 rounded">
                      #{service.sortOrder}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-primary">
                          {service.title}
                        </h3>
                        <Badge variant={service.published ? 'success' : 'secondary'}>
                          {service.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">{service.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleServicePublished}>
                      <input type="hidden" name="id" value={service.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        {service.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                    <Link href={`/admin/services/${service.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted mb-4">No services yet.</p>
            <Link href="/admin/services/new">
              <Button>Add Your First Service</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
