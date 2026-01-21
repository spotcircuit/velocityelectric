import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createTestimonial } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

export default async function NewTestimonialPage() {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) redirect('/admin/login')

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/testimonials" className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" />Back to Testimonials
        </Link>
        <h1 className="text-3xl font-bold text-primary">Add Testimonial</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Testimonial Details</CardTitle></CardHeader>
        <CardContent>
          <form action={createTestimonial} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label htmlFor="name">Name *</Label><Input id="name" name="name" required className="mt-1" /></div>
              <div><Label htmlFor="location">Location</Label><Input id="location" name="location" placeholder="City, State" className="mt-1" /></div>
            </div>
            <div><Label htmlFor="rating">Rating (1-5) *</Label><Input id="rating" name="rating" type="number" min="1" max="5" defaultValue="5" required className="mt-1 w-24" /></div>
            <div><Label htmlFor="text">Review Text *</Label><Textarea id="text" name="text" required className="mt-1 min-h-[100px]" /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="published" name="published" value="true" defaultChecked className="h-4 w-4" /><Label htmlFor="published">Published</Label></div>
            <Button type="submit">Create Testimonial</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
