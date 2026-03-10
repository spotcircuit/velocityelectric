import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { writeFile } from 'fs/promises'
import { join } from 'path'

async function checkAuth() {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('admin_auth')
  return authCookie?.value === 'authenticated'
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI image generation not configured. Add GEMINI_API_KEY to environment variables.' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Call Gemini image generation API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Professional photo for an electrical contractor blog post: ${prompt}. Clean, modern, professional photography style. No text or watermarks.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ['IMAGE'],
            imageConfig: {
              aspectRatio: '16:9',
              imageSize: '1K',
            },
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini error:', err)
      return NextResponse.json(
        { error: 'AI image generation failed. Try a different prompt.' },
        { status: 500 }
      )
    }

    const data = await response.json()

    // Extract inline image data from Gemini response
    let imageBase64: string | null = null
    const candidates = data.candidates || []
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || []
      for (const part of parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data
          break
        }
      }
      if (imageBase64) break
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image generated. Try a different prompt.' }, { status: 500 })
    }

    // Decode base64 and save locally
    const imageBuffer = Buffer.from(imageBase64, 'base64')
    const filename = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`
    const filepath = join(process.cwd(), 'public', 'uploads', 'blog', filename)
    await writeFile(filepath, imageBuffer)

    const url = `/uploads/blog/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('AI image error:', error)
    return NextResponse.json({ error: 'AI image generation failed' }, { status: 500 })
  }
}
