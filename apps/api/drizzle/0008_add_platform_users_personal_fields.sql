-- Add personal data columns to platform_users
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "last_name" text;
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "document_type" text;
ALTER TABLE "platform_users" ADD COLUMN IF NOT EXISTS "document_number" text;
