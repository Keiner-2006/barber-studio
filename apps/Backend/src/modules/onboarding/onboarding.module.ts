import { Module } from '@nestjs/common';
import { OnboardingController } from './adapters/http/onboarding.controller';

@Module({
  controllers: [OnboardingController],
  providers: [],
})
export class OnboardingModule {}