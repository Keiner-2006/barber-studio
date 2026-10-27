import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetBranchesUseCase } from '../../domain/use-cases/get-branches.use-case';
import { CreateBranchUseCase } from '../../domain/use-cases/create-branch.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { z } from 'zod';

const createBranchSchema = z.object({
  code: z.string().min(1, 'Código requerido').max(20),
  name: z.string().min(1, 'Nombre requerido').max(100),
  address: z.string().optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.string().optional(),
});

const updateBranchSchema = createBranchSchema.partial();

@ApiTags('branches')
@Controller('branches')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(
    private readonly getBranchesUseCase: GetBranchesUseCase,
    private readonly createBranchUseCase: CreateBranchUseCase,
  ) {}

  @Get()
  @Permissions('branches:read')
  @ApiOperation({ summary: 'Listar sucursales' })
  @ApiResponse({ status: 200, description: 'Lista de sucursales' })
  async list(@RequestContext('tenantId') tenantId: string) {
    const branches = await this.getBranchesUseCase.execute(tenantId);
    return { data: branches.map((b) => b.toPlain()) };
  }

  @Post()
  @Permissions('branches:write')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear sucursal' })
  @ApiResponse({ status: 201, description: 'Sucursal creada' })
  @ApiResponse({ status: 409, description: 'Código ya existe' })
  async create(
    @RequestContext('tenantId') tenantId: string,
    @Body() body: any,
  ) {
    const parsed = createBranchSchema.safeParse(body);
    if (!parsed.success) {
      return {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos inválidos',
          details: parsed.error.flatten(),
        },
      };
    }

    const branch = await this.createBranchUseCase.execute(tenantId, parsed.data);
    return { data: branch.toPlain() };
  }

  @Get(':id')
  @Permissions('branches:read')
  @ApiOperation({ summary: 'Obtener sucursal por ID' })
  async getById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const branch = await this.getBranchesUseCase.execute(tenantId);
    const found = branch.find((b) => b.id === id);
    if (!found) {
      return {
        error: { code: 'NOT_FOUND', message: 'Sucursal no encontrada' },
        status: HttpStatus.NOT_FOUND,
      };
    }
    return { data: found.toPlain() };
  }
}