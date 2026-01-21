import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceForm } from '../_components/service-form'
import { deleteService } from '@/app/actions/admin'

interface Props {
  params: Promise<{ id: string }>
}

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getService(id: string) {
  return prisma.service.findUnique({ where: { id } })
}

export default async function EditServicePage({ params }: Props) {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const { id } = await params
  const service = await getService(id)

  if (!service) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
          <h1 className="text-3xl font-bold text-primary">Edit Service</h1>
        </div>
        <form action={deleteService}>
          <input type="hidden" name="id" value={service.id} />
          <Button variant="danger" size="sm" type="submit">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm service={service} />
        </CardContent>
      </Card>
    </div>
  )
}
