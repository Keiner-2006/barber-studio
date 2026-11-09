import type { Role } from '@navaja/shared'

export interface User {
  id: string
  email: string
  name: string
  role?: Role
}

export interface Session {
  token: string
  expiresAt: string
}

export type LoginExpectedRole = 'company_member' | 'platform_admin'

export interface LoginRequest {
  email: string
  password: string
  expectedRole: LoginExpectedRole
  tenantId?: string
}

export interface LoginResponse {
  user: User
  session: Session
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface SessionResponse {
  user: User
  session: Session
}
