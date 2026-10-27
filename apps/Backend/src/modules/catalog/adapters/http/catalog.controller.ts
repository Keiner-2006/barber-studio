import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetServicesUseCase } from '../../domain/use-cases/get-services.use-case';
import { GetServiceCategoriesUseCase } from '../../domain/use-cases/get-service-categories.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { Inject } from '@nestjs/common';
import type { IServiceRepository } from '../../domain/catalog.domain';
import type { IServiceCategoryRepository } from '../../domain/catalog.domain';

@ApiTags('catalog')
@Controller('catalog')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CatalogController {
  constructor(
    private readonly getServicesUseCase: GetServicesUseCase,
    private readonly getServiceCategoriesUseCase: GetServiceCategoriesUseCase,
    @Inject('IServiceRepository') private readonly serviceRepo: IServiceRepository,
    @Inject('IServiceCategoryRepository') private readonly categoryRepo: IServiceCategoryRepository,
  ) {}

  @Get('categories')
  @Permissions('catalog:read')
  @ApiOperation({ summary: 'Listar categorías de servicios' })
  @ApiResponse({ status: 200, description: 'Lista de categorías' })
  async listCategories(@RequestContext('tenantId') tenantId: string) {
    const categories = await this.getServiceCategoriesUseCase.execute(tenantId);
    return { data: categories.map((c) => c.toPlain()) };
  }

  @Get('categories/:id')
  @Permissions('catalog:read')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  async getCategoryById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const category = await this.categoryRepo.findById(tenantId, id);
    if (!category) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' } };
    }
    return { data: category.toPlain() };
  }

  @Get('services')
  @Permissions('catalog:read')
  @ApiOperation({ summary: 'Listar servicios' })
  @ApiResponse({ status: 200, description: 'Lista de servicios' })
  @ApiQuery({ name: 'categoryId', required: false })
  async listServices(
    @RequestContext('tenantId') tenantId: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const services = await this.getServicesUseCase.execute(tenantId, categoryId);
    return { data: services.map((s) => s.toPlain()) };
  }

  @Get('services/:id')
  @Permissions('catalog:read')
  @ApiOperation({ summary: 'Obtener servicio por ID' })
  @ApiResponse({ status: 200, description: 'Servicio encontrado' })
  async getServiceById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const service = await this.serviceRepo.findById(tenantId, id);
    if (!service) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Servicio no encontrado' } };
    }
    return { data: service.toPlain() };
  }
}
