import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createServiceArea } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

export default async function NewServiceAreaPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/service-areas" className="inline-flex items-center gap-2 text-muted hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Service Areas
        </Link>
        <h1 className="text-3xl font-bold text-primary">Add Service Area</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Area Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createServiceArea} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input id="city" name="city" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="state">State *</Label>
                <Input id="state" name="state" required className="mt-1" />
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" name="slug" placeholder="city-name" required className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="intro">Introduction *</Label>
              <Textarea id="intro" name="intro" required className="mt-1 min-h-[100px]" placeholder="Introduction text about electrical services in this city..." />
            </div>
            <div>
              <Label htmlFor="highlightsJson">Highlights (JSON)</Label>
              <Textarea id="highlightsJson" name="highlightsJson" defaultValue="[]" className="mt-1 font-mono text-sm" placeholder='[{"title": "Title", "description": "Description"}]' />
            </div>
            <div>
              <Label htmlFor="faqsJson">FAQs (JSON)</Label>
              <Textarea id="faqsJson" name="faqsJson" defaultValue="[]" className="mt-1 font-mono text-sm" placeholder='[{"question": "Question?", "answer": "Answer."}]' />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="published" name="published" value="true" className="h-4 w-4" />
              <Label htmlFor="published">Published</Label>
            </div>
            <Button type="submit">Create Service Area</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
