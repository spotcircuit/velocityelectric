'use client'

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
    published: boolean
    metaTitle: string | null
    metaDescription: string | null
  }
}

export function BlogForm({ post }: BlogFormProps) {
  const action = post ? updateBlogPost : createBlogPost

  return (
    <form action={action} className="space-y-6">
      {post && <input type="hidden" name="id" value={post.id} />}

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
