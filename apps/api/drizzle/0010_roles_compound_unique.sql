-- Change roles.unique_name to composite unique (tenant_id, name)
ALTER TABLE "roles" DROP CONSTRAINT IF EXISTS "roles_name_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "roles_tenant_name_unique" ON "roles" ("tenant_id", "name");
