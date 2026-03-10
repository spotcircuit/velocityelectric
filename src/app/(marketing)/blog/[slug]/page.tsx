import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import { prisma } from '@/lib/db'
import { getSiteConfig } from '@/lib/config'
import { Section } from '@/components/ui/section'
import { CTASection } from '@/components/sections/cta-section'

interface Props {
  params: Promise<{ slug: string }>
}

async function getBlogPostData(slug: string) {
  const [post, config] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { slug, published: true },
    }),
    getSiteConfig(),
  ])

  return { post, config }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { post } = await getBlogPostData(slug)

  if (!post) {
    return { title: 'Post Not Found' }
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
  }
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    select: { slug: true },
  })

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const { post, config } = await getBlogPostData(slug)

  if (!post) {
    notFound()
  }

  return (
    <>
      {/* Hero */}
      <section
        className="pt-24 md:pt-32 pb-12 md:pb-16"
        style={{ background: 'linear-gradient(to bottom right, #0B1F3B, #071528)' }}
      >
        <div className="container-custom max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 mb-6 transition-colors text-sm hover:opacity-80"
            style={{ color: '#CBD5E1' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm" style={{ color: '#9CA3AF' }}>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {post.createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.featuredImage && (
        <Section padding="sm">
          <div className="max-w-3xl mx-auto">
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              {post.featuredImage.startsWith('data:') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Content */}
      <Section>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-border">
            <div
              className="prose-custom prose prose-lg max-w-none
                prose-headings:text-primary prose-headings:font-semibold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-muted prose-p:leading-relaxed
                prose-li:text-muted prose-li:leading-relaxed
                prose-ul:my-4 prose-ul:space-y-2
                prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                prose-strong:text-primary"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-accent font-semibold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Posts
            </Link>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <CTASection phone={config.phone} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt,
            datePublished: post.createdAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: {
              '@type': 'Organization',
              name: config.businessName,
            },
            publisher: {
              '@type': 'Organization',
              name: config.businessName,
            },
          }),
        }}
      />
    </>
  )
}
