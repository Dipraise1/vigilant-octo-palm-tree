// Simple in-memory rate limiting for production
const requests = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now()
  const key = identifier
  const record = requests.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    requests.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxRequests) {
    return false
  }

  record.count++
  return true
}

export function getRateLimitInfo(identifier: string): { remaining: number; resetTime: number } {
  const record = requests.get(identifier)
  const now = Date.now()
  
  if (!record || now > record.resetTime) {
    return { remaining: 100, resetTime: now + 15 * 60 * 1000 }
  }

  return { remaining: Math.max(0, 100 - record.count), resetTime: record.resetTime }
}


