import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface GuardContext {
  userRole: string;
  tenantId?: string;
  userId?: string;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  activated: boolean;
  userRole: string;
  tenantId?: string;
  userId?: string;

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ctx = (request as any).context as GuardContext | undefined;
    const userRole = ctx?.userRole;

    const hasPermission = requiredPermissions.every((permission) =>
      this.checkPermission(permission, userRole ?? '')
    );

    if (!hasPermission) {
      throw new ForbiddenException('Permiso denegado');
    }

    return true;
  }

  private checkPermission(permission: string, userRole: string): boolean {
    const rolePermissions: Record<string, string[]> = {
      owner: ['*'],
      platform_admin: ['*'],
      admin: [
        'branches:read', 'branches:write',
        'catalog:read', 'catalog:write',
        'customers:read', 'customers:write',
        'appointments:read', 'appointments:write',
        'inventory:read', 'inventory:write',
        'purchasing:read', 'purchasing:write',
        'cash:read', 'cash:write',
        'reports:read',
        'users:read', 'users:write',
      ],
      app: [
        'branches:read',
        'catalog:read',
        'customers:read',
        'appointments:read', 'appointments:write',
        'inventory:read',
        'purchasing:read',
        'cash:read',
        'reports:read',
      ],
      reception: [
        'customers:read', 'customers:write',
        'appointments:read', 'appointments:write',
        'catalog:read',
        'cash:read', 'cash:write',
      ],
      barber: [
        'appointments:read', 'appointments:write',
        'customers:read',
        'catalog:read',
      ],
      inventory_manager: [
        'inventory:read', 'inventory:write',
        'purchasing:read', 'purchasing:write',
        'catalog:read',
      ],
      accountant: [
        'reports:read',
        'cash:read',
        'purchasing:read',
      ],
      customer: [
        'appointments:read',
        'customers:read',
      ],
      platform_support: [
        'reports:read',
        'users:read',
      ],
    };

    const permissions = rolePermissions[userRole];
    if (!permissions) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(permission);
  }
}