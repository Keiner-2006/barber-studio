export const TENANT_STATUSES = {
  PROVISIONING: 'provisioning',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETING: 'deleting',
  DELETED: 'deleted',
} as const

export type TenantStatus = (typeof TENANT_STATUSES)[keyof typeof TENANT_STATUSES]

export const BRANCH_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type BranchStatus = (typeof BRANCH_STATUSES)[keyof typeof BRANCH_STATUSES]

export const USER_STATUSES = {
  INVITED: 'invited',
  ACTIVE: 'active',
  BLOCKED: 'blocked',
} as const

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES]

export const PAYMENT_POLICIES = {
  NONE: 'none',
  DEPOSIT: 'deposit',
  FULL: 'full',
} as const

export type PaymentPolicy = (typeof PAYMENT_POLICIES)[keyof typeof PAYMENT_POLICIES]

export const DEPOSIT_TYPES = {
  FIXED: 'fixed',
  PERCENTAGE: 'percentage',
} as const

export type DepositType = (typeof DEPOSIT_TYPES)[keyof typeof DEPOSIT_TYPES]

export const PROVISIONING_JOB_STATUSES = {
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  COMPENSATED: 'compensated',
} as const

export type ProvisioningJobStatus = (typeof PROVISIONING_JOB_STATUSES)[keyof typeof PROVISIONING_JOB_STATUSES]
