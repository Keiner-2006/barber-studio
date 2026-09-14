export type User = {
  id: string
  email: string
  name: string
  phone?: string
  avatarUrl?: string
  status: 'invited' | 'active' | 'blocked'
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type Role = {
  id: string
  name: string
  description?: string
  isSystem: boolean
}

export type Permission = {
  id: string
  name: string
  description?: string
  module: string
  action: string
}

export function createUser(props: {
  id: string
  email: string
  name: string
  phone?: string
  avatarUrl?: string
}): User {
  return {
    ...props,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
