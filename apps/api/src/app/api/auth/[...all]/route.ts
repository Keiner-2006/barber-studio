import { auth } from '@/shared/auth/config'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = auth
  ? toNextJsHandler(auth)
  : { GET: () => new Response(null, { status: 401 }), POST: () => new Response(null, { status: 401 }) }
