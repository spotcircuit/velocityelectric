'use client'

import { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

interface RichEditorProps {
  name: string
  defaultValue?: string
  placeholder?: string
  minHeight?: number
}

const TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY || 'rlq7r4yruge85f95n2qewi3w152sfea92wutffjotgjg11pw'

export function RichEditor({ name, defaultValue = '', placeholder, minHeight = 350 }: RichEditorProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  return (
    <>
      <input type="hidden" name={name} ref={hiddenInputRef} defaultValue={defaultValue} />
      <Editor
        apiKey={TINYMCE_API_KEY}
        initialValue={defaultValue}
        init={{
          min_height: minHeight,
          max_height: 800,
          menubar: false,
          plugins: 'lists link autolink autoresize image table code',
          toolbar:
            'bold italic underline | heading2 heading3 | bullist numlist | link image | table | code | removeformat',
          branding: false,
          statusbar: true,
          placeholder: placeholder || 'Start writing...',
          autoresize_bottom_margin: 16,
          // Enable drag-and-drop / paste image uploads
          images_upload_handler: (blobInfo: { blob: () => Blob; filename: () => string }) => {
            return new Promise<string>((resolve, reject) => {
              const formData = new FormData()
              formData.append('file', blobInfo.blob(), blobInfo.filename())
              fetch('/admin/api/upload', {
                method: 'POST',
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.url) resolve(data.url)
                  else reject(data.error || 'Upload failed')
                })
                .catch(() => reject('Upload failed'))
            })
          },
          automatic_uploads: true,
          file_picker_types: 'image',
          content_style: `
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.6; color: #333; padding: 8px; }
            h2 { font-size: 1.5em; margin-top: 1em; }
            h3 { font-size: 1.25em; margin-top: 0.8em; }
            p { margin: 0.5em 0; }
            ul, ol { padding-left: 1.5em; }
          `,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setup: (editor: any) => {
            // Custom heading buttons
            editor.ui.registry.addButton('heading2', {
              text: 'H2',
              tooltip: 'Heading 2',
              onAction: () => editor.execCommand('FormatBlock', false, 'h2'),
            })
            editor.ui.registry.addButton('heading3', {
              text: 'H3',
              tooltip: 'Heading 3',
              onAction: () => editor.execCommand('FormatBlock', false, 'h3'),
            })

            // Sync content to hidden input on change
            editor.on('change keyup', () => {
              if (hiddenInputRef.current) {
                hiddenInputRef.current.value = editor.getContent()
              }
            })
          },
        }}
      />
    </>
  )
}
