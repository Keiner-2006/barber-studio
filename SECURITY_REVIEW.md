# SECURITY & BEST PRACTICES REVIEW — Navaja Studio OS

> **Project**: Barbershop Management System (Navaja Studio OS)
> **Stack**: Angular 19 (frontend) + Next.js 16 (API) + Drizzle ORM + PostgreSQL + better-auth + pnpm workspaces
> **Deployment**: Vercel / Render
> **Purpose**: Comprehensive security and best-practices checklist for agent review
> **Reference Skills**: `security-review`, `security-scan`, `security-bounty-hunter`, `backend-patterns`, `frontend-patterns`, `api-design`, `prisma-patterns`, `database-migrations`, `deployment-patterns`, `docker-patterns`, `error-handling`, `production-audit`, `tdd-workflow`, `coding-standards`, `e2e-testing`

---

## TABLE OF CONTENTS

1. [Secrets Management](#1-secrets-management)
2. [Input Validation & Sanitization](#2-input-validation--sanitization)
3. [SQL Injection Prevention](#3-sql-injection-prevention)
4. [XSS Prevention](#4-xss-prevention)
5. [CSRF Protection](#5-csrf-protection)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Security & Design](#7-api-security--design)
8. [Rate Limiting](#8-rate-limiting)
9. [Sensitive Data Exposure](#9-sensitive-data-exposure)
10. [Dependency Security](#10-dependency-security)
11. [Database Security & Migrations](#11-database-security--migrations)
12. [Error Handling](#12-error-handling)
13. [Frontend Security & Patterns](#13-frontend-security--patterns)
14. [Deployment & Infrastructure Security](#14-deployment--infrastructure-security)
15. [Docker & Container Security](#15-docker--container-security)
16. [Logging & Monitoring](#16-logging--monitoring)
17. [Testing & Quality Assurance](#17-testing--quality-assurance)
18. [Production Readiness Audit](#18-production-readiness-audit)

---

## 1. SECRETS MANAGEMENT

### FAIL — NEVER Do This
```typescript
const apiKey = "sk-proj-xxxxx"  // Hardcoded secret
const dbPassword = "password123" // In source code
```

### PASS — ALWAYS Do This
```typescript
const apiKey = process.env.OPENAI_API_KEY
const dbUrl = process.env.DATABASE_URL

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

### Checklist
- [ ] No hardcoded API keys, tokens, or passwords in any source file
- [ ] All secrets in environment variables (`.env.local`)
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in git history (`git log --all --full-history -- '*.env'`)
- [ ] Production secrets in Vercel/Render dashboard
- [ ] `better-auth` secret keys (`AUTH_SECRET`) in environment variables
- [ ] `DATABASE_URL` never committed to source control
- [ ] `pnpm-lock.yaml` committed for reproducible builds

### Verification Commands
```bash
grep -r "password\|secret\|apiKey\|token" --include="*.ts" --include="*.json" --exclude-dir=node_modules . | grep -v "process.env"
grep -r "sk-proj\|pk_live\|sk_live" --include="*.ts" --include="*.js" .
cat .gitignore | grep "\.env"
```

### Project-Specific Notes
- `apps/api/.env` or `apps/api/.env.local` must contain `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_*` variables
- `apps/web/.env` must contain API base URLs, never secret keys
- `.gitignore` must exclude `.env*` files at both workspace and app levels

---

## 2. INPUT VALIDATION & SANITIZATION

### Always Validate User Input with Zod
```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.issues }
    }
    throw error
  }
}
```

### File Upload Validation
```typescript
function validateFileUpload(file: File) {
  const maxSize = 5 * 1024 * 1024 // 5MB max
  if (file.size > maxSize) throw new Error('File too large (max 5MB)')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type')

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!extension || !allowedExtensions.includes(extension)) throw new Error('Invalid file extension')

  return true
}
```

### Checklist
- [ ] All user inputs validated with Zod schemas before processing
- [ ] File uploads restricted (size, type, extension)
- [ ] No direct use of user input in queries
- [ ] Whitelist validation (not blacklist)
- [ ] Error messages don't leak sensitive info
- [ ] `better-auth` input validation on login/register endpoints
- [ ] DTOs in `packages/shared/src/dtos/` validate with Zod

### Project-Specific Routes to Check
- `apps/api/src/app/api/v1/auth/login/route.ts` — email/password validation
- `apps/api/src/app/api/v1/auth/[...all]/route.ts` — all auth endpoints
- All CRUD endpoints in `apps/api/src/app/api/v1/`
- Any file upload handling (avatar, profile images)

---

## 3. SQL INJECTION PREVENTION

### FAIL — NEVER Concatenate SQL
```typescript
const query = `SELECT * FROM users WHERE email = '${userEmail}'`
await db.query(query) // DANGEROUS
```

### PASS — ALWAYS Use Parameterized Queries
```typescript
const { data } = await supabase.from('users').select('*').eq('email', userEmail)

// Or with Drizzle ORM (safe by design)
await db.query.users.findMany({ where: eq(users.email, userEmail) })
```

### Checklist
- [ ] All database queries use parameterized queries or ORM methods
- [ ] No string concatenation in SQL
- [ ] Drizzle ORM used correctly (all queries use `.eq()`, `.in()`, etc.)
- [ ] Raw SQL queries use parameterized bindings
- [ ] Supabase queries properly sanitized
- [ ] No template literals in database query strings

### Project-Specific Checks
- Verify all `drizzle-orm` queries in `apps/api/src/shared/db/` use type-safe methods
- Check any custom SQL in migration files or seed scripts
- Verify `provisioning.service.ts` doesn't concatenate SQL

---

## 4. XSS PREVENTION

### Sanitize HTML
```typescript
import DOMPurify from 'isomorphic-dompurify'

function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

### Content Security Policy (Next.js)
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      base-uri 'self';
      object-src 'none';
      frame-ancestors 'none';
      script-src 'self';
      style-src 'self';
      img-src 'self' data: https:;
      font-src 'self';
      connect-src 'self' https://api.example.com;
    `.replace(/\s{2,}/g, ' ').trim()
  }
]
```

### Checklist
- [ ] User-provided HTML sanitized before rendering
- [ ] CSP headers configured in Next.js middleware
- [ ] No unvalidated dynamic content rendering
- [ ] React's built-in XSS protection used (don't bypass with `dangerouslySetInnerHTML` unless sanitized)
- [ ] Angular sanitization active for any `[innerHTML]` bindings

### Project-Specific Checks
- `apps/api/src/middleware.ts` — should set security headers
- Any `innerHTML`, `dangerouslySetInnerHTML` in Angular components
- `apps/web/src/app/core/http/` — check for any raw HTML rendering

---

## 5. CSRF PROTECTION

### CSRF Tokens
```typescript
import { csrf } from '@/lib/csrf'

export async function POST(request: Request) {
  const token = request.headers.get('X-CSRF-Token')
  if (!csrf.verify(token)) {
    return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
  }
  // Process request
}
```

### SameSite Cookies
```typescript
res.setHeader('Set-Cookie', `session=${sessionId}; HttpOnly; Secure; SameSite=Strict`)
```

### Checklist
- [ ] CSRF tokens on all state-changing operations (POST, PUT, DELETE)
- [ ] SameSite=Strict on all cookies
- [ ] Double-submit cookie pattern implemented
- [ ] `better-auth` CSRF protection enabled and configured
- [ ] Angular `HttpClient` sends credentials correctly

### Project-Specific Checks
- `better-auth` configuration in `apps/api/src/shared/auth/config.ts` — verify CSRF settings
- Cookie settings for `better-auth` sessions
- Angular `HttpClient` interceptors handling CSRF tokens

---

## 6. AUTHENTICATION & AUTHORIZATION

### JWT Token Handling
```typescript
// FAIL: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// PASS: httpOnly cookies
res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

### Authorization Checks
```typescript
export async function deleteUser(userId: string, requesterId: string) {
  const requester = await db.users.findUnique({ where: { id: requesterId } })
  if (requester.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  await db.users.delete({ where: { id: userId } })
}
```

### Role-Based Access Control
```typescript
const rolePermissions: Record<string, string[]> = {
  owner: ['*'],
  admin: ['branches:read', 'branches:write', 'catalog:read', 'customers:read', 'appointments:read', 'inventory:read', 'purchasing:read', 'cash:read', 'reports:read', 'users:read'],
  app: ['branches:read', 'catalog:read', 'customers:read', 'appointments:read', 'inventory:read', 'purchasing:read', 'cash:read', 'reports:read'],
  reception: ['customers:read', 'customers:write', 'appointments:read', 'appointments:write', 'catalog:read', 'cash:read', 'cash:write'],
  barber: ['appointments:read', 'customers:read', 'catalog:read'],
  inventory_manager: ['inventory:read', 'inventory:write', 'purchasing:read', 'purchasing:write', 'catalog:read'],
  accountant: ['reports:read', 'cash:read', 'purchasing:read'],
  customer: ['appointments:read', 'customers:read'],
}

export function hasPermission(permission: string, userRole: string): boolean {
  const permissions = rolePermissions[userRole]
  if (!permissions) return false
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}
```

### Checklist
- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] Authorization checks before all sensitive operations
- [ ] Role-based access control implemented (`hasPermission()` in `request-context.ts`)
- [ ] Multi-tenant isolation enforced (platform vs tenant DB)
- [ ] `AuthGuard` with role-based route protection in Angular
- [ ] Session management secure
- [ ] Login rate limiting implemented
- [ ] Audit logging for auth events (success/failure)

### Project-Specific Checks
- `apps/api/src/shared/tenancy/request-context.ts` — `hasPermission()` function
- `apps/web/src/app/core/auth/auth.guard.ts` — Angular route guards
- `apps/api/src/app/api/auth/[...all]/route.ts` — better-auth routes
- Multi-tenant data isolation between `platform_users` and tenant `users`
- Login endpoint validates role and prevents cross-flow authentication

---

## 7. API SECURITY & DESIGN

### RESTful API Structure
```
GET    /api/v1/appointments     # List resources
GET    /api/v1/appointments/:id # Get single resource
POST   /api/v1/appointments     # Create resource
PUT    /api/v1/appointments/:id # Replace resource
PATCH  /api/v1/appointments/:id # Update resource
DELETE /api/v1/appointments/:id # Delete resource
```

### HTTP Status Codes
| Code | Use For |
|------|---------|
| 200 | GET, PUT, PATCH success |
| 201 | POST (created) |
| 204 | DELETE success |
| 400 | Validation failure |
| 401 | Missing/invalid authentication |
| 403 | Authenticated but not authorized |
| 404 | Resource doesn't exist |
| 429 | Rate limit exceeded |
| 500 | Unexpected failure (never expose details) |

### Error Response Format
```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Must be a valid email", "code": "invalid_format" }
    ]
  }
}
```

### Checklist
- [ ] Resource URLs follow naming conventions (plural, kebab-case, no verbs)
- [ ] Correct HTTP methods used (GET for reads, POST for creates, etc.)
- [ ] Appropriate status codes returned
- [ ] Input validated with Zod schemas
- [ ] Error responses follow standard format
- [ ] Pagination implemented for list endpoints
- [ ] Authentication required on all endpoints (or explicitly marked public)
- [ ] Authorization checked (users can only access their own resources)
- [ ] Response does not leak internal details (stack traces, SQL errors)
- [ ] CORS properly configured
- [ ] Versioned API (`/api/v1/`)

### Project-Specific Files
- `apps/api/src/app/api/v1/` — all API routes
- `apps/api/src/shared/errors/handler.ts` — centralized error handler
- `apps/api/src/shared/api-client.ts` — API client configuration
- CORS configuration in `next.config.ts` or middleware

---

## 8. RATE LIMITING

### API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests'
})
app.use('/api/', limiter)
```

### Login Rate Limiting
```typescript
const loginAttempts = new LRUCache<string, number>({ max: 1000, ttl: 1000 * 60 * 15 })
export function checkLoginRateLimit(email: string): boolean {
  const attempts = loginAttempts.get(email) || 0
  if (attempts >= 5) return false
  loginAttempts.set(email, attempts + 1)
  return true
}
```

### Checklist
- [ ] Rate limiting on all API endpoints
- [ ] Stricter limits on expensive operations (search, login)
- [ ] IP-based rate limiting
- [ ] User-based rate limiting for authenticated requests
- [ ] Login attempt rate limiting (max 5 attempts per 15 min)
- [ ] Rate limiting uses shared store (Redis), not per-process memory

---

## 9. SENSITIVE DATA EXPOSURE

### Logging — NEVER Log Sensitive Data
```typescript
// FAIL
console.log('User login:', { email, password })
console.log('Payment:', { cardNumber, cvv })

// PASS
console.log('User login:', { email, userId })
console.log('Payment:', { last4: card.last4, userId })
```

### Error Messages — Never Expose Internals
```typescript
// FAIL
catch (error) {
  return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
}

// PASS
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
}
```

### Checklist
- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] Detailed errors only in server logs
- [ ] No stack traces exposed to users
- [ ] Response DTOs map from entities (don't return raw Drizzle objects)
- [ ] `next.config.js` disables `poweredByHeader`

---

## 10. DEPENDENCY SECURITY

### Checklist
- [ ] `pnpm audit` run regularly, no known vulnerabilities
- [ ] `pnpm-lock.yaml` committed to source control
- [ ] `pnpm ci` used in CI/CD (not `pnpm install`)
- [ ] Dependabot or similar enabled on GitHub
- [ ] Regular security updates
- [ ] `bcrypt` dependency version is current
- [ ] `better-auth` up to date with security patches
- [ ] No unused dependencies

### Verification Commands
```bash
pnpm audit
pnpm outdated
cat pnpm-lock.yaml | head -5
```

---

## 11. DATABASE SECURITY & MIGRATIONS

### Migration Safety Checklist
- [ ] Every change is a migration (never alter production databases manually)
- [ ] Migrations are forward-only in production
- [ ] Schema and data migrations are separate
- [ ] New columns have defaults or are nullable (never add NOT NULL without default)
- [ ] Indexes created concurrently
- [ ] Data backfill is a separate migration from schema change
- [ ] Migrations tested against production-sized data
- [ ] Rollback plan documented

### Zero-Downtime Migration Pattern (Expand-Contract)
```
Phase 1: EXPAND — Add new column (nullable)
Phase 2: MIGRATE — Backfill data, deploy app reads from NEW
Phase 3: CONTRACT — Drop old column in separate migration
```

### Drizzle ORM Specifics
```typescript
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deletedAt"),
})
```

### Checklist
- [ ] `drizzle-kit generate` creates migrations for all schema changes
- [ ] `drizzle-kit migrate` used in CI/CD (not `drizzle-kit push`)
- [ ] `deletedAt` column used for soft delete (filter explicitly)
- [ ] No `SELECT *` in production queries
- [ ] Indexes on all foreign keys and WHERE/ORDER BY columns
- [ ] Connection pooling configured for serverless (`connection_limit=1` in `DATABASE_URL`)
- [ ] No raw SQL in application code (use Drizzle type-safe methods)

### Project-Specific Files
- `apps/api/drizzle.config.ts` — Drizzle configuration
- `apps/api/src/shared/db/` — Schema definitions
- Migration files in `apps/api/src/shared/db/migrations/`
- Seed scripts

---

## 12. ERROR HANDLING

### Typed Error Classes
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: { field: string; message: string }[]) {
    super(message, 'VALIDATION_ERROR', 422, details)
  }
}
```

### API Error Handler (Next.js)
```typescript
function handleApiError(error: unknown): NextResponse {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, ...(error.details ? { details: error.details } : {}) } },
      { status: error.statusCode }
    )
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Request validation failed', details: error.issues } },
      { status: 422 }
    )
  }
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 }
  )
}
```

### Checklist
- [ ] Every `catch` block handles, re-throws, or logs (no silent swallowing)
- [ ] API errors follow standard envelope `{ error: { code, message } }`
- [ ] User-facing messages contain no stack traces or internal details
- [ ] Full error context logged server-side
- [ ] Custom error classes extend a base `AppError` with a `code` field
- [ ] Async functions surface errors to callers
- [ ] Retry logic only retries retriable errors (not 4xx client errors)
- [ ] React/Angular components wrapped in `ErrorBoundary`

### Project-Specific Files
- `apps/api/src/shared/errors/handler.ts` — error handler
- `apps/web/src/app/core/http/error.interceptor.ts` — Angular HTTP error interceptor

---

## 13. FRONTEND SECURITY & PATTERNS

### Angular Security Patterns
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const requiredRoles = route.data['roles']
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'])
      return false
    }
    if (requiredRoles && !requiredRoles.includes(this.authService.user()?.role)) {
      this.router.navigate(['/access-denied'])
      return false
    }
    return true
  }
}
```

