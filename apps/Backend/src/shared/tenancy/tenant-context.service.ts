import { Injectable, Inject, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { PLATFORM_DATA_SOURCE, AUTH_DATA_SOURCE } from '../db/database.module';
import { RequestContextService, RequestContext } from './request-context.service';
import { RoleResolverService, RoleCategory, TenantRequiredError } from '../auth/role-resolver.service';
import { AuthService } from '../auth/auth.service';
import { ForbiddenError } from '../errors/app-error';
import crypto from 'crypto';
import { PlatformUserEntity } from '../../modules/auth/drivers/persistence/platform-user.entity';
import { PlatformMembershipEntity } from '../../modules/auth/drivers/persistence/platform-membership.entity';

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

  constructor(
    @Inject(PLATFORM_DATA_SOURCE) private readonly platformDataSource: DataSource,
    @Inject(AUTH_DATA_SOURCE) private readonly authDataSource: DataSource,
    private readonly requestContext: RequestContextService,
    private readonly roleResolver: RoleResolverService,
    private readonly authService: AuthService,
  ) {
    this.platformUserRepo = this.authDataSource.getRepository(PlatformUserEntity);
    this.platformMembershipRepo = this.authDataSource.getRepository(PlatformMembershipEntity);
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

  async resolveIdentity(
    headers: Record<string, string | undefined>,
    session: SessionData,
    requestedTenantId: string,
    expectedFlow?: RoleCategory
  ): Promise<ResolvedIdentity | null> {
    const cacheKey = `${this.getSessionToken(session)}:${requestedTenantId || '*'}:${expectedFlow || '*'}`;
    const cached = this.getCachedIdentity(cacheKey);
    if (cached) return cached;

    const platformUser = await this.platformUserRepo.findOne({ where: { email: session.user.email } });
    if (!platformUser || platformUser.status !== 'active') return null;

    const memberships = await this.platformMembershipRepo.find({
      where: { userId: platformUser.id, status: 'active' } as any,
      relations: ['tenant'],
    });

    // Global platform admin (spec D1, option A): an ACTIVE platform_admin grant with tenant_id NULL.
    if (memberships.some((m) => m.role === 'platform_admin' && !m.tenantId)) {
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

    // Deterministic tenant membership (spec D2): never "pick first" when several tenants match.
    const candidates = memberships.filter(
      (m) =>
        !!m.tenantId &&
        m.tenant?.status === 'active' &&
        (!requestedTenantId || m.tenantId === requestedTenantId) &&
        (!expectedFlow || this.roleResolver.validateRoleForFlow(m.role, expectedFlow)),
    );
    if (candidates.length > 1) throw new TenantRequiredError();
    const membership = candidates[0];
    if (!membership) return null;

    // Dedicated tenant databases are not supported yet (the old path used hard-coded postgres/postgres
    // credentials). Refuse instead of silently reading the shared database for such a tenant.
    if (membership.tenant.databaseHost || membership.tenant.databaseName) {
      this.logger.error(`Tenant ${membership.tenant.id} points to a dedicated database; dedicated DBs are not supported yet`);
      throw new ForbiddenError('Este negocio no está disponible temporalmente.');
    }

    const localUsers = await this.platformDataSource.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND lower(email) = lower($2) AND status = 'active'`,
      [membership.tenant.id, session.user.email],
    );
    if (localUsers.length > 1) throw new ForbiddenError('Identidad de usuario ambigua');

    const identity: ResolvedIdentity = {
      tenantId: membership.tenant.id,
      tenantStatus: membership.tenant.status,
      databaseUrl: this.resolveDatabaseUrl({
        databaseName: membership.tenant.databaseName,
        databaseSecretRef: membership.tenant.databaseSecretRef,
      }),
      platformUserId: platformUser.id,
      localUserId: localUsers[0]?.id ?? null,
      userRole: membership.role,
      isPlatformAdmin: false,
    };

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
    if (identity.userRole === 'barber') {
      if (!identity.localUserId) throw new ForbiddenError('No tienes un usuario activo en este negocio');
      const profiles = await this.platformDataSource.query(
        `SELECT id FROM staff_profiles WHERE tenant_id = $1 AND user_id = $2 AND status = 'active'`,
        [identity.tenantId, identity.localUserId],
      );
      if (profiles.length !== 1) throw new ForbiddenError('No tienes un perfil de barbero activo y único en este negocio');
      staffId = profiles[0].id;
    }

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
    const session = await this.authService.getSession(new globalThis.Headers(headers as any));
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

    // Allow resolving without explicit x-tenant-id when identity resolved a tenant (e.g. single membership / tenants/me)
    const effectiveTenantId = requestedTenantId || identity.tenantId || '';
    if (!effectiveTenantId && !identity.isPlatformAdmin) return null;

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
    const session = await this.authService.getSession(new globalThis.Headers(headers as any));
    if (!session) return;

    const cacheKey = `${this.getSessionToken(session)}:${tenantId}:*`;
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
