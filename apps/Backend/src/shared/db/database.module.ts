import { Module, Global, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService, ConfigType } from '@nestjs/config';
import databaseConfig from '../../config/database.config';

// Platform entities (tenant-scoped)
import { BranchEntity } from '../../modules/branches/drivers/persistence/branch.entity';
import { StaffProfileEntity } from '../../modules/branches/drivers/persistence/staff-profile.entity';
import { ServiceCategoryEntity } from '../../modules/catalog/drivers/persistence/service-category.entity';
import { ServiceEntity } from '../../modules/catalog/drivers/persistence/service.entity';
import { CustomerEntity } from '../../modules/customers/drivers/persistence/customer.entity';
import { AppointmentEntity } from '../../modules/appointments/drivers/persistence/appointment.entity';
import { AppointmentPaymentEntity } from '../../modules/appointments/drivers/persistence/appointment-payment.entity';
import { ProductEntity } from '../../modules/inventory/drivers/persistence/product.entity';
import { BranchInventoryEntity } from '../../modules/inventory/drivers/persistence/branch-inventory.entity';
import { InventoryMovementEntity } from '../../modules/inventory/drivers/persistence/inventory-movement.entity';
import { CashRegisterEntity } from '../../modules/cash/drivers/persistence/cash-register.entity';
import { CashTransactionEntity } from '../../modules/cash/drivers/persistence/cash-transaction.entity';
import { SupplierEntity } from '../../modules/purchasing/drivers/persistence/supplier.entity';
import { PurchaseOrderEntity } from '../../modules/purchasing/drivers/persistence/purchase-order.entity';
import { PurchaseOrderItemEntity } from '../../modules/purchasing/drivers/persistence/purchase-order-item.entity';
import { MediaAssetEntity } from '../../modules/media/drivers/persistence/media-asset.entity';
import { CustomerConsentEntity } from '../../modules/auth/drivers/persistence/customer-consent.entity';
import { PromotionEntity } from '../../modules/auth/drivers/persistence/promotion.entity';
import { UserEntity } from '../../modules/auth/drivers/persistence/user.entity';
import { RoleEntity } from '../../modules/auth/drivers/persistence/role.entity';
import { UserRoleEntity } from '../../modules/auth/drivers/persistence/user-role.entity';

// Auth entities (platform-scoped)
import { PlatformTenantEntity } from '../../modules/auth/drivers/persistence/platform-tenant.entity';
import { PlatformUserEntity } from '../../modules/auth/drivers/persistence/platform-user.entity';
import { PlatformMembershipEntity } from '../../modules/auth/drivers/persistence/platform-membership.entity';
import { TenantProvisioningJobEntity } from '../../modules/auth/drivers/persistence/tenant-provisioning-job.entity';
import { PlatformSessionEntity } from '../../modules/auth/drivers/persistence/platform-session.entity';
import { PlatformAuditEventEntity } from '../../modules/auth/drivers/persistence/platform-audit-event.entity';
import { TenantBrandingEntity } from '../../modules/auth/drivers/persistence/tenant-branding.entity';
import { TenantMediaAssetEntity } from '../../modules/auth/drivers/persistence/tenant-media-asset.entity';

export const PLATFORM_DATA_SOURCE = Symbol('PLATFORM_DATA_SOURCE');
export const AUTH_DATA_SOURCE = Symbol('AUTH_DATA_SOURCE');

const platformEntities = [
  BranchEntity,
  StaffProfileEntity,
  ServiceCategoryEntity,
  ServiceEntity,
  CustomerEntity,
  AppointmentEntity,
  AppointmentPaymentEntity,
  ProductEntity,
  BranchInventoryEntity,
  InventoryMovementEntity,
  CashRegisterEntity,
  CashTransactionEntity,
  SupplierEntity,
  PurchaseOrderEntity,
  PurchaseOrderItemEntity,
  MediaAssetEntity,
  CustomerConsentEntity,
  PromotionEntity,
  UserEntity,
  RoleEntity,
  UserRoleEntity,
];

const authEntities = [
  PlatformTenantEntity,
  PlatformUserEntity,
  PlatformMembershipEntity,
  TenantProvisioningJobEntity,
  PlatformSessionEntity,
  PlatformAuditEventEntity,
  TenantBrandingEntity,
  TenantMediaAssetEntity,
];

function createDataSourceOptions(config: ConfigType<typeof databaseConfig>, type: 'platform' | 'auth'): DataSourceOptions {
  const dbConfig = config[type];
  if (!dbConfig.url) {
    throw new Error('DATABASE_URL or PLATFORM_DATABASE_URL must be configured');
  }
  return {
    type: 'postgres',
    url: dbConfig.url,
    schema: dbConfig.schema,
    ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
    entities: type === 'platform' ? platformEntities : authEntities,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    migrationsTableName: 'typeorm_migrations',
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
  };
}

@Global()
@Module({
  providers: [
    {
      provide: PLATFORM_DATA_SOURCE,
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<ConfigType<typeof databaseConfig>>('database');
        if (!config) throw new Error('Database configuration is missing');
        const dataSource = new DataSource(createDataSourceOptions(config, 'platform'));
        await dataSource.initialize();
        return dataSource;
      },
      inject: [ConfigService],
    },
    {
      provide: AUTH_DATA_SOURCE,
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<ConfigType<typeof databaseConfig>>('database');
        if (!config) throw new Error('Database configuration is missing');
        const dataSource = new DataSource(createDataSourceOptions(config, 'auth'));
        await dataSource.initialize();
        return dataSource;
      },
      inject: [ConfigService],
    },
  ],
  exports: [PLATFORM_DATA_SOURCE, AUTH_DATA_SOURCE],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor() {}

  async onModuleInit() {
    // DataSources are initialized in the factory
  }

  async onModuleDestroy() {
    // DataSources will be destroyed when the module is destroyed
  }
}

export type PlatformDataSource = DataSource;
export type AuthDataSource = DataSource;