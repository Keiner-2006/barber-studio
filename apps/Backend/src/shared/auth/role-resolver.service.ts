import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../db/database.module';
import { PlatformUserEntity } from '../../modules/auth/drivers/persistence/platform-user.entity';
import { PlatformMembershipEntity } from '../../modules/auth/drivers/persistence/platform-membership.entity';
import { ValidationError } from '../errors/app-error';

export type UserRole =
  | 'owner'
  | 'admin'
  | 'app'
  | 'reception'
  | 'barber'
  | 'inventory_manager'
  | 'accountant'
  | 'customer'
  | 'platform_admin'
  | 'platform_support';

export const ROLE_CATEGORIES = {
  company_member: ['owner', 'admin', 'app', 'reception', 'barber', 'inventory_manager', 'accountant'] as const,
  customer: ['customer'] as const,
  platform_member: ['platform_admin', 'platform_support'] as const,
} as const;

export type RoleCategory = keyof typeof ROLE_CATEGORIES;

export interface ResolvedUserRole {
  role: string | null;
  category: RoleCategory | null;
  platformUserId?: string;
  localUserId?: string;
  tenantId?: string | null;
}

/** Raised when a user belongs to several tenants and the request did not say which one. */
export class TenantRequiredError extends ValidationError {
  constructor() {
    super('Tu cuenta pertenece a varios negocios. Indica el negocio (tenantId) para continuar.', { code: 'TENANT_REQUIRED' });
  }
}

const PLATFORM_ROLES: readonly string[] = ROLE_CATEGORIES.platform_member;

@Injectable()
export class RoleResolverService {
  private readonly platformUserRepo: Repository<PlatformUserEntity>;
  private readonly platformMembershipRepo: Repository<PlatformMembershipEntity>;

  constructor(@Inject(AUTH_DATA_SOURCE) private readonly authDataSource: DataSource) {
    this.platformUserRepo = this.authDataSource.getRepository(PlatformUserEntity);
    this.platformMembershipRepo = this.authDataSource.getRepository(PlatformMembershipEntity);
  }

  getRoleCategory(role: string): RoleCategory | null {
    for (const [category, roleList] of Object.entries(ROLE_CATEGORIES)) {
      if ((roleList as readonly string[]).includes(role)) {
        return category as RoleCategory;
      }
    }
    return null;
  }

  /**
   * Deterministic membership selection (spec D2):
   * - only active memberships; tenant roles also need an active tenant, platform roles must have tenant_id NULL
   * - filtered by expectedFlow when given
   * - tenantId given → that tenant's membership (platform roles never match a tenantId)
   * - no tenantId → exactly one candidate is used; more than one throws TenantRequiredError (never "pick first")
   *
   * Dedicated per-tenant databases are intentionally not read here: the previous code connected to them with
   * hard-coded postgres/postgres credentials. All tenants currently live in the shared database.
   */
  async resolveUserRole(
    email: string,
    tenantId?: string,
    expectedFlow?: RoleCategory,
  ): Promise<ResolvedUserRole> {
    const platformUser = await this.platformUserRepo.findOne({ where: { email } });
    if (!platformUser || platformUser.status !== 'active') {
      return { role: null, category: null };
    }

    const memberships = await this.platformMembershipRepo.find({
      where: { userId: platformUser.id, status: 'active' },
      relations: ['tenant'],
    });

    const candidates = memberships.filter((m) => {
      if (expectedFlow && !this.validateRoleForFlow(m.role, expectedFlow)) return false;
      if (PLATFORM_ROLES.includes(m.role)) return !m.tenantId && !tenantId;
      if (m.tenant?.status !== 'active') return false;
      return !tenantId || m.tenantId === tenantId;
    });

    if (candidates.length > 1) throw new TenantRequiredError();
    const membership = candidates[0];
    if (!membership) return { role: null, category: null };

    return {
      role: membership.role,
      category: this.getRoleCategory(membership.role),
      platformUserId: platformUser.id,
      tenantId: membership.tenantId,
    };
  }

  validateRoleForFlow(
    userRole: string | null,
    expectedFlow: 'company_member' | 'customer' | 'platform_member'
  ): boolean {
    if (!userRole) return false;
    return (ROLE_CATEGORIES[expectedFlow] as readonly string[]).includes(userRole);
  }
}
