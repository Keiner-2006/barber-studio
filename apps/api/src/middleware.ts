import { NextResponse } from 'next/server'
import { withCorsHeaders, handlePreflight } from '@/shared/http/cors'

export function middleware(request: Request) {
  if (request.method === 'OPTIONS') {
    return withCorsHeaders(handlePreflight())
  }
  const response = NextResponse.next()
  withCorsHeaders(response)
  return response
}

export const config = {
  matcher: '/api/:path*',
}
