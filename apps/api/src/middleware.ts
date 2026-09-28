import { NextResponse } from 'next/server'
import { withCorsHeaders, handlePreflight } from '@/shared/http/cors'

const securityHeaders: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), payment=()',
  'X-Powered-By': 'Navaja',
}

export function middleware(request: Request) {
  if (request.method === 'OPTIONS') {
    const response = withCorsHeaders(handlePreflight())
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    return response
  }
  const response = NextResponse.next()
  withCorsHeaders(response)
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

export const config = {
  matcher: '/api/:path*',
}
