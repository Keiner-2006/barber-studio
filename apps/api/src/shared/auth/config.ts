import { betterAuth } from 'better-auth'
import { bearer } from 'better-auth/plugins'
import { google } from 'better-auth/social-providers'
import { Pool } from 'pg'
import crypto from 'node:crypto'

function logConnectionInfo(url: string, label: string) {
  try {
    const u = new URL(url)
    const password = u.password || ''
    const hasWeirdChars = /^[\s"'\\]|[\s"'\\]$/.test(password)
    const sha = crypto.createHash('sha256').update(password).digest('hex').slice(0, 6)
    console.log(`[DB] ${label} → host=${u.hostname} port=${u.port || 5432} db=${u.pathname.slice(1)} user=${u.username} pwd_len=${password.length} pwd_sha256=${sha}${hasWeirdChars ? ' ⚠️ TRIM_PASSWORD' : ''}`)
  } catch {
    console.log(`[DB] ${label} → invalid URL`)
  }
}

const origin = (value?: string) =>
  value ? (value.startsWith('http') ? value : `https://${value}`) : undefined

const trustedOrigins = [
  origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  origin(process.env.NEXT_PUBLIC_APP_URL),
  origin(process.env.BETTER_AUTH_URL),
  origin(process.env.VERCEL_URL),
  origin(process.env.V0_RUNTIME_URL),
  origin(process.env.V0_DEV_APP_URL),
  origin(process.env.FRONTEND_URL),
].filter(Boolean) as string[]

if (process.env.NODE_ENV !== 'production') {
  trustedOrigins.unshift('http://localhost:3000')
  trustedOrigins.unshift('http://localhost:4200')
}

export const demoAuthEnabled = () => process.env.DEMO_AUTH === 'true'

export const demoToken = 'navaja-demo-session'
export const demoUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@navaja.local',
  name: 'Administrador Navaja',
  role: 'admin',
}

const createDemoSession = () => ({
  token: demoToken,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
})

const authRawUrl = process.env.DATABASE_URL || ''
const authUrlWithSsl = authRawUrl.includes('sslmode=') ? authRawUrl : authRawUrl + '?sslmode=require'
const authDbUrl = authUrlWithSsl.replace(/sslmode=(prefer|require|verify-ca|verify-full)/i, 'sslmode=verify-full')
logConnectionInfo(authDbUrl, 'BETTER_AUTH_DATABASE_URL')

const frontendUrl = origin(process.env.FRONTEND_URL || process.env.BETTER_AUTH_URL || '')
logConnectionInfo(frontendUrl || '', 'BETTER_AUTH_FRONTEND_URL')

export const auth = demoAuthEnabled()
  ? null
  : betterAuth({
      database: new Pool({
        connectionString: authDbUrl,
        ssl: { rejectUnauthorized: true },
      }),
      emailAndPassword: { enabled: true },
      baseURL: origin(process.env.BETTER_AUTH_URL) || origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) || origin(process.env.VERCEL_URL) || origin(process.env.V0_RUNTIME_URL),
      trustedOrigins,
      plugins: [
        bearer(),
        google({
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
      ],
      ...(process.env.NODE_ENV === 'development'
        ? {
            advanced: {
              defaultCookieAttributes: {
                sameSite: 'lax' as const,
                secure: false,
              },
            },
          }
        : {}),
    })

type Credentials = {
  email: string
  password: string
}

type Registration = Credentials & {
  name: string
}

export async function getSession(headers: Headers) {
  if (demoAuthEnabled()) {
    return headers.get('authorization') === `Bearer ${demoToken}`
      ? { user: demoUser, session: createDemoSession() }
      : null
  }

  return (await auth?.api.getSession({ headers })) ?? null
}

export async function signIn(credentials: Credentials, headers: Headers) {
  if (demoAuthEnabled()) {
    return {
      user: demoUser,
      token: demoToken,
      redirect: '/dashboard',
    }
  }

  return auth!.api.signInEmail({
    body: credentials,
    headers,
  })
}

export async function signUp(registration: Registration, headers: Headers) {
  if (demoAuthEnabled()) {
    return {
      user: { ...demoUser, email: registration.email, name: registration.name },
      token: demoToken,
    }
  }

  return auth!.api.signUpEmail({
    body: registration,
    headers,
  })
}

export async function signOut(headers: Headers) {
  if (demoAuthEnabled()) {
    return
  }

  return auth!.api.signOut({ headers })
}
