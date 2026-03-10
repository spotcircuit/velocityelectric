'use client'

import * as React from 'react'
import Image from 'next/image'
import { Upload, Sparkles, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RichEditor } from '@/components/ui/rich-editor'
import { createBlogPost, updateBlogPost } from '@/app/actions/admin'

interface BlogFormProps {
  post?: {
    id: string
    slug: string
    title: string
    excerpt: string
    contentHtml: string
    featuredImage: string | null
    published: boolean
    metaTitle: string | null
    metaDescription: string | null
  }
}

export function BlogForm({ post }: BlogFormProps) {
  const action = post ? updateBlogPost : createBlogPost
  const [featuredImage, setFeaturedImage] = React.useState(post?.featuredImage || '')
  const [uploading, setUploading] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState('')
  const [error, setError] = React.useState('')
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/admin/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        setFeaturedImage(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setError('Enter a description for the AI to generate an image')
      return
    }

    setGenerating(true)
    setError('')

    try {
      const res = await fetch('/admin/api/ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      const data = await res.json()
      if (res.ok) {
        setFeaturedImage(data.url)
        setAiPrompt('')
      } else {
        setError(data.error || 'AI generation failed')
      }
    } catch {
      setError('AI generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <form action={action} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="featuredImage" value={featuredImage} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={post?.title}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={post?.slug}
            placeholder="my-blog-post"
            required
            className="mt-1"
          />
          <p className="text-xs text-muted mt-1">
            URL-friendly name (e.g., tips-for-electrical-safety)
          </p>
        </div>
      </div>

      {/* Featured Image */}
      <div>
        <Label>Featured Image</Label>
        <div className="mt-2 space-y-3">
          {featuredImage && (
            <div className="relative inline-block">
              <Image
                src={featuredImage}
                alt="Featured image preview"
                width={400}
                height={225}
                className="rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => setFeaturedImage('')}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            </div>
          </div>

          {/* AI Image Generator */}
          <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold">AI Image Generator</span>
            </div>
            <div className="flex gap-2">
              <Input
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., electrical panel upgrade in modern home"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAiGenerate()
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAiGenerate}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generating ? 'Creating...' : 'Generate'}
              </Button>
            </div>
            <p className="text-xs text-muted mt-1">
              Describe the image you want and AI will create it for you
            </p>
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={post?.excerpt}
          placeholder="Brief summary shown in the blog listing"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label>Content *</Label>
        <div className="mt-1">
          <RichEditor
            name="contentHtml"
            defaultValue={post?.contentHtml}
            placeholder="Start writing your blog post..."
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          name="published"
          value="true"
          defaultChecked={post?.published}
          className="h-4 w-4"
        />
        <Label htmlFor="published">Published</Label>
        <span className="text-xs text-muted">(auto-posts to Google Business Profile when published)</span>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold mb-4">SEO Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={post?.metaTitle || ''}
              placeholder="Leave blank to use post title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              name="metaDescription"
              defaultValue={post?.metaDescription || ''}
              placeholder="Leave blank to use excerpt"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit">{post ? 'Update Post' : 'Create Post'}</Button>
      </div>
    </form>
  )
}
