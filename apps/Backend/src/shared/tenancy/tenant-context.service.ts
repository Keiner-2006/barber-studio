import { Injectable, Inject, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PLATFORM_DATA_SOURCE, AUTH_DATA_SOURCE } from '../db/database.module';
import { RequestContextService, RequestContext } from './request-context.service';
import { RoleResolverService, RoleCategory } from '../auth/role-resolver.service';
import { AuthService } from '../auth/auth.service';
import { ForbiddenError } from '../errors/app-error';
import crypto from 'crypto';
import { PlatformUserEntity } from '../../modules/auth/drivers/persistence/platform-user.entity';
import { PlatformMembershipEntity } from '../../modules/auth/drivers/persistence/platform-membership.entity';
import { PlatformTenantEntity } from '../../modules/auth/drivers/persistence/platform-tenant.entity';
import { UserEntity } from '../../modules/auth/drivers/persistence/user.entity';
import { UserRoleEntity } from '../../modules/auth/drivers/persistence/user-role.entity';
import { RoleEntity } from '../../modules/auth/drivers/persistence/role.entity';
import { StaffProfileEntity } from '../../modules/branches/drivers/persistence/staff-profile.entity';

interface SessionUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  tenantId?: string;
}

interface SessionData {
  user: SessionUser;
  session: {
    token: string;
    expiresAt: string;
  };
}

interface ResolvedIdentity {
  tenantId: string;
  tenantStatus: string;
  databaseUrl: string;
  platformUserId: string;
  localUserId: string | null;
  userRole: string;
  isPlatformAdmin: boolean;
}

const IDENTITY_CACHE_TTL_MS = 30_000;
const identityCache = new Map<string, { identity: ResolvedIdentity; expiresAt: number }>();

@Injectable()
export class TenantContextService {
  private readonly logger = new Logger(TenantContextService.name);

  private readonly platformUserRepo: Repository<PlatformUserEntity>;
  private readonly platformMembershipRepo: Repository<PlatformMembershipEntity>;
  private readonly platformTenantRepo: Repository<PlatformTenantEntity>;

  constructor(
    @Inject(PLATFORM_DATA_SOURCE) private readonly platformDataSource: DataSource,
    @Inject(AUTH_DATA_SOURCE) private readonly authDataSource: DataSource,
    private readonly requestContext: RequestContextService,
    private readonly roleResolver: RoleResolverService,
    private readonly authService: AuthService,
  ) {
    this.platformUserRepo = this.authDataSource.getRepository(PlatformUserEntity);
    this.platformMembershipRepo = this.authDataSource.getRepository(PlatformMembershipEntity);
    this.platformTenantRepo = this.authDataSource.getRepository(PlatformTenantEntity);
  }

  private getSessionToken(session: SessionData): string {
    return session.session?.token || session.user.email;
  }

  private getRequestedTenantId(headers: Record<string, string | undefined>, sessionUser: SessionUser): string | undefined {
    const fromHeaders = headers['x-tenant-id'];
    if (fromHeaders) return fromHeaders;
    return sessionUser.tenantId;
  }

  private resolveDatabaseUrl(tenant: { databaseName: string | null; databaseSecretRef: string | null }): string {
    return process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL || '';
  }

