import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  platform: {
    url: process.env.DATABASE_INTERNAL_URL || process.env.PLATFORM_DATABASE_URL || process.env.DATABASE_URL || '',
    schema: process.env.DB_SCHEMA || 'public',
    ssl: process.env.DB_SSL !== 'false',
  },
  auth: {
    url: process.env.DATABASE_INTERNAL_URL || process.env.AUTH_DATABASE_URL || process.env.PLATFORM_DATABASE_URL || process.env.DATABASE_URL || '',
    schema: process.env.AUTH_DB_SCHEMA || process.env.DB_SCHEMA || 'public',
    ssl: process.env.AUTH_DB_SSL !== 'false' && process.env.DB_SSL !== 'false',
  },
}));