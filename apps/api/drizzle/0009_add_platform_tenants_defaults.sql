-- Add default values to platform_tenants columns
ALTER TABLE "platform_tenants" ALTER COLUMN "country_code" SET DEFAULT 'CO';
ALTER TABLE "platform_tenants" ALTER COLUMN "timezone" SET DEFAULT 'America/Bogota';
ALTER TABLE "platform_tenants" ALTER COLUMN "currency_code" SET DEFAULT 'COP';
ALTER TABLE "platform_tenants" ALTER COLUMN "locale" SET DEFAULT 'es';