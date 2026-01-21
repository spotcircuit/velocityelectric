import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// In-memory fallback rate limiter
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 5 // 5 requests per minute

function cleanupInMemoryStore() {
  const now = Date.now()
  for (const [key, value] of inMemoryStore.entries()) {
    if (now > value.resetTime) {
      inMemoryStore.delete(key)
    }
  }
}

// Clean up every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupInMemoryStore, WINDOW_MS)
}

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

// Create Upstash rate limiter if configured
let upstashRatelimit: Ratelimit | null = null

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    upstashRatelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(MAX_REQUESTS, '1 m'),
      analytics: true,
    })
  } catch (error) {
    console.warn('Failed to initialize Upstash rate limiter:', error)
  }
}

export async function rateLimit(identifier: string): Promise<RateLimitResult> {
  // Use Upstash if available
  if (upstashRatelimit) {
    try {
      const result = await upstashRatelimit.limit(identifier)
      return {
        success: result.success,
        remaining: result.remaining,
        reset: result.reset,
      }
    } catch (error) {
      console.warn('Upstash rate limit error, falling back to in-memory:', error)
    }
  }

  // In-memory fallback
  const now = Date.now()
  const record = inMemoryStore.get(identifier)

  if (!record || now > record.resetTime) {
    inMemoryStore.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    })
    return {
      success: true,
      remaining: MAX_REQUESTS - 1,
      reset: now + WINDOW_MS,
    }
  }

  if (record.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      reset: record.resetTime,
    }
  }

  record.count++
  return {
    success: true,
    remaining: MAX_REQUESTS - record.count,
    reset: record.resetTime,
  }
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }
  return '127.0.0.1'
}
