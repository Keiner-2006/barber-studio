import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router'
import { AuthService } from './auth.service'

const COMPANY_MEMBER_ROLES = [
  'owner',
  'admin',
  'app',
  'reception',
  'barber',
  'inventory_manager',
  'accountant',
  'platform_admin',
]

const PLATFORM_ROLES = ['platform_admin', 'platform_support']

function userHasRole(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (!userRole) return false
  return requiredRoles.some((role) => {
    if (role === '*') return true
    if (role === userRole) return true
    if (role === 'company_member') return COMPANY_MEMBER_ROLES.includes(userRole)
    if (role === 'platform_member') return PLATFORM_ROLES.includes(userRole)
    if (role === 'customer') return userRole === 'customer'
    return false
  })
}

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      return this.router.createUrlTree(['/login'])
    }

    const requiredRoles = route.data['roles'] as string[] | undefined
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const userRole = this.authService.user()?.role
    if (userHasRole(userRole, requiredRoles)) {
      return true
    }

    return this.router.createUrlTree(['/access-denied'])
  }
}