### Checklist
- [ ] `AuthGuard` protects all routes with `canActivate`
- [ ] Auth tokens sent via `httpOnly` cookies (not localStorage)
- [ ] Angular `HttpClient` interceptors handle auth and errors
- [ ] No `innerHTML` bindings without sanitization
- [ ] Form inputs validated before submission
- [ ] Environment configurations separate (`environment.ts` vs `environment.prod.ts`)
- [ ] Feature modules properly lazy-loaded

### Project-Specific Files
- `apps/web/src/app/core/auth/auth.guard.ts`
- `apps/web/src/app/core/http/auth.interceptor.ts`
- `apps/web/src/app/core/http/api-client.ts`
- `apps/web/src/environments/environment.ts` and `environment.prod.ts`
- All `apps/web/src/app/features/*/` modules

---

## 14. DEPLOYMENT & INFRASTRUCTURE SECURITY

### Environment Configuration (Twelve-Factor App)
```bash
DATABASE_URL=postgres://user:pass@host:5432/db
AUTH_SECRET=your-32-char-minimum-secret
NODE_ENV=production
```

### Configuration Validation at Startup
```typescript
import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
})

export const env = envSchema.parse(process.env)
```

### CI/CD Checklist
- [ ] `lint`, `typecheck`, `test` all pass before build
- [ ] `pnpm audit` clean
- [ ] Docker image builds reproducibly
- [ ] Environment variables validated at startup
- [ ] SSL/TLS enabled on all endpoints
- [ ] Health check endpoint returns meaningful status
- [ ] Rollback plan documented and tested

