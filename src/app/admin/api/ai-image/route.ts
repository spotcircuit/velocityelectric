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

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI image generation not configured. Add OPENAI_API_KEY to environment variables.' },
      { status: 500 }
    )
  }

  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Call OpenAI DALL-E API
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional photo for an electrical contractor blog post: ${prompt}. Clean, modern, professional photography style. No text or watermarks.`,
        n: 1,
        size: '1792x1024',
        quality: 'standard',
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('OpenAI error:', err)
      return NextResponse.json(
        { error: 'AI image generation failed. Try a different prompt.' },
        { status: 500 }
      )
    }

    const data = await response.json()
    const imageUrl = data.data[0]?.url

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image generated' }, { status: 500 })
    }

    // Download the image and save locally
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    const filename = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.png`
    const filepath = join(process.cwd(), 'public', 'uploads', 'blog', filename)
    await writeFile(filepath, Buffer.from(imageBuffer))

    const url = `/uploads/blog/${filename}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('AI image error:', error)
    return NextResponse.json({ error: 'AI image generation failed' }, { status: 500 })
  }
}
