import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createPromo } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  return cookieStore.get('admin_auth')?.value === 'authenticated'
}

export default async function NewPromoPage() {
  if (!(await checkAuth())) redirect('/admin/login')

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/promos" className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4"><ArrowLeft className="h-4 w-4" />Back to Promos</Link>
        <h1 className="text-3xl font-bold text-primary">Add Promo</h1>
      </div>
      <Card>
        <CardHeader><CardTitle>Promo Details</CardTitle></CardHeader>
        <CardContent>
          <form action={createPromo} className="space-y-6">
            <div><Label htmlFor="title">Title *</Label><Input id="title" name="title" required className="mt-1" placeholder="e.g., $50 Off Any Service" /></div>
            <div><Label htmlFor="description">Description *</Label><Textarea id="description" name="description" required className="mt-1" placeholder="Details about the promotion..." /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><Label htmlFor="code">Promo Code</Label><Input id="code" name="code" className="mt-1" placeholder="SAVE50" /></div>
              <div><Label htmlFor="expiresAt">Expires At</Label><Input id="expiresAt" name="expiresAt" type="date" className="mt-1" /></div>
              <div><Label htmlFor="sortOrder">Sort Order</Label><Input id="sortOrder" name="sortOrder" type="number" defaultValue="0" className="mt-1" /></div>
            </div>
            <div className="flex items-center gap-2"><input type="checkbox" id="published" name="published" value="true" className="h-4 w-4" /><Label htmlFor="published">Published</Label></div>
            <Button type="submit">Create Promo</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