### Vercel/Render Specific
- [ ] `vercel.json` or `render.yaml` properly configured
- [ ] Environment variables set in Vercel/Render dashboard
- [ ] Build output verified
- [ ] Preview deployments have environment isolation

---

## 15. DOCKER & CONTAINER SECURITY

### Multi-Stage Dockerfile (Node.js)
```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:22-alpine AS runner
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
USER appuser
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
ENV NODE_ENV=production
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]
```

### Container Security Checklist
- [ ] Use specific version tags (never `:latest`)
- [ ] Multi-stage builds to minimize image size
- [ ] Run as non-root user
- [ ] No secrets in image layers
- [ ] Health check configured
- [ ] `.dockerignore` excludes `node_modules`, `.env`, `.git`, `dist`
- [ ] Resource limits set (CPU, memory)
- [ ] Read-only root filesystem where possible

---

## 16. LOGGING & MONITORING

### Structured Logging
```typescript
interface LogContext {
  userId?: string
  requestId?: string
  method?: string
  path?: string
  [key: string]: unknown
}

class Logger {
  log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
    const entry = { timestamp: new Date().toISOString(), level, message, ...context }
    console.log(JSON.stringify(entry))
  }
}
```

### Checklist
- [ ] Structured JSON logging
- [ ] Request IDs for tracing
- [ ] No PII or secrets in logs
- [ ] Error logging includes context (requestId, userId, path)
- [ ] Health check endpoint returns meaningful status
- [ ] Application metrics exported
- [ ] Alerts configured for error rate spikes

