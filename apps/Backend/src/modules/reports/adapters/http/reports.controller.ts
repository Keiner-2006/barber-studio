import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { ReportsService } from '../../reports.service';

@ApiTags('reports')
@Controller('reports')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte de ventas' })
  @ApiResponse({ status: 200, description: 'Reporte de ventas' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getSales(
    @RequestContext('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.reportsService.getSales(
      tenantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return { data: result };
  }

  @Get('cash')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte de caja' })
  @ApiResponse({ status: 200, description: 'Reporte de caja' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getCash(
    @RequestContext('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.reportsService.getCash(
      tenantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return { data: result };
  }

  @Get('inventory')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte de inventario' })
  @ApiResponse({ status: 200, description: 'Reporte de inventario' })
  async getInventory(@RequestContext('tenantId') tenantId: string) {
    const result = await this.reportsService.getInventory(tenantId);
    return { data: result };
  }

  @Get('occupancy')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte de ocupación' })
  @ApiResponse({ status: 200, description: 'Reporte de ocupación' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getOccupancy(
    @RequestContext('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.reportsService.getOccupancy(
      tenantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return { data: result };
  }

  @Get('services')
  @Permissions('reports:read')
  @ApiOperation({ summary: 'Reporte de servicios' })
  @ApiResponse({ status: 200, description: 'Reporte de servicios' })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  async getServices(
    @RequestContext('tenantId') tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const result = await this.reportsService.getServices(
      tenantId,
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
    return { data: result };
  }
}
