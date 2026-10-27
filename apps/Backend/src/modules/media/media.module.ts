import { Module } from '@nestjs/common';
import { MediaController } from './adapters/http/media.controller';
import { TypeOrmMediaAssetRepository } from './drivers/persistence/typeorm-media-asset.repository';

@Module({
  controllers: [MediaController],
  providers: [
    TypeOrmMediaAssetRepository,
    {
      provide: 'IMediaAssetRepository',
      useExisting: TypeOrmMediaAssetRepository,
    },
  ],
  exports: [TypeOrmMediaAssetRepository, 'IMediaAssetRepository'],
})
export class MediaModule {}