---

## 17. TESTING & QUALITY ASSURANCE

### Security Tests
```typescript
test('requires authentication', async () => {
  const response = await fetch('/api/protected')
  expect(response.status).toBe(401)
})

test('requires admin role', async () => {
  const response = await fetch('/api/admin', {
    headers: { Authorization: `Bearer ${userToken}` }
  })
  expect(response.status).toBe(403)
})

test('rejects invalid input', async () => {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify({ email: 'not-an-email' })
  })
  expect(response.status).toBe(400)
})

test('enforces rate limits', async () => {
  const requests = Array(101).fill(null).map(() => fetch('/api/endpoint'))
  const responses = await Promise.all(requests)
  const tooMany = responses.filter(r => r.status === 429)
  expect(tooMany.length).toBeGreaterThan(0)
})
```

### Checklist
- [ ] Unit tests for all services and utilities
- [ ] Integration tests for API routes
- [ ] E2E tests for critical user paths (login, booking, appointments)
- [ ] Test coverage meets 80%+ threshold
- [ ] Security tests for auth, authorization, input validation
- [ ] Angular tests (`ng test`) passing
- [ ] Backend tests passing

---

## 18. PRODUCTION READINESS AUDIT

### Score: ___/100

### Security & Auth (Blockers)
- [ ] No hardcoded secrets in code or config files
- [ ] All secrets in environment variables
- [ ] Auth and authorization enforced server-side
- [ ] Rate limiting enabled on all public endpoints
- [ ] CSRF protection enabled
- [ ] CORS configured for allowed origins only
- [ ] Upload validation implemented (size, type)
- [ ] Security headers set (CSP, HSTS, X-Frame-Options)

