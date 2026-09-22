import { NextResponse } from 'next/server'

function origin(value?: string): string | undefined {
  if (!value) return undefined
  return value.startsWith('http') ? value : `https://${value}`
}

export function getCorsOrigins(): string[] {
  const origins: string[] = [
    origin(process.env.NEXT_PUBLIC_APP_URL),
    origin(process.env.VERCEL_URL),
    origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    origin(process.env.V0_RUNTIME_URL),
    origin(process.env.V0_DEV_APP_URL),
  ].filter(Boolean) as string[]

  if (process.env.CORS_ORIGINS) {
    const extra = process.env.CORS_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
    origins.push(...extra)
  }

  if (process.env.NODE_ENV !== 'production') {
    origins.unshift('http://localhost:3000')
    origins.unshift('http://localhost:4200')
  }

  return origins
}

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
const ALLOWED_HEADERS = 'Content-Type, Authorization, x-tenant-id, X-Tenant, X-Request-Id, X-Demo-Auth'
const EXPOSED_HEADERS = 'X-Request-Id'

export function withCorsHeaders(response: NextResponse): NextResponse {
  const origins = getCorsOrigins()
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev && origins.length === 0) {
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.set('Vary', 'Origin')
  } else {
    response.headers.set('Access-Control-Allow-Origin', origins[0] ?? '')
    response.headers.set('Vary', 'Origin')
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS)
  response.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS)
  response.headers.set('Access-Control-Expose-Headers', EXPOSED_HEADERS)
  response.headers.set('Access-Control-Max-Age', '86400')

  return response
}

export function handlePreflight(): NextResponse {
  const res = new NextResponse(null, { status: 204 })
  const origins = getCorsOrigins()
  const isDev = process.env.NODE_ENV !== 'production'

  if (isDev && origins.length === 0) {
    res.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.headers.set('Vary', 'Origin')
  } else {
    res.headers.set('Access-Control-Allow-Origin', origins[0] ?? '')
    res.headers.set('Vary', 'Origin')
  }

  res.headers.set('Access-Control-Allow-Credentials', 'true')
  res.headers.set('Access-Control-Allow-Methods', ALLOWED_METHODS)
  res.headers.set('Access-Control-Allow-Headers', ALLOWED_HEADERS)
  res.headers.set('Access-Control-Max-Age', '86400')

  return res
}
