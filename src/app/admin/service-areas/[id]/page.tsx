import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { updateServiceArea, deleteServiceArea } from '@/app/actions/admin'

interface Props {
  params: Promise<{ id: string }>
}

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

export default async function EditServiceAreaPage({ params }: Props) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) redirect('/admin/login')

  const { id } = await params
  const area = await prisma.serviceArea.findUnique({ where: { id } })
  if (!area) notFound()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/service-areas" className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Service Areas
          </Link>
          <h1 className="text-3xl font-bold text-primary">Edit Service Area</h1>
        </div>
        <form action={deleteServiceArea}>
          <input type="hidden" name="id" value={area.id} />
          <Button variant="danger" size="sm" type="submit"><Trash2 className="h-4 w-4" />Delete</Button>
        </form>
      </div>

      <Card>
        <CardHeader><CardTitle>Service Area Details</CardTitle></CardHeader>
        <CardContent>
          <form action={updateServiceArea} className="space-y-6">
            <input type="hidden" name="id" value={area.id} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><Label htmlFor="city">City *</Label><Input id="city" name="city" defaultValue={area.city} required className="mt-1" /></div>
              <div><Label htmlFor="state">State *</Label><Input id="state" name="state" defaultValue={area.state} required className="mt-1" /></div>
              <div><Label htmlFor="slug">Slug *</Label><Input id="slug" name="slug" defaultValue={area.slug} required className="mt-1" /></div>
            </div>
            <div><Label htmlFor="intro">Introduction *</Label><Textarea id="intro" name="intro" defaultValue={area.intro} required className="mt-1 min-h-[100px]" /></div>
            <div><Label htmlFor="highlightsJson">Highlights (JSON)</Label><Textarea id="highlightsJson" name="highlightsJson" defaultValue={area.highlightsJson} className="mt-1 font-mono text-sm" /></div>
            <div><Label htmlFor="faqsJson">FAQs (JSON)</Label><Textarea id="faqsJson" name="faqsJson" defaultValue={area.faqsJson} className="mt-1 font-mono text-sm" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="published" name="published" value="true" defaultChecked={area.published} className="h-4 w-4" /><Label htmlFor="published">Published</Label></div>
            <Button type="submit">Update Service Area</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
