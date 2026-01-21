'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createService, updateService } from '@/app/actions/admin'

interface ServiceFormProps {
  service?: {
    id: string
    slug: string
    title: string
    excerpt: string
    contentHtml: string
    faqsJson: string
    iconName: string
    published: boolean
    sortOrder: number
    metaTitle: string | null
    metaDescription: string | null
  }
}

export function ServiceForm({ service }: ServiceFormProps) {
  const action = service ? updateService : createService

  return (
    <form action={action} className="space-y-6">
      {service && <input type="hidden" name="id" value={service.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            defaultValue={service?.title}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={service?.slug}
            placeholder="electrical-repairs-troubleshooting"
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="excerpt">Excerpt *</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={service?.excerpt}
          placeholder="Brief description of the service"
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="contentHtml">Content (HTML) *</Label>
        <Textarea
          id="contentHtml"
          name="contentHtml"
          defaultValue={service?.contentHtml}
          placeholder="<h2>Service Overview</h2><p>Detailed description...</p>"
          required
          className="mt-1 min-h-[200px] font-mono text-sm"
        />
      </div>

      <div>
        <Label htmlFor="faqsJson">FAQs (JSON)</Label>
        <Textarea
          id="faqsJson"
          name="faqsJson"
          defaultValue={service?.faqsJson || '[]'}
          placeholder='[{"question": "Question?", "answer": "Answer."}]'
          className="mt-1 min-h-[100px] font-mono text-sm"
        />
        <p className="text-xs text-muted mt-1">
          JSON array of objects with "question" and "answer" keys
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="iconName">Icon Name</Label>
          <Input
            id="iconName"
            name="iconName"
            defaultValue={service?.iconName || 'Zap'}
            placeholder="Zap"
            className="mt-1"
          />
          <p className="text-xs text-muted mt-1">
            Lucide icon name (e.g., Zap, Lightbulb, Car)
          </p>
        </div>
        <div>
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            defaultValue={service?.sortOrder || 0}
            className="mt-1"
          />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            id="published"
            name="published"
            value="true"
            defaultChecked={service?.published}
            className="h-4 w-4"
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <h3 className="font-semibold mb-4">SEO Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              defaultValue={service?.metaTitle || ''}
              placeholder="Leave blank to use service title"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              name="metaDescription"
              defaultValue={service?.metaDescription || ''}
              placeholder="Leave blank to auto-generate"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit">{service ? 'Update Service' : 'Create Service'}</Button>
      </div>
    </form>
  )
}
