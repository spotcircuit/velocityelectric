import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff } from 'lucide-react'
import { prisma } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toggleBlogPostPublished } from '@/app/actions/admin'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

async function getBlogPosts() {
  return prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

export default async function AdminBlogPage() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const posts = await getBlogPosts()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Blog</h1>
          <p className="text-muted">Create and manage blog posts.</p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="grid gap-4">
          {posts.map((post: { id: string; title: string; slug: string; published: boolean; createdAt: Date }) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-primary">
                          {post.title}
                        </h3>
                        <Badge variant={post.published ? 'success' : 'secondary'}>
                          {post.published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted">
                        /blog/{post.slug} &middot; {post.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleBlogPostPublished}>
                      <input type="hidden" name="id" value={post.id} />
                      <Button variant="ghost" size="icon" type="submit">
                        {post.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </form>
                    <Link href={`/admin/blog/${post.id}`}>
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
            <p className="text-muted mb-4">No blog posts yet.</p>
            <Link href="/admin/blog/new">
              <Button>Write Your First Post</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
