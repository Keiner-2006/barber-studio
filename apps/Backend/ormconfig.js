const { DataSource } = require('typeorm');

module.exports = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: false,
  entities: ['src/modules/**/drivers/persistence/*.entity.ts'],
  migrations: ['src/shared/db/migrations/*{.ts,.js}'],
  migrationsTableName: 'typeorm_migrations',
});
