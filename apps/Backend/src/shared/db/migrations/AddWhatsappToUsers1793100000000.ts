import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWhatsappToUsers1793100000000 implements MigrationInterface {
  name = 'AddWhatsappToUsers1793100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS whatsapp text`);
    await queryRunner.query(`ALTER TABLE public.platform_users ADD COLUMN IF NOT EXISTS whatsapp text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.platform_users DROP COLUMN IF EXISTS whatsapp`);
    await queryRunner.query(`ALTER TABLE public.users DROP COLUMN IF EXISTS whatsapp`);
  }
}
