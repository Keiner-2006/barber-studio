import { betterAuth } from 'better-auth'
import { bearer } from 'better-auth/plugins'
import { Pool } from 'pg'

const origin = (value?: string) =>
  value ? (value.startsWith('http') ? value : `https://${value}`) : undefined

const trustedOrigins = [
  'http://localhost:3000',
  'http://localhost:4200',
  origin(process.env.V0_RUNTIME_URL),
  origin(process.env.V0_DEV_APP_URL),
  origin(process.env.VERCEL_URL),
  origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter(Boolean) as string[]

const demoAuthEnabled = () =>
  process.env.NODE_ENV !== 'production' && process.env.DEMO_AUTH === 'true'

const demoToken = 'navaja-demo-session'
const demoUser = {
  id: 'demo-user',
  email: 'admin@navaja.local',
  name: 'Administrador Navaja',
  role: 'admin',
}

const createDemoSession = () => ({
  token: demoToken,
  expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
})

const auth = demoAuthEnabled()
  ? null
  : betterAuth({
      database: new Pool({ connectionString: process.env.DATABASE_URL }),
      emailAndPassword: { enabled: true },
      baseURL:
        origin(process.env.BETTER_AUTH_URL) ||
        origin(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
        origin(process.env.VERCEL_URL) ||
        origin(process.env.V0_RUNTIME_URL),
      trustedOrigins,
      plugins: [bearer()],
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
