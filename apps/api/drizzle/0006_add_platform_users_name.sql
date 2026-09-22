-- Add name column to platform_users if missing (migration 0005 failed silently)
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "name" text DEFAULT '' NOT NULL;
ALTER TABLE "platform_users" ALTER COLUMN "name" DROP DEFAULT;
