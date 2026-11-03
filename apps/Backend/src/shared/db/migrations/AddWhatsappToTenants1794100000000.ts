import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhatsappToTenants1794100000000 implements MigrationInterface {
  name = 'AddWhatsappToTenants1794100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.platform_tenants ADD COLUMN IF NOT EXISTS whatsapp text`,
    );
    await queryRunner.query(
      `ALTER TABLE public.platform_tenants ADD COLUMN IF NOT EXISTS settings jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.platform_tenants DROP COLUMN IF EXISTS settings`,
    );
    await queryRunner.query(
      `ALTER TABLE public.platform_tenants DROP COLUMN IF EXISTS whatsapp`,
    );
  }
}
