import { Injectable } from '@angular/core'
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router'
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredRoles = route.data['roles'] as string[] | undefined
    const userRole = this.authService.user()?.role

    if (!requiredRoles || !userRole) {
      return true
    }

    if (requiredRoles.includes(userRole)) {
      return true
    }

    return this.router.createUrlTree(['/dashboard'])
  }
}
