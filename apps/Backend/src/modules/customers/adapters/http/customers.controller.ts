import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetCustomersUseCase } from '../../domain/use-cases/get-customers.use-case';
import { SearchCustomersUseCase } from '../../domain/use-cases/search-customers.use-case';
import { CreateCustomerUseCase } from '../../domain/use-cases/create-customer.use-case';
import { GetCustomerByIdUseCase } from '../../domain/use-cases/get-customer-by-id.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { z } from 'zod';

const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  fullName: z.string().min(1, 'Nombre completo requerido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  document: z.string().optional(),
  birthDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  notes: z.string().optional(),
  preferences: z.string().optional().transform((val) => (val ? JSON.parse(val) : undefined)),
  consents: z.string().optional().transform((val) => (val ? JSON.parse(val) : undefined)),
  marketingConsent: z.boolean().optional(),
});

@ApiTags('customers')
@Controller('customers')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(
    private readonly getCustomersUseCase: GetCustomersUseCase,
    private readonly searchCustomersUseCase: SearchCustomersUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
  ) {}

  @Get()
  @Permissions('customers:read')
  @ApiOperation({ summary: 'Listar clientes' })
  @ApiResponse({ status: 200, description: 'Lista de clientes' })
  @ApiQuery({ name: 'search', required: false })
  async list(
    @RequestContext('tenantId') tenantId: string,
    @Query('search') search?: string,
  ) {
    if (search) {
      const customers = await this.searchCustomersUseCase.execute(tenantId, search);
      return { data: customers.map((c) => c.toPlain()) };
    }
    const customers = await this.getCustomersUseCase.execute(tenantId);
    return { data: customers.map((c) => c.toPlain()) };
  }

  @Post()
  @Permissions('customers:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear cliente' })
  @ApiResponse({ status: 201, description: 'Cliente creado' })
  async create(
    @RequestContext('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const parsed = createCustomerSchema.safeParse(body);
    if (!parsed.success) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          details: parsed.error.flatten(),
        },
      };
    }

    const customer = await this.createCustomerUseCase.execute(tenantId, parsed.data);
    return { data: customer.toPlain() };
  }

  @Get(':id')
  @Permissions('customers:read')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  async getById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const customer = await this.getCustomerByIdUseCase.execute(tenantId, id);
    if (!customer) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' } };
    }
    return { data: customer.toPlain() };
  }
}