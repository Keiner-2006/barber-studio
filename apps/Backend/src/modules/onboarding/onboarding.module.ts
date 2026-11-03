import { Module } from '@nestjs/common';
import { OnboardingController } from './adapters/http/onboarding.controller';
import { OnboardingProvisioningService } from './domain/services/onboarding-provisioning.service';

@Module({
  controllers: [OnboardingController],
  providers: [OnboardingProvisioningService],
})
export class OnboardingModule {}
