import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff, Tag, Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { togglePromoPublished } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getPromos() {
  return prisma.promo.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export default async function AdminPromosPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const promos = await getPromos()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Promos & Specials</h1>
          <p className="text-muted">Manage promotional offers.</p>
        </div>
        <Link href="/admin/promos/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Promo
          </Button>
        </Link>
      </div>

      {promos.length > 0 ? (
        <div className="grid gap-4">
          {promos.map((promo) => {
            const isExpired = promo.expiresAt && new Date(promo.expiresAt) < new Date()
            return (
              <Card key={promo.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-primary">{promo.title}</h3>
                        {promo.code && (
                          <Badge variant="default">
                            <Tag className="h-3 w-3 mr-1" />
                            {promo.code}
                          </Badge>
                        )}
                        <Badge variant={promo.published ? 'success' : 'secondary'}>
                          {promo.published ? 'Published' : 'Draft'}
                        </Badge>
                        {isExpired && <Badge variant="warning">Expired</Badge>}
                      </div>
                      <p className="text-muted text-sm mb-2">{promo.description}</p>
                      {promo.expiresAt && (
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(promo.expiresAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={togglePromoPublished}>
                        <input type="hidden" name="id" value={promo.id} />
                        <Button variant="ghost" size="icon" type="submit">
                          {promo.published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </form>
                      <Link href={`/admin/promos/${promo.id}`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted mb-4">No promos yet.</p>
            <Link href="/admin/promos/new">
              <Button>Add Your First Promo</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
