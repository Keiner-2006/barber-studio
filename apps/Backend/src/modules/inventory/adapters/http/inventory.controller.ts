import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../domain/use-cases/get-products.use-case';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { Inject } from '@nestjs/common';
import type { IProductRepository } from '../../domain/inventory.domain';
import type { IBranchInventoryRepository } from '../../domain/inventory.domain';
import { z } from 'zod';

const adjustInventorySchema = z.object({
  productId: z.string().uuid(),
  branchId: z.string().uuid(),
  type: z.enum(['purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'consumption', 'return']),
  quantity: z.string().regex(/^-?\d+(\.\d{1,3})?$/),
  unitCost: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    @Inject('IProductRepository') private readonly productRepo: IProductRepository,
    @Inject('IBranchInventoryRepository') private readonly branchInventoryRepo: IBranchInventoryRepository,
  ) {}

  @Get('products')
  @Permissions('inventory:read')
  @ApiOperation({ summary: 'Listar productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  async listProducts(@RequestContext('tenantId') tenantId: string) {
    const products = await this.getProductsUseCase.execute(tenantId);
    return { data: products.map((p) => p.toPlain()) };
  }

  @Get('products/:id')
  @Permissions('inventory:read')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  async getProductById(
    @RequestContext('tenantId') tenantId: string,
    @Param('id') id: string,
  ) {
    const product = await this.productRepo.findById(tenantId, id);
    if (!product) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } };
    }
    return { data: product.toPlain() };
  }

  @Post('adjustments')
  @Permissions('inventory:write')
  @ApiOperation({ summary: 'Ajustar inventario' })
  @ApiResponse({ status: 201, description: 'Inventario ajustado' })
  async adjustInventory(
    @RequestContext('tenantId') tenantId: string,
    @RequestContext('userId') userId: string,
    @Body() body: unknown,
  ) {
    const parsed = adjustInventorySchema.safeParse(body);
    if (!parsed.success) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() } };
    }

    const product = await this.productRepo.findById(tenantId, parsed.data.productId);
    if (!product) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Producto no encontrado' } };
    }

    const quantity = parseFloat(parsed.data.quantity);
    const unitCost = parsed.data.unitCost ? parseFloat(parsed.data.unitCost) : product.unitCost;

    // Update or create branch inventory
    let branchInventory = await this.branchInventoryRepo.findByBranchAndProduct(parsed.data.branchId, parsed.data.productId);
    if (!branchInventory) {
      branchInventory = await this.branchInventoryRepo.create({
        tenantId,
        branchId: parsed.data.branchId,
        productId: parsed.data.productId,
        quantity: 0,
        reserved: 0,
      });
    }

    // Calculate new quantity based on movement type
    let newQuantity = branchInventory.quantity;
    if (parsed.data.type === 'purchase' || parsed.data.type === 'transfer_in' || parsed.data.type === 'return') {
      newQuantity += quantity;
    } else if (parsed.data.type === 'sale' || parsed.data.type === 'transfer_out' || parsed.data.type === 'consumption') {
      newQuantity -= quantity;
    } else if (parsed.data.type === 'adjustment') {
      newQuantity = quantity; // adjustment sets absolute quantity
    }

    if (newQuantity < 0) {
      return { error: { code: 'INSUFFICIENT_STOCK', message: 'Stock insuficiente' } };
    }

    await this.branchInventoryRepo.updateQuantity(parsed.data.branchId, parsed.data.productId, newQuantity);

    return {
      data: {
        productId: parsed.data.productId,
        branchId: parsed.data.branchId,
        type: parsed.data.type,
        quantity,
        previousQuantity: branchInventory.quantity,
        newQuantity,
        unitCost,
        reference: parsed.data.reference,
        notes: parsed.data.notes,
        createdBy: userId,
      },
    };
  }
}
