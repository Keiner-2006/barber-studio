import { Module } from '@nestjs/common';
import { PublicController } from './adapters/http/public.controller';

@Module({
  controllers: [PublicController],
  providers: [],
})
export class PublicModule {}