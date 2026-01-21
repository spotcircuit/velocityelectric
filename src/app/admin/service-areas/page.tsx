import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toggleServiceAreaPublished } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getServiceAreas() {
  return prisma.serviceArea.findMany({
    orderBy: { city: 'asc' },
  })
}

export default async function AdminServiceAreasPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const areas = await getServiceAreas()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Service Areas</h1>
          <p className="text-muted">Manage your service area pages.</p>
        </div>
        <Link href="/admin/service-areas/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Area
          </Button>
        </Link>
      </div>

      {areas.length > 0 ? (
        <div className="grid gap-4">
          {areas.map((area: { id: string; city: string; state: string; slug: string; published: boolean }) => (
            <Card key={area.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-primary">
                        {area.city}, {area.state}
                      </h3>
                      <Badge variant={area.published ? 'success' : 'secondary'}>
                        {area.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted">{area.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleServiceAreaPublished}>
                      <input type="hidden" name="id" value={area.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        {area.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                    <Link href={`/admin/service-areas/${area.id}`}>
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
            <p className="text-muted mb-4">No service areas yet.</p>
            <Link href="/admin/service-areas/new">
              <Button>Add Your First Service Area</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
