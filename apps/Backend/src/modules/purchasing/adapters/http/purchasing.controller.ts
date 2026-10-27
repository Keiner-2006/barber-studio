import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetSuppliersUseCase } from '../../domain/use-cases/get-suppliers.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { ISupplierRepository } from '../../domain/purchasing.domain';
import type { IPurchaseOrderRepository } from '../../domain/purchasing.domain';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';
import { z } from 'zod';

const updateSupplierSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  contactName: z.string().nullable().optional().transform((val) => val ?? undefined),
  email: z.string().email().nullable().optional().transform((val) => val ?? undefined),
  phone: z.string().nullable().optional().transform((val) => val ?? undefined),
  address: z.string().nullable().optional().transform((val) => val ?? undefined),
  notes: z.string().nullable().optional().transform((val) => val ?? undefined),
  active: z.boolean().optional(),
});

@ApiTags('purchasing')
@Controller('purchasing')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class PurchasingController {
  constructor(
    private readonly getSuppliersUseCase: GetSuppliersUseCase,
    @Inject('ISupplierRepository') private readonly supplierRepo: ISupplierRepository,
    @Inject('IPurchaseOrderRepository') private readonly purchaseOrderRepo: IPurchaseOrderRepository,
    @Inject(PLATFORM_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Get('suppliers')
  @Permissions('purchasing:read')
  @ApiOperation({ summary: 'Listar proveedores' })
  @ApiResponse({ status: 200, description: 'Lista de proveedores' })
  async listSuppliers(@RequestContext('tenantId') tenantId: string) {
    const suppliers = await this.getSuppliersUseCase.execute(tenantId);
    return { data: suppliers.map((s) => s.toPlain()) };
  }

  @Get('suppliers/:id')
  @Permissions('purchasing:read')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  @ApiResponse({ status: 200, description: 'Proveedor encontrado' })
  async getSupplierById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const supplier = await this.supplierRepo.findById(tenantId, id);
    if (!supplier) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Proveedor no encontrado' } };
    }
    return { data: supplier.toPlain() };
  }

  @Patch('suppliers/:id')
  @Permissions('purchasing:write')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor actualizado' })
  async updateSupplier(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const parsed = updateSupplierSchema.safeParse(body);
    if (!parsed.success) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() } };
    }
    const supplier = await this.supplierRepo.update(tenantId, id, parsed.data);
    if (!supplier) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Proveedor no encontrado' } };
    }
    return { data: supplier.toPlain() };
  }

  @Delete('suppliers/:id')
  @Permissions('purchasing:write')
  @ApiOperation({ summary: 'Desactivar proveedor' })
  @ApiResponse({ status: 200, description: 'Proveedor desactivado' })
  async deactivateSupplier(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const supplier = await this.supplierRepo.deactivate(tenantId, id);
    if (!supplier) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Proveedor no encontrado' } };
    }
    return { data: supplier.toPlain() };
  }

  @Get('purchase-orders/:id')
  @Permissions('purchasing:read')
  @ApiOperation({ summary: 'Obtener orden de compra por ID' })
  @ApiResponse({ status: 200, description: 'Orden de compra encontrada' })
  async getPurchaseOrderById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const order = await this.purchaseOrderRepo.findById(tenantId, id);
    if (!order) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Orden de compra no encontrada' } };
    }
    return { data: order.toPlain() };
  }

  @Get('purchase-orders/:id/items')
  @Permissions('purchasing:read')
  @ApiOperation({ summary: 'Listar ítems de orden de compra' })
  @ApiResponse({ status: 200, description: 'Ítems de la orden' })
  async getPurchaseOrderItems(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const order = await this.purchaseOrderRepo.findById(tenantId, id);
    if (!order) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Orden de compra no encontrada' } };
    }
    const items = await this.dataSource.query(
      `SELECT id, product_id AS "productId", quantity_ordered AS "quantityOrdered",
              quantity_received AS "quantityReceived", unit_cost AS "unitCost", created_at AS "createdAt"
         FROM purchase_order_items
        WHERE tenant_id = $1 AND order_id = $2
        ORDER BY created_at`,
      [tenantId, id],
    );
    return { data: items };
  }
}
