import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantContextService } from '../../shared/tenancy/tenant-context.service';
import { RequestContextService } from '../../shared/tenancy/request-context.service';
import { RoleResolverService, RoleCategory } from '../../shared/auth/role-resolver.service';
import { IS_PUBLIC_KEY, PUBLIC_ROUTE_KEY } from '../decorators/public.decorator';
import { EXPECTED_FLOW_KEY } from '../decorators/expected-flow.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantContext: TenantContextService,
    private readonly requestContext: RequestContextService,
    private readonly roleResolver: RoleResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const isPublicRoute = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const headers = this.extractHeaders(request);

    const expectedFlow = this.reflector.getAllAndOverride<RoleCategory>(EXPECTED_FLOW_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    try {
      const result = await this.tenantContext.resolveRequest(headers, expectedFlow);
      if (!result) {
        throw new UnauthorizedException('No autenticado');
      }

      this.requestContext.setContext(result.context);
      (request as any).session = result.session;
      (request as any).user = result.session.user;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('No autenticado');
    }
  }

  private extractHeaders(request: any): Record<string, string | undefined> {
    const headers: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(request.headers)) {
      headers[key.toLowerCase()] = Array.isArray(value) ? value[0] : value;
    }
    return headers;
  }
}