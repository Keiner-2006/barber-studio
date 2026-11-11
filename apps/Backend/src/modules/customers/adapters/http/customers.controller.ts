import {
  Controller,
  Inject,
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
import { DataSource } from 'typeorm';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';
import { ownStaffId } from '../../../../shared/auth/barber-policy';
import { NotFoundError } from '../../../../shared/errors/app-error';

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
    @Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource,
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
    @RequestContext('userRole') userRole?: string,
    @RequestContext('staffId') currentStaffId?: string,
  ) {
    if (userRole === 'barber') {
      return this.barberCustomers(tenantId, ownStaffId(userRole, currentStaffId)!, search);
    }
    if (search) {
      const customers = await this.searchCustomersUseCase.execute(tenantId, search);
      return customers.map((c) => c.toPlain()) ;
    }
    const customers = await this.getCustomersUseCase.execute(tenantId);
    return customers.map((c) => c.toPlain()) ;
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
    return customer.toPlain() ;
  }

  @Get(':id')
  @Permissions('customers:read')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  async getById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
    @RequestContext('userRole') userRole?: string,
    @RequestContext('staffId') currentStaffId?: string,
  ) {
    if (userRole === 'barber') {
      const rows = await this.barberCustomers(tenantId, ownStaffId(userRole, currentStaffId)!, undefined, id);
      if (!rows[0]) throw new NotFoundError('Cliente no encontrado');
      return rows[0];
    }
    const customer = await this.getCustomerByIdUseCase.execute(tenantId, id);
    if (!customer) {
      return { error: { code: 'NOT_FOUND', message: 'Cliente no encontrado' } };
    }
    return customer.toPlain() ;
  }

  private barberCustomers(tenantId: string, staffId: string, search?: string, id?: string) {
    // Only the identity needed to serve assigned customers; no financial/contact/consent data.
    return this.dataSource.query(
      `SELECT c.id, c.first_name AS "firstName", c.last_name AS "lastName", c.full_name AS "fullName"
         FROM customers c
        WHERE c.tenant_id = $1
          AND EXISTS (SELECT 1 FROM appointments a
                       WHERE a.tenant_id = c.tenant_id AND a.customer_id = c.id AND a.staff_id = $2)
          AND ($3::text IS NULL OR c.full_name ILIKE '%' || $3 || '%')
          AND ($4::text IS NULL OR c.id::text = $4)
        ORDER BY c.full_name`,
      [tenantId, staffId, search ?? null, id ?? null],
    );
  }

}