### Data Integrity (Blockers)
- [ ] Migrations run forward cleanly with rollback plan
- [ ] Destructive migrations staged safely
- [ ] Database policies match tenancy model
- [ ] Retries idempotent for writes, jobs, and webhooks
- [ ] Row-level security enabled
- [ ] `deletedAt` soft delete filtering implemented

### Operations
- [ ] App starts from clean checkout using documented commands
- [ ] Required environment variables named, validated, fail-fast
- [ ] Health check proves dependencies are reachable
- [ ] Deploy, rollback, and incident-owner paths documented
- [ ] Logs useful without leaking secrets or personal data
- [ ] `pnpm audit` clean
- [ ] `pnpm-lock.yaml` committed

### User Experience
- [ ] Launch-critical paths covered on desktop and mobile
- [ ] Forms usable on mobile
- [ ] Loading, empty, error, and permission states defined
- [ ] Support/recovery path when critical operation fails

### CI/CD
- [ ] `lint`, `typecheck`, `test` all pass
- [ ] Build succeeds
- [ ] Security scan passes
- [ ] Staging environment tested before production

### Rollback
- [ ] Previous image/artifact available and tagged
- [ ] Database migrations are backward-compatible
- [ ] Feature flags can disable new features without deploy
- [ ] Monitoring alerts configured for error rate spikes

