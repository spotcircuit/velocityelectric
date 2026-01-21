import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ServiceForm } from '../_components/service-form'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

export default async function NewServicePage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>
        <h1 className="text-3xl font-bold text-primary">Add New Service</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>
    </div>
  )
}
