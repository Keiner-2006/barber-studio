import { Injectable, Inject } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PLATFORM_DATA_SOURCE, AUTH_DATA_SOURCE } from '../db/database.module';
import { PlatformUserEntity } from '../../modules/auth/drivers/persistence/platform-user.entity';
import { PlatformMembershipEntity } from '../../modules/auth/drivers/persistence/platform-membership.entity';
import { PlatformTenantEntity } from '../../modules/auth/drivers/persistence/platform-tenant.entity';
import { UserEntity } from '../../modules/auth/drivers/persistence/user.entity';
import { UserRoleEntity } from '../../modules/auth/drivers/persistence/user-role.entity';
import { RoleEntity } from '../../modules/auth/drivers/persistence/role.entity';

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
}

@Injectable()
export class RoleResolverService {
  private readonly platformUserRepo: Repository<PlatformUserEntity>;
  private readonly platformMembershipRepo: Repository<PlatformMembershipEntity>;
  private readonly platformTenantRepo: Repository<PlatformTenantEntity>;
  private readonly userRepo: Repository<UserEntity>;
  private readonly userRoleRepo: Repository<UserRoleEntity>;
  private readonly roleRepo: Repository<RoleEntity>;

  constructor(
    @Inject(PLATFORM_DATA_SOURCE) private readonly platformDataSource: DataSource,
    @Inject(AUTH_DATA_SOURCE) private readonly authDataSource: DataSource,
  ) {
    this.platformUserRepo = this.authDataSource.getRepository(PlatformUserEntity);
    this.platformMembershipRepo = this.authDataSource.getRepository(PlatformMembershipEntity);
    this.platformTenantRepo = this.authDataSource.getRepository(PlatformTenantEntity);
    this.userRepo = this.platformDataSource.getRepository(UserEntity);
    this.userRoleRepo = this.platformDataSource.getRepository(UserRoleEntity);
    this.roleRepo = this.platformDataSource.getRepository(RoleEntity);
  }

  getRoleCategory(role: string): RoleCategory | null {
    for (const [category, roleList] of Object.entries(ROLE_CATEGORIES)) {
      if ((roleList as readonly string[]).includes(role)) {
        return category as RoleCategory;
      }
    }
    return null;
  }

  private async createTenantDataSource(tenantId: string): Promise<DataSource | null> {
    const tenant = await this.platformTenantRepo.findOne({ where: { id: tenantId } });
    if (!tenant?.databaseName || !tenant.databaseHost) {
      return null;
    }
    return new DataSource({
      type: 'postgres',
      host: tenant.databaseHost,
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: tenant.databaseName,
      schema: 'public',
      synchronize: false,
      logging: false,
      entities: [UserEntity, RoleEntity, UserRoleEntity],
    } as any);
  }

  async resolveUserRole(email: string, tenantId?: string): Promise<ResolvedUserRole> {
    if (tenantId) {
      const tenantDataSource = await this.createTenantDataSource(tenantId);
      if (tenantDataSource) {
        try {
          await tenantDataSource.initialize();
          const userRepoT = tenantDataSource.getRepository(UserEntity);
          const userRoleRepoT = tenantDataSource.getRepository(UserRoleEntity);
          const roleRepoT = tenantDataSource.getRepository(RoleEntity);

          const user = await userRepoT.findOne({ where: { email } });
          if (user) {
            const userRoles = await userRoleRepoT.find({ where: { userId: user.id } });
            for (const ur of userRoles) {
              const role = await roleRepoT.findOne({ where: { id: ur.roleId } });
              if (role?.name) {
                await tenantDataSource.destroy();
                return {
                  role: role.name,
                  category: this.getRoleCategory(role.name),
                  localUserId: user.id,
                };
              }
            }
          }
          await tenantDataSource.destroy();
        } catch {
          try { await tenantDataSource.destroy(); } catch {}
        }
      }
    }

    const platformUser = await this.platformUserRepo.findOne({ where: { email } });
    if (!platformUser) {
      return { role: null, category: null };
    }

    const memberships = await this.platformMembershipRepo.find({ where: { userId: platformUser.id } });
    for (const membership of memberships) {
      return {
        role: membership.role,
        category: this.getRoleCategory(membership.role),
        platformUserId: platformUser.id,
      };
    }

    return { role: null, category: null };
  }

  validateRoleForFlow(
    userRole: string | null,
    expectedFlow: 'company_member' | 'customer' | 'platform_member'
  ): boolean {
    if (!userRole) return false;
    if (userRole === 'platform_admin' || userRole === 'platform_support') {
      return true;
    }
    return (ROLE_CATEGORIES[expectedFlow] as readonly string[]).includes(userRole);
  }
}
