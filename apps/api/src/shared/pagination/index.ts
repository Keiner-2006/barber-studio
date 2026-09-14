export type PaginationParams = {
  cursor?: string
  limit: number
}

export type PaginationResult<T> = {
  data: T[]
  meta: {
    cursor?: string
    hasMore: boolean
    total?: number
  }
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
  const cursor = searchParams.get('cursor') || undefined

  return { cursor, limit }
}

export function encodeCursor(id: string): string {
  return Buffer.from(id).toString('base64url')
}

export function decodeCursor(cursor: string): string {
  return Buffer.from(cursor, 'base64url').toString()
}

export function createPaginatedResponse<T>(
  data: T[],
  hasMore: boolean,
  total?: number
): PaginationResult<T> {
  const lastItem = data[data.length - 1]
  return {
    data,
    meta: {
      cursor: hasMore && lastItem ? encodeCursor((lastItem as any).id) : undefined,
      hasMore,
      total,
    },
  }
}
