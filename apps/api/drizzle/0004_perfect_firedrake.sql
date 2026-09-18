CREATE UNIQUE INDEX "appointments_tenant_idempotency_unique" ON "appointments" USING btree ("tenant_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "appointments_tenant_staff_starts_idx" ON "appointments" USING btree ("tenant_id","staff_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_tenant_branch_starts_idx" ON "appointments" USING btree ("tenant_id","branch_id","starts_at");--> statement-breakpoint
CREATE INDEX "appointments_customer_idx" ON "appointments" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cash_sessions_register_open_unique" ON "cash_sessions" USING btree ("tenant_id","cash_register_id") WHERE is_open = true;--> statement-breakpoint
CREATE INDEX "cash_sessions_tenant_register_idx" ON "cash_sessions" USING btree ("tenant_id","cash_register_id");--> statement-breakpoint
CREATE INDEX "cash_transactions_session_idx" ON "cash_transactions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "cash_transactions_tenant_created_idx" ON "cash_transactions" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "services_tenant_active_idx" ON "services" USING btree ("tenant_id","active");--> statement-breakpoint
CREATE INDEX "customers_tenant_created_idx" ON "customers" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "customers_tenant_phone_idx" ON "customers" USING btree ("tenant_id","phone");--> statement-breakpoint
CREATE INDEX "customers_tenant_email_idx" ON "customers" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE UNIQUE INDEX "branch_inventory_branch_product_unique" ON "branch_inventory" USING btree ("branch_id","product_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_tenant_created_idx" ON "inventory_movements" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "inventory_movements_product_idx" ON "inventory_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "inventory_movements_branch_idx" ON "inventory_movements" USING btree ("branch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_tenant_sku_unique" ON "products" USING btree ("tenant_id","sku");--> statement-breakpoint
CREATE INDEX "products_tenant_active_idx" ON "products" USING btree ("tenant_id","active");