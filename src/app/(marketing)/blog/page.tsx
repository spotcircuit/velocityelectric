import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { Card, CardContent } from '@/components/ui/card'
import { CTASection } from '@/components/sections/cta-section'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Electrical tips, safety advice, and industry insights from your trusted Northern Virginia Master Electrician.',
}

async function getBlogData() {
  const [posts, config] = await Promise.all([
    prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    }),
    getSiteConfig(),
  ])

  return { posts, config }
}

export default async function BlogPage() {
  const { posts, config } = await getBlogData()

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Blog
          </h1>
          <p className="text-xl" style={{ color: '#D1D5DB' }}>
            Electrical tips, safety advice, and insights from the {config.businessName} team.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <Section>
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post: { id: string; slug: string; title: string; excerpt: string; featuredImage: string | null; createdAt: Date }) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                  {post.featuredImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 text-sm text-muted mb-3">
                      <Calendar className="h-4 w-4" />
                      {post.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <h2 className="text-xl font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted flex-1 mb-4">{post.excerpt}</p>
                    <div className="flex items-center gap-1 text-accent font-semibold text-sm">
                      Read More
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted text-lg">Blog posts coming soon. Check back later!</p>
          </div>
        )}
      </Section>

      {/* CTA */}
      <CTASection phone={config.phone} />
    </>
  )
}
