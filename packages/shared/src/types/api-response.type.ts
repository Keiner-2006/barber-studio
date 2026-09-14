export type ApiResponse<T> = {
  data: T
  meta?: PaginationMeta
}

export type ApiError = {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  requestId?: string
}

export type PaginationMeta = {
  cursor?: string
  hasMore: boolean
  total?: number
}

export type PaginatedRequest = {
  cursor?: string
  limit?: number
}
