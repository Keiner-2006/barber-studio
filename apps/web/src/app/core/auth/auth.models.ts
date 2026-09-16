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

export interface LoginRequest {
  email: string
  password: string
  expectedRole?: Role
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
