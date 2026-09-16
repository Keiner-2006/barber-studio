import { Branch } from '../../domain/entities/Branch'

export interface CreateBranchData {
  code: string
  name: string
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
  phone?: string | null
  timezone?: string | null
  operatingHours?: Record<string, any> | null
}

export interface UpdateBranchData {
  name?: string
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
  phone?: string | null
  timezone?: string | null
  status?: 'active' | 'inactive'
  operatingHours?: Record<string, any> | null
}

export interface IBranchRepository {
  findById(id: string): Promise<Branch | null>
  findByCode(code: string): Promise<Branch | null>
  create(data: CreateBranchData): Promise<Branch>
  update(id: string, data: UpdateBranchData): Promise<Branch | null>
  list(): Promise<Branch[]>
  getStaff(branchId: string): Promise<any[]>
}