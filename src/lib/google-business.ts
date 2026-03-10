const GBP_ACCESS_TOKEN = process.env.GOOGLE_BUSINESS_ACCESS_TOKEN
const GBP_ACCOUNT_ID = process.env.GOOGLE_BUSINESS_ACCOUNT_ID
const GBP_LOCATION_ID = process.env.GOOGLE_BUSINESS_LOCATION_ID
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.velocityelectric.co'

interface BlogPostData {
  title: string
  excerpt: string
  slug: string
  featuredImage?: string | null
}

/**
 * Auto-post a blog entry to Google Business Profile when published.
 * Fails silently if credentials are not configured.
 */
export async function postToGoogleBusiness(post: BlogPostData): Promise<void> {
  if (!GBP_ACCESS_TOKEN || !GBP_ACCOUNT_ID || !GBP_LOCATION_ID) {
    console.log('Google Business Profile not configured — skipping auto-post')
    return
  }

  try {
    const postUrl = `${SITE_URL}/blog/${post.slug}`

    // Build the local post payload
    const localPost: Record<string, unknown> = {
      languageCode: 'en',
      summary: `${post.title}\n\n${post.excerpt}`,
      callToAction: {
        actionType: 'LEARN_MORE',
        url: postUrl,
      },
      topicType: 'STANDARD',
    }

    // If there's a featured image, include it
    if (post.featuredImage) {
      const imageUrl = post.featuredImage.startsWith('http')
        ? post.featuredImage
        : `${SITE_URL}${post.featuredImage}`

      localPost.media = [
        {
          mediaFormat: 'PHOTO',
          sourceUrl: imageUrl,
        },
      ]
    }

    const apiUrl = `https://mybusiness.googleapis.com/v4/accounts/${GBP_ACCOUNT_ID}/locations/${GBP_LOCATION_ID}/localPosts`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GBP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(localPost),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Google Business Profile post failed:', errorData)
      return
    }

    console.log(`Google Business Profile post created for: ${post.title}`)
  } catch (error) {
    console.error('Google Business Profile error:', error)
  }
}