---

## APPENDIX: KEY FILES TO REVIEW

### API Layer
| File | Purpose |
|------|---------|
| `apps/api/src/middleware.ts` | Next.js middleware (auth, headers, rate limiting) |
| `apps/api/src/app/api/auth/[...all]/route.ts` | better-auth routes |
| `apps/api/src/app/api/v1/auth/login/route.ts` | Login endpoint with role validation |
| `apps/api/src/shared/auth/config.ts` | better-auth configuration |
| `apps/api/src/shared/auth/role-resolver.ts` | Role resolution service |
| `apps/api/src/shared/tenancy/request-context.ts` | `hasPermission()`, tenant context |
| `apps/api/src/shared/errors/handler.ts` | Centralized error handler |
| `apps/api/src/shared/db/` | Drizzle schema definitions |
| `apps/api/src/shared/provisioning/provisioning.service.ts` | Provisioning logic |

### Frontend Layer
| File | Purpose |
|------|---------|
| `apps/web/src/app/core/auth/auth.service.ts` | Angular auth service |
| `apps/web/src/app/core/auth/auth.guard.ts` | Route guard with role checks |
| `apps/web/src/app/core/http/api-client.ts` | HTTP client configuration |
| `apps/web/src/app/core/http/auth.interceptor.ts` | Auth token interceptor |
| `apps/web/src/app/core/http/error.interceptor.ts` | Error handling interceptor |
| `apps/web/src/environments/environment.ts` | Dev environment config |
| `apps/web/src/environments/environment.prod.ts` | Production environment config |
| `apps/web/src/app/app.routes.ts` | Route definitions with role guards |
| `apps/web/src/app/features/*/` | Feature modules |

### Shared & Config
| File | Purpose |
|------|---------|
| `packages/shared/src/` | Shared types, DTOs, enums |
| `packages/shared/src/dtos/` | Data Transfer Objects |
| `packages/shared/src/enums/` | Role, tenant, payment method enums |
| `apps/api/drizzle.config.ts` | Drizzle ORM configuration |
| `vercel.json` | Vercel deployment config |
| `render.yaml` | Render deployment config |
| `.gitignore` | Gitignore rules |
| `pnpm-workspace.yaml` | Workspace configuration |

---

## RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/security)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [better-auth Docs](https://www.better-auth.com/)
- [Angular Security](https://angular.dev/guide/security)
- [Supabase Security](https://supabase.com/docs/guides/auth)
- [Web Security Academy](https://portswigger.net/web-security)

---

> **Remember**: Security is not optional. One vulnerability can compromise the entire platform. When in doubt, err on the side of caution.
