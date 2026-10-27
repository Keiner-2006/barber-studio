import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../../../common/guards/auth.guard';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { Permissions } from '../../../../common/decorators/permissions.decorator';
import { RequestContext } from '../../../../common/decorators/request-context.decorator';
import { Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity } from '../../../../modules/auth/drivers/persistence/platform-tenant.entity';
import type { IMediaAssetRepository } from '../../domain/media.domain';
import { z } from 'zod';

const mediaSignatureSchema = z.object({
  fileName: z.string().min(1),
  fileSize: z.string().regex(/^\d+$/),
  mimeType: z.string(),
  type: z.enum(['image', 'video', 'document', 'signature']),
});

@ApiTags('media')
@Controller('media')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class MediaController {
  constructor(
    @Inject('IMediaAssetRepository') private readonly mediaRepo: IMediaAssetRepository,
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  @Get('assets')
  @Permissions('media:read')
  @ApiOperation({ summary: 'Listar activos multimedia' })
  @ApiResponse({ status: 200, description: 'Lista de activos multimedia' })
  async listAssets(@RequestContext('tenantId') tenantId: string) {
    const assets = await this.mediaRepo.findAll(tenantId);
    return { data: assets.map((a) => a.toPlain()) };
  }

  @Post('signature')
  @Permissions('media:write')
  @ApiOperation({ summary: 'Generar firma para subida de archivo' })
  @ApiResponse({ status: 200, description: 'Firma generada' })
  async getUploadSignature(@RequestContext('tenantId') tenantId: string, @Body() body: unknown) {
    const parsed = mediaSignatureSchema.safeParse(body);
    if (!parsed.success) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() } };
    }

    // Generate a signed URL for direct upload (placeholder - integrate with actual storage provider)
    const uploadId = randomUUID();
    return {
      data: {
        uploadId,
        uploadUrl: `/api/v1/media/upload/${uploadId}`,
        fields: {
          tenantId,
          fileName: parsed.data.fileName,
          mimeType: parsed.data.mimeType,
          type: parsed.data.type,
        },
        expiresIn: 3600,
      },
    };
  }

  @Get('upload/:uploadId')
  @Permissions('media:write')
  @ApiOperation({ summary: 'Obtener URL de subida' })
  @ApiResponse({ status: 200, description: 'URL de subida' })
  async getUploadUrl(@Param('uploadId') uploadId: string) {
    return { data: { uploadId, url: `/api/v1/media/upload/${uploadId}` } };
  }

  @Post('upload/:uploadId')
  @Permissions('media:write')
  @ApiOperation({ summary: 'Registrar archivo subido' })
  @ApiResponse({ status: 201, description: 'Archivo registrado' })
  async registerUploadedMedia(
    @RequestContext('tenantId') tenantId: string,
    @RequestContext('userId') userId: string,
    @Param('uploadId') uploadId: string,
    @Body() body: unknown,
  ) {
    const schema = z.object({
      fileName: z.string(),
      fileSize: z.string().regex(/^\d+$/),
      mimeType: z.string(),
      type: z.enum(['image', 'video', 'document', 'signature']),
      url: z.string().url(),
      provider: z.string().optional(),
      providerId: z.string().optional(),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return { error: { code: 'VALIDATION_ERROR', message: 'Datos inválidos', details: parsed.error.flatten() } };
    }

    const media = await this.mediaRepo.create(tenantId, {
      type: parsed.data.type,
      fileName: parsed.data.fileName,
      fileSize: parseInt(parsed.data.fileSize),
      mimeType: parsed.data.mimeType,
      url: parsed.data.url,
      provider: parsed.data.provider || 'local',
      providerId: parsed.data.providerId || uploadId,
      createdBy: userId,
    });

    return { data: media.toPlain() };
  }

  @Get('tenants/me')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Obtener tenant del usuario actual' })
  @ApiResponse({ status: 200, description: 'Información del tenant' })
  async getMyTenant(@RequestContext('tenantId') tenantId: string) {
    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const tenant = await tenantRepo.findOne({ where: { id: tenantId } });

    if (!tenant) {
      return { data: null, error: { code: 'NOT_FOUND', message: 'Tenant no encontrado' } };
    }

    return { data: {
      id: tenant.id,
      legalName: tenant.legalName,
      tradeName: tenant.tradeName,
      slug: tenant.slug,
      status: tenant.status,
      countryCode: tenant.countryCode,
      currencyCode: tenant.currencyCode,
      timezone: tenant.timezone,
      createdAt: tenant.createdAt,
    }};
  }
}
