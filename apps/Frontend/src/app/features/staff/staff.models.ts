import type { Role } from '@navaja/shared'

export interface StaffMember {
  id: string
  userId: string
  displayName: string
  bio: string | null
  avatarUrl: string | null
  commissionRate: string
  isBookable: boolean
  status: 'active' | 'inactive'
  userEmail: string
  role: Role | null
}

export interface CreateStaffInput {
  displayName: string
  bio?: string
  avatarUrl?: string
  commissionRate?: string
  isBookable?: boolean
  email: string
}

export interface UpdateStaffInput {
  displayName?: string
  bio?: string
  avatarUrl?: string
  commissionRate?: string
  isBookable?: boolean
  status?: 'active' | 'inactive'
  email?: string
}