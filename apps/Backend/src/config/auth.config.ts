import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  secret: process.env.AUTH_SECRET || process.env.BETTER_AUTH_SECRET || '',
  url: process.env.BETTER_AUTH_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || process.env.V0_RUNTIME_URL || '',
  databaseUrl: process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL || '',
  frontendUrl: process.env.FRONTEND_URL || '',
  demoEnabled: process.env.DEMO_AUTH === 'true',
  demoToken: 'navaja-demo-session',
  demoUser: {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@navaja.local',
    name: 'Administrador Navaja',
    role: 'admin',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  },
  session: {
    cookieName: 'auth_session',
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
  ].map((origin) => origin?.trim()).filter((origin): origin is string => Boolean(origin)),
}));