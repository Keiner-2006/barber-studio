import type { Role } from '../enums/role.enum'

export type RequestContext = {
  tenantId: string
  userId: string
  userRole: Role
  branchId?: string
  requestId: string
}
