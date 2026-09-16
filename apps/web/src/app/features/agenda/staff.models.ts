export interface StaffMember {
  id: string
  userId: string
  displayName: string
  bio?: string
  avatarUrl?: string
  commissionRate: string
  isBookable: boolean
  status: string
  userEmail?: string
}
