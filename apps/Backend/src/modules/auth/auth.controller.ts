import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from '../../shared/auth/auth.service';
import type { Credentials, Registration } from '../../shared/auth/auth.service';
import { RoleResolverService, RoleCategory } from '../../shared/auth/role-resolver.service';
import { RateLimitService } from '../../shared/http/rate-limit.service';
import { Public } from '../../common/decorators/public.decorator';
import { ExpectedFlow } from '../../common/decorators/expected-flow.decorator';
import { ValidationError, UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
  expectedRole: z.enum(['admin', 'company_member', 'owner', 'customer', 'client', 'platform_admin', 'platform_support']).optional(),
  tenantId: z.string().uuid('Tenant ID inválido').optional(),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'Nombre requerido'),
  expectedRole: z.enum(['admin', 'company_member', 'owner', 'customer', 'client', 'platform_admin', 'platform_support']).optional(),
  tenantId: z.string().uuid('Tenant ID inválido').optional(),
});

const COMPANY_MEMBER_FLOWS = ['company_member', 'staff', 'admin'];
const CUSTOMER_FLOWS = ['customer', 'client'];
const PLATFORM_MEMBER_FLOWS = ['platform_admin', 'platform_support'];

function mapExpectedRoleToFlow(expectedRole: string): RoleCategory | null {
  if (COMPANY_MEMBER_FLOWS.includes(expectedRole.toLowerCase())) return 'company_member';
  if (CUSTOMER_FLOWS.includes(expectedRole.toLowerCase())) return 'customer';
  if (PLATFORM_MEMBER_FLOWS.includes(expectedRole.toLowerCase())) return 'platform_member';
  return null;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly roleResolver: RoleResolverService,
    private readonly rateLimit: RateLimitService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ schema: { example: { email: 'user@example.com', password: 'password123', expectedRole: 'company_member' } } })
  @ApiResponse({ status: 200, description: 'Login exitoso' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @ApiResponse({ status: 403, description: 'Rol no coincide con el flujo esperado' })
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

    if (process.env.NODE_ENV !== 'development') {
      const rateLimitKey = `${email}:${req.headers['x-forwarded-for'] || req.ip || 'unknown'}`;
      if (!this.rateLimit.checkLoginRateLimit(rateLimitKey)) {
        res.setHeader('Retry-After', '900');
        throw new UnauthorizedError('Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.');
      }
    }

    if (expectedRole) {
      const expectedFlow = mapExpectedRoleToFlow(expectedRole);
      if (!expectedFlow) {
        throw new ValidationError(`expectedRole inválido: ${expectedRole}. Use 'company_member' o 'customer'.`);
      }

      const identity = await this.roleResolver.resolveUserRole(email, tenantId);
      if (!identity.role) {
        throw new UnauthorizedError('Usuario no encontrado');
      }

      if (!this.roleResolver.validateRoleForFlow(identity.role, expectedFlow)) {
        const targetType = expectedFlow === 'customer' ? 'cliente' : expectedFlow === 'platform_member' ? 'administrador de plataforma' : 'miembro de la empresa';
        throw new ForbiddenError(`Estas credenciales no corresponden a un ${targetType}. Utiliza el flujo de ${expectedFlow === 'customer' ? 'cliente' : expectedFlow === 'platform_member' ? 'plataforma' : 'administrador'}.`);
      }
    }

    const result = await this.authService.signIn({ email, password }, new Headers(req.headers as any));

    if (process.env.NODE_ENV !== 'development') {
      const rateLimitKey = `${email}:${req.headers['x-forwarded-for'] || req.ip || 'unknown'}`;
      this.rateLimit.resetLoginAttempts(rateLimitKey);
    }

    return {
      user: result.user,
      session: result.session,
      redirect: result.redirect,
    };
  }

  @Post('register')
  @Public()
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

    const { email, password, name, expectedRole, tenantId } = parsed.data;

    if (expectedRole) {
      const expectedFlow = mapExpectedRoleToFlow(expectedRole);
      if (!expectedFlow) {
        throw new ValidationError(`expectedRole inválido: ${expectedRole}. Use 'company_member' o 'customer'.`);
      }
    }

    const result = await this.authService.signUp({ email, password, name }, new Headers(req.headers as any));

    return {
      user: result.user,
      session: result.session,
    };
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Req() req: Request) {
    await this.authService.signOut(new Headers(req.headers as any));
    return { success: true };
  }

  @Get('session')
  @Public()
  @ApiOperation({ summary: 'Obtener sesión actual' })
  async session(@Req() req: Request) {
    const session = await this.authService.getSession(new Headers(req.headers as any));
    if (!session) {
      return { user: null, session: null };
    }
    return { user: session.user, session: session.session };
  }
}