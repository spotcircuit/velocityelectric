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
import { updatePromo, deletePromo } from '@/app/actions/admin'

interface Props { params: Promise<{ id: string }> }

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === 'authenticated'
}

export default async function EditPromoPage({ params }: Props) {
  if (!(await checkAuth())) redirect('/admin/login')
  const { id } = await params
  const promo = await prisma.promo.findUnique({ where: { id } })
  if (!promo) notFound()

  const expiresAtValue = promo.expiresAt ? new Date(promo.expiresAt).toISOString().split('T')[0] : ''

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/promos" className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"><ArrowLeft className="h-4 w-4" />Back</Link>
          <h1 className="text-3xl font-bold text-primary">Edit Promo</h1>
        </div>
        <form action={deletePromo}><input type="hidden" name="id" value={promo.id} /><Button variant="danger" size="sm" type="submit"><Trash2 className="h-4 w-4" />Delete</Button></form>
      </div>
      <Card>
        <CardHeader><CardTitle>Promo Details</CardTitle></CardHeader>
        <CardContent>
          <form action={updatePromo} className="space-y-6">
            <input type="hidden" name="id" value={promo.id} />
            <div><Label htmlFor="title">Title *</Label><Input id="title" name="title" defaultValue={promo.title} required className="mt-1" /></div>
            <div><Label htmlFor="description">Description *</Label><Textarea id="description" name="description" defaultValue={promo.description} required className="mt-1" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><Label htmlFor="code">Promo Code</Label><Input id="code" name="code" defaultValue={promo.code || ''} className="mt-1" /></div>
              <div><Label htmlFor="expiresAt">Expires At</Label><Input id="expiresAt" name="expiresAt" type="date" defaultValue={expiresAtValue} className="mt-1" /></div>
              <div><Label htmlFor="sortOrder">Sort Order</Label><Input id="sortOrder" name="sortOrder" type="number" defaultValue={promo.sortOrder} className="mt-1" /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="published" name="published" value="true" defaultChecked={promo.published} className="h-4 w-4" /><Label htmlFor="published">Published</Label></div>
            <Button type="submit">Update Promo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
