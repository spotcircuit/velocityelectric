import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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

    // Call Gemini 3.1 Flash image generation API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Generate an image: Professional photo for an electrical contractor blog post: ${prompt}. Clean, modern, professional photography style. No text or watermarks.`,
                },
              ],
            },
          ],
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
    let mimeType = 'image/png'
    const candidates = data.candidates || []
    for (const candidate of candidates) {
      const parts = candidate.content?.parts || []
      for (const part of parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data
          mimeType = part.inlineData.mimeType || 'image/png'
          break
        }
      }
      if (imageBase64) break
    }

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image generated. Try a different prompt.' }, { status: 500 })
    }

    // Return as data URL — works on Vercel (read-only filesystem) and stores directly in DB
    const url = `data:${mimeType};base64,${imageBase64}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('AI image error:', error)
    return NextResponse.json({ error: 'AI image generation failed' }, { status: 500 })
  }
}
