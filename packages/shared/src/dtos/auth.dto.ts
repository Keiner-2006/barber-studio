export type LoginDTO = {
  email: string
  password: string
}

export type RegisterDTO = {
  email: string
  password: string
  name: string
}

export type AuthResponseDTO = {
  user: {
    id: string
    email: string
    name: string
  }
  session: {
    token: string
    expiresAt: string
  }
}

export type UserResponseDTO = {
  id: string
  email: string
  name: string
  createdAt: string
}

export type InviteUserDTO = {
  email: string
  role: string
  branchIds?: string[]
}

export type UpdateProfileDTO = {
  name?: string
  email?: string
}
