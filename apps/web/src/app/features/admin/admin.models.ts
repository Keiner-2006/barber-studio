export interface AdminTenantSummary {
  id: string
  legalName: string
  tradeName: string
  slug: string
  businessType: string
  status: string
  countryCode: string
  phone: string | null
  createdAt: string
  branding: {
    logoUrl: string | null
    primaryColor: string | null
  } | null
}

export interface AdminTenantsResponse {
  total: number
  countsByStatus: Record<string, number>
  tenants: AdminTenantSummary[] | undefined
}