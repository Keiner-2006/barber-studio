import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Req,
  Res,
  HttpStatus,
  HttpCode,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { z } from 'zod';
import { AuthService } from '../../shared/auth/auth.service';
import { RoleResolverService } from '../../shared/auth/role-resolver.service';
import { RateLimitService } from '../../shared/http/rate-limit.service';
import { ValidationError, UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error';
import { Public } from '../../common/decorators/public.decorator';
import { RawResponse } from '../../common/decorators/raw-response.decorator';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  expectedRole: z.enum(['admin', 'company_member', 'owner', 'customer', 'client', 'platform_admin', 'platform_support']).optional(),
  tenantId: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  expectedRole: z.enum(['admin', 'company_member', 'owner', 'customer', 'client', 'platform_admin', 'platform_support']).optional(),
  tenantId: z.string().optional(),
});

const PLATFORM_MEMBER_FLOWS = ['platform_admin', 'platform_support'];

function mapExpectedRoleToFlow(expectedRole?: string): 'company_member' | 'customer' | 'platform_member' | null {
  if (!expectedRole) return null;
  const r = expectedRole.toLowerCase();
  if (PLATFORM_MEMBER_FLOWS.includes(r)) return 'platform_member';
  if (r === 'customer' || r === 'client') return 'customer';
  return 'company_member';
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly roleResolver: RoleResolverService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post('login')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ schema: { example: { email: 'user@example.com', password: 'password123', expectedRole: 'company_member' } } })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 403, description: 'Acceso no autorizado para el flujo solicitado' })
  @ApiResponse({ status: 429, description: 'Demasiados intentos' })
  async login(
    @Body() body: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Datos de entrada inválidos', parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })));
    }

    const { email, password, expectedRole, tenantId } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    if (expectedRole && !mapExpectedRoleToFlow(expectedRole)) {
      throw new ValidationError(`expectedRole inválido: ${expectedRole}.`);
    }

    const isDev = process.env.NODE_ENV === 'development';
    const rateLimitKey = `${normalizedEmail}:${req.headers['x-forwarded-for'] || req.ip || 'unknown'}`;
    if (!isDev && !this.rateLimit.checkLoginRateLimit(rateLimitKey)) {
      res.setHeader('Retry-After', '900');
      throw new UnauthorizedError('Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.');
    }

    // 1) Authenticate credentials first (prevents role-based enumeration)
    let result: Awaited<ReturnType<AuthService['signIn']>>;
    try {
      result = await this.authService.signIn({ email: normalizedEmail, password }, new globalThis.Headers(req.headers as any));
    } catch (err: any) {
      // Normalize BetterAuth / provider errors to a generic 401 (no user/role leakage)
      const status = err?.status ?? err?.statusCode ?? err?.response?.status;
      const code = err?.code ?? err?.body?.code;
      if (status === 401 || status === 400 || code === 'INVALID_EMAIL_OR_PASSWORD' || code === 'INVALID_PASSWORD' || code === 'USER_NOT_FOUND') {
        throw new UnauthorizedError('Credenciales inválidas');
      }
      this.logger.warn(`Login auth error for ${normalizedEmail}: ${err?.message ?? err}`);
      throw new UnauthorizedError('Credenciales inválidas');
    }
    if (!result?.user || !result?.session) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const expectedFlow = expectedRole ? mapExpectedRoleToFlow(expectedRole) : null;
    const resolvedRole = expectedFlow
      ? await this.roleResolver.resolveUserRole(normalizedEmail, tenantId, expectedFlow)
      : null;
    if (expectedFlow && (
      !resolvedRole?.role ||
      !this.roleResolver.validateRoleForFlow(resolvedRole.role, expectedFlow)
    )) {
      throw new ForbiddenError('Acceso no autorizado para el flujo solicitado');
    }

    if (!isDev) this.rateLimit.resetLoginAttempts(rateLimitKey);

    return {
      user: resolvedRole?.role ? { ...result.user, role: resolvedRole.role } : result.user,
      session: result.session,
      redirect: result.redirect,
    };
  }

  @Post('register')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar usuario' })
  @ApiBody({ schema: { example: { email: 'user@example.com', password: 'password123', name: 'John Doe' } } })
  async register(
    @Body() body: any,
    @Req() req: Request,
  ) {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError('Datos de entrada inválidos', parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      })));
    }

    const { email, password, name, expectedRole } = parsed.data;
    if (expectedRole && !mapExpectedRoleToFlow(expectedRole)) {
      throw new ValidationError(`expectedRole inválido: ${expectedRole}.`);
    }

    const result = await this.authService.signUp({ email: email.trim().toLowerCase(), password, name }, new globalThis.Headers(req.headers as any));
    return {
      user: result.user,
      session: result.session,
    };
  }

  @Post('logout')
  @Public()
  @RawResponse()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Req() req: Request) {
    await this.authService.signOut(new globalThis.Headers(req.headers as any));
    return { success: true };
  }

  @Get('session')
  @Public()
  @RawResponse()
  @ApiOperation({ summary: 'Obtener sesión actual' })
  async session(@Req() req: Request) {
    const session = await this.authService.getSession(new globalThis.Headers(req.headers as any));
    if (!session) {
      return { user: null, session: null };
    }
    return { user: session.user, session: session.session };
  }
}
