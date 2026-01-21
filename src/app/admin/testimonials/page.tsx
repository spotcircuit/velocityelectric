import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff, Star } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toggleTestimonialPublished } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminTestimonialsPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const testimonials = await getTestimonials()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Testimonials</h1>
          <p className="text-muted">Manage customer reviews.</p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </Link>
      </div>

      {testimonials.length > 0 ? (
        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-primary">
                        {testimonial.name}
                      </h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant={testimonial.published ? 'success' : 'secondary'}>
                        {testimonial.published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    {testimonial.location && (
                      <p className="text-sm text-muted mb-2">{testimonial.location}</p>
                    )}
                    <p className="text-muted text-sm line-clamp-2">{testimonial.text}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleTestimonialPublished}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        {testimonial.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                    <Link href={`/admin/testimonials/${testimonial.id}`}>
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
            <p className="text-muted mb-4">No testimonials yet.</p>
            <Link href="/admin/testimonials/new">
              <Button>Add Your First Testimonial</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
