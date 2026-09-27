import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth } from '@/shared/auth/config'

const getHandler = () => {
  const auth = getAuth()
  return auth ? toNextJsHandler(auth) : { GET: () => new Response(null, { status: 401 }), POST: () => new Response(null, { status: 401 }) }
}

export async function GET(request: Request) {
  const { GET } = getHandler()
  return GET(request)
}

export async function POST(request: Request) {
  const { POST } = getHandler()
  return POST(request)
}