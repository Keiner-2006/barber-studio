CREATE TYPE "public"."consent_type" AS ENUM('marketing', 'privacy', 'communications');--> statement-breakpoint
CREATE TYPE "public"."business_type" AS ENUM('barberia', 'peluqueria', 'grooming', 'otro');--> statement-breakpoint
ALTER TYPE "public"."platform_membership_role" ADD VALUE 'admin' BEFORE 'platform_support';--> statement-breakpoint
ALTER TYPE "public"."platform_membership_role" ADD VALUE 'reception' BEFORE 'platform_support';--> statement-breakpoint
ALTER TYPE "public"."platform_membership_role" ADD VALUE 'barber' BEFORE 'platform_support';--> statement-breakpoint
ALTER TYPE "public"."platform_membership_role" ADD VALUE 'inventory_manager' BEFORE 'platform_support';--> statement-breakpoint
ALTER TYPE "public"."platform_membership_role" ADD VALUE 'accountant' BEFORE 'platform_support';--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"type" "consent_type" NOT NULL,
	"granted" boolean NOT NULL,
	"source" text,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tenant_branding" (
	"tenant_id" uuid NOT NULL,
	"logo_url" text,
	"cover_image_url" text,
	"gallery_urls" jsonb,
	"primary_color" text,
	"secondary_color" text,
	"accent_color" text,
	"description" text,
	"social_links" jsonb,
	"public_booking_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" text DEFAULT 'cloudinary' NOT NULL,
	"provider_asset_id" text NOT NULL,
	"url" text NOT NULL,
	"secure_url" text,
	"resource_type" text,
	"width" integer,
	"height" integer,
	"alt_text" text,
	"purpose" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ALTER COLUMN "currency" SET DEFAULT 'COP';--> statement-breakpoint
ALTER TABLE "platform_tenants" ALTER COLUMN "country_code" SET DEFAULT 'CO';--> statement-breakpoint
ALTER TABLE "platform_tenants" ALTER COLUMN "timezone" SET DEFAULT 'America/Bogota';--> statement-breakpoint
ALTER TABLE "platform_tenants" ALTER COLUMN "currency_code" SET DEFAULT 'COP';--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "birth_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "marketing_consent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "platform_tenants" ADD COLUMN "business_type" "business_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "platform_tenants" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "platform_users" ADD COLUMN "name" text DEFAULT '' NOT NULL;
ALTER TABLE "platform_users" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "customer_consents" ADD CONSTRAINT "customer_consents_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_branding" ADD CONSTRAINT "tenant_branding_tenant_id_platform_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."platform_tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_media_assets" ADD CONSTRAINT "tenant_media_assets_tenant_id_platform_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."platform_tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");