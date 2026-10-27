import { Module } from '@nestjs/common';
import { AdminController } from './adapters/http/admin.controller';

@Module({
  controllers: [AdminController],
  providers: [],
})
export class AdminModule {}