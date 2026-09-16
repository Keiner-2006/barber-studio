import { NextRequest, NextResponse } from 'next/server'
import { withTenantRequest } from '@/shared/tenancy/tenant-context'
import { handleApiError } from '@/shared/errors/handler'
import { UnauthorizedError } from '@/shared/errors/app-error'
import { withCorsHeaders, handlePreflight } from '@/shared/http/cors'
import type { RequestContext } from '@/shared/tenancy/request-context'

export type ApiHandlerContext<P = undefined> = {
  request: NextRequest
  context: RequestContext
  params: P
}

/**
 * Wraps a route handler with:
 * - request id generation and centralized error mapping
 * - tenant resolution (401 when missing) via AsyncLocalStorage context
 *
 * Static routes:    export const GET = withApiHandler(async ({ request, context }) => ...)
 * Dynamic routes:   export const GET = withApiHandler<{ id: string }>(async ({ request, context, params }) => ...)
 */
export function withApiHandler<P = undefined>(
  handler: (ctx: ApiHandlerContext<P>) => Promise<NextResponse>
) {
  return async (request: NextRequest, routeContext?: { params: Promise<P> }): Promise<NextResponse> => {
    const params = (routeContext ? await routeContext.params : undefined) as P

    if (request.method === 'OPTIONS') {
      return withCorsHeaders(handlePreflight())
    }

    try {
      const result = await withTenantRequest(request.headers, async (tenantRequest) =>
        handler({ request, context: tenantRequest.context, params })
      )
      if (!result) throw new UnauthorizedError()
      return withCorsHeaders(result)
    } catch (error) {
      return withCorsHeaders(handleApiError(error))
    }
  }
}
