import { Injectable, Inject } from '@nestjs/common';
import { Repository, type DeepPartial } from 'typeorm';
import { IMediaAssetRepository, MediaAsset, CreateMediaAssetData } from '../../domain/media.domain';
import { MediaAssetEntity } from './media-asset.entity';
import { PLATFORM_DATA_SOURCE } from '../../../../shared/db/database.module';

@Injectable()
export class TypeOrmMediaAssetRepository implements IMediaAssetRepository {
  private get repository(): Repository<MediaAssetEntity> {
    return this.dataSource.getRepository(MediaAssetEntity);
  }

  constructor(
    @Inject(PLATFORM_DATA_SOURCE)
    private readonly dataSource: any,
  ) {}

  async findAll(tenantId: string): Promise<MediaAsset[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(tenantId: string, id: string): Promise<MediaAsset | null> {
    const entity = await this.repository.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async create(tenantId: string, data: CreateMediaAssetData): Promise<MediaAsset> {
    const entity = this.repository.create({
      ...data,
      tenantId,
    } as DeepPartial<MediaAssetEntity>);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: MediaAssetEntity): MediaAsset {
    return new MediaAsset(
      entity.id,
      entity.tenantId,
      entity.type,
      entity.fileName,
      entity.fileSize,
      entity.mimeType,
      entity.url,
      entity.provider,
      entity.providerId,
      entity.metadata,
      entity.createdBy,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}