  private getCachedIdentity(cacheKey: string): ResolvedIdentity | null {
    const cached = identityCache.get(cacheKey);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
      identityCache.delete(cacheKey);
      return null;
    }
    return cached.identity;
  }

  private setCachedIdentity(cacheKey: string, identity: ResolvedIdentity): void {
    identityCache.set(cacheKey, { identity, expiresAt: Date.now() + IDENTITY_CACHE_TTL_MS });
    if (identityCache.size > 1000) {
      const oldestKey = identityCache.keys().next().value;
      if (oldestKey) identityCache.delete(oldestKey);
    }
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
      entities: [UserEntity, RoleEntity, UserRoleEntity, StaffProfileEntity],
    } as any);
  }

  async resolveIdentity(
    headers: Record<string, string | undefined>,
    session: SessionData,
    requestedTenantId: string,
    expectedFlow?: RoleCategory
  ): Promise<ResolvedIdentity | null> {
    const cacheKey = `${this.getSessionToken(session)}:${requestedTenantId || '*'}`;
    const cached = this.getCachedIdentity(cacheKey);
    if (cached) return cached;

    const platformUser = await this.platformUserRepo.findOne({ where: { email: session.user.email } });
    if (!platformUser) return null;

    const platformAdmin = await this.platformMembershipRepo.findOne({
      where: { userId: platformUser.id, role: 'platform_admin' as any },
    });

    if (platformAdmin) {
      const identity: ResolvedIdentity = {
        tenantId: '',
        tenantStatus: 'active',
        databaseUrl: '',
        platformUserId: platformUser.id,
        localUserId: null,
        userRole: 'platform_admin',
        isPlatformAdmin: true,
      };
      this.setCachedIdentity(cacheKey, identity);
      return identity;
    }

    const membership = requestedTenantId
      ? await this.platformMembershipRepo.findOne({
          where: {
            userId: platformUser.id,
            tenantId: requestedTenantId,
            status: 'active',
          } as any,
          relations: ['tenant'],
        })
      : await this.platformMembershipRepo.findOne({
          where: { userId: platformUser.id, status: 'active' } as any,
          relations: ['tenant'],
        });

    if (!membership?.tenant || membership.tenant.status !== 'active') return null;

    const isPlatformAdmin = membership.role === 'platform_admin';

    if (expectedFlow && !isPlatformAdmin) {
      const identity = await this.roleResolver.resolveUserRole(session.user.email, requestedTenantId);
      if (!identity.role || !this.roleResolver.validateRoleForFlow(identity.role, expectedFlow)) {
        return null;
      }
    }

    const identity: ResolvedIdentity = {
      tenantId: membership.tenant.id,
      tenantStatus: membership.tenant.status,
      databaseUrl: this.resolveDatabaseUrl({
        databaseName: membership.tenant.databaseName,
        databaseSecretRef: membership.tenant.databaseSecretRef,
      }),
      platformUserId: platformUser.id,
      localUserId: null,
      userRole: membership.role,
      isPlatformAdmin: membership.role === 'platform_admin',
    };

    try {
      const tenantDataSource = await this.createTenantDataSource(identity.tenantId);
      if (tenantDataSource) {
        await tenantDataSource.initialize();
        try {
          const userRepoT = tenantDataSource.getRepository(UserEntity);
          const userRoleRepoT = tenantDataSource.getRepository(UserRoleEntity);
          const roleRepoT = tenantDataSource.getRepository(RoleEntity);

          const user = await userRepoT.findOne({ where: { email: session.user.email } });
          if (user) {
            const userRoles = await userRoleRepoT.find({ where: { userId: user.id } as any });
            for (const ur of userRoles) {
              const role = await roleRepoT.findOne({ where: { id: ur.roleId } });
              if (role?.name) {
                identity.localUserId = user.id;
                identity.userRole = role.name;
                break;
              }
            }
          }
        } finally {
          await tenantDataSource.destroy();
        }
      }
    } catch {
      // Tenant DB may not be provisioned yet; fall back to platform identity.
    }

    this.setCachedIdentity(cacheKey, identity);
    return identity;
  }

  async buildContext(
    headers: Record<string, string | undefined>,
    identity: ResolvedIdentity,
    sessionUserId: string
  ): Promise<RequestContext> {
    const localUserId = identity.localUserId || sessionUserId;
    let staffId: string | undefined;

    if (identity.isPlatformAdmin && !identity.tenantId) {
      return {
        tenantId: '',
        userId: localUserId,
        userRole: identity.userRole,
        databaseUrl: '',
        requestId: headers['x-request-id'] || crypto.randomUUID(),
        ipAddress: headers['x-forwarded-for']?.split(',')[0]?.trim(),
        userAgent: headers['user-agent'],
      };
    }

    if (localUserId && identity.tenantId) {
      try {
        const tenantDataSource = await this.createTenantDataSource(identity.tenantId);
        if (tenantDataSource) {
          await tenantDataSource.initialize();
          try {
            const staffRepo = tenantDataSource.getRepository(StaffProfileEntity);
            const staff = await staffRepo.findOne({
              where: { userId: localUserId, tenantId: identity.tenantId } as any,
            });
            staffId = staff?.id;
          } finally {
            await tenantDataSource.destroy();
          }
        }
      } catch {
        // Staff profile may not exist for this user
      }
    }

    return {
      tenantId: identity.tenantId || '',
      userId: localUserId,
      userRole: identity.userRole,
      staffId,
      databaseUrl: identity.databaseUrl,
      requestId: headers['x-request-id'] || crypto.randomUUID(),
      ipAddress: headers['x-forwarded-for']?.split(',')[0]?.trim(),
      userAgent: headers['user-agent'],
    };
  }

  async resolveRequest(
    headers: Record<string, string | undefined>,
    expectedFlow?: RoleCategory
  ): Promise<{ session: SessionData; context: RequestContext } | null> {
    const session = await this.authService.getSession(new Headers(headers as any));
    if (!session) return null;

    const requestedTenantId = this.getRequestedTenantId(headers, session.user);
    const identity = await this.resolveIdentity(headers, session, requestedTenantId || '', expectedFlow);
    if (!identity) return null;

    if (identity.isPlatformAdmin && !requestedTenantId) {
      return {
        session,
        context: await this.buildContext(headers, identity, session.user.id),
      };
    }

    if (!requestedTenantId) return null;

    return {
      session,
      context: await this.buildContext(headers, identity, session.user.id),
    };
  }

  invalidateIdentityCache(sessionToken?: string): void {
    if (!sessionToken) {
      identityCache.clear();
      return;
    }
    for (const key of identityCache.keys()) {
      if (key.startsWith(`${sessionToken}:`)) identityCache.delete(key);
    }
  }

  async preloadIdentity(headers: Record<string, string | undefined>, tenantId: string): Promise<void> {
    const session = await this.authService.getSession(new Headers(headers as any));
    if (!session) return;

    const cacheKey = `${this.getSessionToken(session)}:${tenantId}`;
    const cached = this.getCachedIdentity(cacheKey);
    if (cached) return;

    const identity = await this.resolveIdentity(headers, session, tenantId);
    if (identity) {
      this.setCachedIdentity(cacheKey, identity);
    }
  }

  async withTenantContext<T>(
    headers: Record<string, string | undefined>,
    callback: (context: RequestContext) => Promise<T>,
    expectedFlow?: RoleCategory
  ): Promise<T | null> {
    const request = await this.resolveRequest(headers, expectedFlow);
    if (!request) return null;

    if (!request.context.tenantId) {
      throw new ForbiddenError(
        'Este recurso requiere un contexto de tenant. Selecciona un tenant o usa un usuario con membresía de tenant.'
      );
    }

    return this.requestContext.runWithContext(request.context, () => callback(request.context));
  }
}
