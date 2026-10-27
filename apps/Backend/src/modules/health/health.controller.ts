import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { PLATFORM_DATA_SOURCE } from '../../shared/db/database.module';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@Inject(PLATFORM_DATA_SOURCE) private readonly platformDataSource: DataSource) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('db')
  @ApiOperation({ summary: 'Database health check' })
  async checkDb() {
    try {
      await this.platformDataSource.query('SELECT 1');
      return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
    } catch (error) {
      return { status: 'error', database: 'disconnected', timestamp: new Date().toISOString() };
    }
  }
}
