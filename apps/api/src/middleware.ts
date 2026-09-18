import { NextResponse } from 'next/server'
import { withCorsHeaders, handlePreflight } from '@/shared/http/cors'

export function middleware(request: Request) {
  if (request.method === 'OPTIONS') {
    return withCorsHeaders(handlePreflight())
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
