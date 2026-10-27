import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { AuthService } from '../auth/auth.service'
import { TenantService } from '../tenancy/tenant.service'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  const tenantService = inject(TenantService)

  const token = authService.getToken()
  const tenantId = tenantService.tenantId()

  let headers = req.headers
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`)
  }
  if (tenantId) {
    headers = headers.set('x-tenant-id', tenantId)
  }

  const cloned = req.clone({ headers })
  return next(cloned)
}
