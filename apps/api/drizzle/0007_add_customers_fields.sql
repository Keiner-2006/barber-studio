-- Add missing columns to customers table
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "full_name" text NOT NULL DEFAULT '';
ALTER TABLE "customers" ALTER COLUMN "full_name" DROP DEFAULT;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "birth_date" timestamp with time zone;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;
ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "marketing_consent" boolean NOT NULL DEFAULT false;
