import { Inject, Injectable, Logger, UnauthorizedException, ForbiddenException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AUTH_DATA_SOURCE } from '../../../../shared/db/database.module';
import { PlatformTenantEntity, TenantStatusEnum, BusinessTypeEnum } from '../../../auth/drivers/persistence/platform-tenant.entity';
import { PlatformUserEntity, PlatformUserStatusEnum } from '../../../auth/drivers/persistence/platform-user.entity';
import { PlatformMembershipEntity, PlatformMembershipRoleEnum } from '../../../auth/drivers/persistence/platform-membership.entity';
import { TenantProvisioningJobEntity, ProvisioningJobStatusEnum } from '../../../auth/drivers/persistence/tenant-provisioning-job.entity';
import { TenantBrandingEntity } from '../../../auth/drivers/persistence/tenant-branding.entity';
import { CreateOnboardingDto } from '../dtos/create-onboarding.dto';

interface ProvisionResult {
  jobId: string;
  tenantId: string;
  status: string;
}

@Injectable()
export class OnboardingProvisioningService {
  private readonly logger = new Logger(OnboardingProvisioningService.name);

  constructor(
    @Inject(AUTH_DATA_SOURCE) private readonly dataSource: DataSource,
  ) {}

  async provision(dto: CreateOnboardingDto, actorEmail: string, idempotencyKey?: string): Promise<ProvisionResult> {
    if (!actorEmail) {
      throw new UnauthorizedException('Se requiere una sesión autenticada para crear el negocio');
    }

    const actor = await this.dataSource.getRepository(PlatformUserEntity).findOne({ where: { email: actorEmail } });
    if (actor?.status === PlatformUserStatusEnum.BLOCKED) {
      throw new ForbiddenException('Tu cuenta está bloqueada. Contacta al soporte de la plataforma.');
    }
    if (actor) {
      // A SaaS admin onboarding a business would silently become its owner (how admin@saas.com ended up owning El Tano).
      const adminGrants = await this.dataSource.getRepository(PlatformMembershipEntity).count({
        where: { userId: actor.id, role: PlatformMembershipRoleEnum.PLATFORM_ADMIN, status: 'active' },
      });
      if (adminGrants > 0) {
        throw new ForbiddenException('Los administradores de la plataforma no pueden inscribir negocios a su nombre. Usa la consola de plataforma.');
      }
    }

    if (idempotencyKey) {
      const jobRepo = this.dataSource.getRepository(TenantProvisioningJobEntity);
      const existingJob = await jobRepo.findOne({ where: { idempotencyKey } });
      if (existingJob) {
        const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
        const tenant = await tenantRepo.findOne({ where: { id: existingJob.tenantId } });
        return {
          jobId: existingJob.id,
          tenantId: existingJob.tenantId,
          status: tenant ? tenant.status : existingJob.status,
        };
      }
    }

    const tenantRepo = this.dataSource.getRepository(PlatformTenantEntity);
    const slugTaken = await tenantRepo.findOne({ where: { slug: dto.business.slug } });
    if (slugTaken) {
      throw new ConflictException({
        field: 'slug',
        message: 'El slug ya está en uso por otro negocio',
      });
    }

    let result: ProvisionResult;
    try {
      result = await this.dataSource.transaction(async (manager) => {
        const tenantRepoTx = manager.getRepository(PlatformTenantEntity);
        const userRepoTx = manager.getRepository(PlatformUserEntity);
        const membershipRepoTx = manager.getRepository(PlatformMembershipEntity);
        const jobRepoTx = manager.getRepository(TenantProvisioningJobEntity);
        const brandingRepoTx = manager.getRepository(TenantBrandingEntity);

        const tenant = tenantRepoTx.create({
          legalName: dto.business.legalName,
          tradeName: dto.business.tradeName,
          slug: dto.business.slug,
          businessType: dto.business.businessType,
          countryCode: dto.business.countryCode || 'CO',
          timezone: 'America/Bogota',
          currencyCode: 'COP',
          status: TenantStatusEnum.PROVISIONING,
          whatsapp: dto.location.whatsapp || null,
          settings: {
            consentAccepted: dto.consentAccepted,
            schedule: dto.schedule || null,
            branding: dto.branding || null,
            account: {
              name: dto.account.name,
              lastName: dto.account.lastName,
              email: dto.account.email,
              documentType: dto.account.documentType,
              documentNumber: dto.account.documentNumber,
              birthDate: dto.account.birthDate,
              city: dto.account.city,
            },
          },
        });
        const savedTenant = await tenantRepoTx.save(tenant);

        let platformUser = await userRepoTx.findOne({ where: { email: actorEmail } });
        if (!platformUser) {
          platformUser = userRepoTx.create({
            email: actorEmail,
            name: dto.account.name,
            lastName: dto.account.lastName,
            phone: dto.account.phone || null,
            whatsapp: dto.account.whatsapp || null,
            status: PlatformUserStatusEnum.ACTIVE,
            passwordHash: '',
          });
        } else {
          platformUser.name = dto.account.name;
          platformUser.lastName = dto.account.lastName;
          platformUser.phone = dto.account.phone ?? platformUser.phone;
          platformUser.whatsapp = dto.account.whatsapp ?? platformUser.whatsapp;
          // Only an invited user is activated here; never lift a block.
          if (platformUser.status === PlatformUserStatusEnum.INVITED) platformUser.status = PlatformUserStatusEnum.ACTIVE;
        }
        const savedUser = await userRepoTx.save(platformUser);

        const membership = membershipRepoTx.create({
          tenantId: savedTenant.id,
          userId: savedUser.id,
          role: PlatformMembershipRoleEnum.OWNER,
          status: 'active',
        });
        await membershipRepoTx.save(membership);

        if (dto.branding) {
          const socialLinks: Record<string, string> = {};
          if (dto.branding.instagram) {
            socialLinks.instagram = dto.branding.instagram;
          }
          if (dto.branding.tiktok) {
            socialLinks.tiktok = dto.branding.tiktok;
          }
          const branding = brandingRepoTx.create({
            tenantId: savedTenant.id,
            logoUrl: dto.branding.logoUrl || null,
            coverImageUrl: null,
            galleryUrls: null,
            primaryColor: dto.branding.primaryColor || null,
            secondaryColor: null,
            accentColor: null,
            description: dto.business.description || null,
            socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
            publicBookingEnabled: false,
          });
          await brandingRepoTx.save(branding);
        }

        const key = idempotencyKey || `onboarding-${savedTenant.id}`;
        const existingJob = await jobRepoTx.findOne({ where: { idempotencyKey: key } });
        if (existingJob) {
          return {
            jobId: existingJob.id,
            tenantId: savedTenant.id,
            status: existingJob.status,
          };
        }
        const job = jobRepoTx.create({
          tenantId: savedTenant.id,
          idempotencyKey: key,
          status: ProvisioningJobStatusEnum.SUCCEEDED,
          step: 'completed',
          completedAt: new Date(),
        });
        await jobRepoTx.save(job);

        return {
          jobId: job.id,
          tenantId: savedTenant.id,
          status: job.status,
        };
      });
    } catch (error: unknown) {
      if (error instanceof ConflictException || error instanceof UnauthorizedException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error('Error aprovisionando tenant', err.stack);
      throw new InternalServerErrorException('No se pudo completar el aprovisionamiento del negocio');
    }

    return result;
  }
}
