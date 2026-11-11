import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS } from '../../shared/auth/access-policy';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface GuardContext {
  userRole: string;
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const ctx = (request as any).context as GuardContext | undefined;
    const userRole = ctx?.userRole;

    // A newly added route must explicitly opt in before a barber can use it.
    if (!requiredPermissions?.length) {
      if (userRole === 'barber') throw new ForbiddenException('Permiso denegado');
      return true;
    }

    const hasPermission = requiredPermissions.every((permission) =>
      this.checkPermission(permission, userRole ?? '')
    );

    if (!hasPermission) {
      throw new ForbiddenException('Permiso denegado');
    }

    return true;
  }

  private checkPermission(permission: string, userRole: string): boolean {
    const permissions = ROLE_PERMISSIONS[userRole];
    if (!permissions) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }
}