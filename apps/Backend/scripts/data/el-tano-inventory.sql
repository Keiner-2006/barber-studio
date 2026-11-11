-- Real product references; costs, suggested prices and quantities are demonstration data in COP.
-- References: https://www.reuzel.com/collections/pomade
-- https://proraso-usa.com/collections/shaving
-- https://wahlusa.com/shop/hair-clipper-blade-oil-4-fl-oz-120-ml-03310-300a
-- This seed preserves existing products and stock. Re-running it never adds stock twice.
BEGIN;
SET LOCAL lock_timeout = '10s';
DO $seed$
DECLARE
  v_tenant uuid := '7151a758-985c-4f4f-bf95-485a4c53ce19';
  v_branch uuid := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  v_actor uuid := 'a363e19e-d95b-431c-baca-abb0317020bc';
  v_product uuid;
  v_inventory uuid;
  v_row record;
  v_products integer := 0;
  v_stocks integer := 0;
BEGIN
  PERFORM 1 FROM platform_tenants WHERE id = v_tenant AND trade_name = 'El Tano' AND status = 'active' AND currency_code = 'COP' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El Tano must be active and use COP'; END IF;
  PERFORM 1 FROM branches WHERE id = v_branch AND tenant_id = v_tenant AND status = 'active' FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Active El Tano branch not found'; END IF;
  PERFORM 1 FROM users WHERE id = v_actor AND tenant_id = v_tenant AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Inventory actor not found in El Tano'; END IF;

  FOR v_row IN SELECT * FROM (VALUES
    ('ET-REU-BLUE-95', 'Reuzel Blue Pomade · 95 g', 'Pomada de fijación fuerte y acabado brillante, soluble en agua.', 'Peinado', 'lata', 58000, 89000, 5, 18),
    ('ET-REU-RED-95', 'Reuzel Red Pomade · 95 g', 'Pomada de fijación media y acabado brillante, soluble en agua.', 'Peinado', 'lata', 56000, 85000, 4, 12),
    ('ET-REU-CLAY-95', 'Reuzel Clay Matte Pomade · 95 g', 'Pomada de arcilla de fijación media y acabado mate.', 'Peinado', 'lata', 62000, 95000, 4, 3),
    ('ET-REU-FIBER-95', 'Reuzel Fiber Pomade · 95 g', 'Pomada de fibras para dar textura y volumen con brillo bajo.', 'Peinado', 'lata', 62000, 95000, 4, 9),
    ('ET-PRO-CREAM-GREEN', 'Proraso Green · crema de afeitar 5.2 oz', 'Crema de afeitar de la línea Refreshing para el servicio de afeitado clásico.', 'Afeitado', 'tubo', 28000, 45000, 4, 16),
    ('ET-PRO-CREAM-WHITE', 'Proraso White · crema de afeitar 5.2 oz', 'Crema de afeitar de la línea Sensitive Skin.', 'Afeitado', 'tubo', 28000, 45000, 3, 8),
    ('ET-PRO-PRESHAVE', 'Proraso Green · crema preafeitado 3.6 oz', 'Crema preafeitado de la línea Refreshing para preparar el servicio.', 'Afeitado', 'frasco', 35000, 55000, 3, 6),
    ('ET-PRO-SOAP-GREEN', 'Proraso Green · jabón de afeitar 5.2 oz', 'Jabón de afeitar en recipiente de la línea Refreshing.', 'Afeitado', 'tarro', 28000, 45000, 3, 10),
    ('ET-PRO-BEARD-OIL', 'Proraso Refresh · aceite para barba 1 fl oz', 'Aceite de cuidado para barba con fragancia Refresh.', 'Cuidado de barba', 'frasco', 45000, 69000, 3, 7),
    ('ET-PRO-BRUSH', 'Proraso · brocha profesional de afeitar', 'Brocha para preparar y aplicar la espuma durante el afeitado.', 'Accesorios', 'unidad', 48000, 75000, 2, 5),
    ('ET-PRO-STONE', 'Proraso · piedra postafeitado', 'Piedra de acabado para el servicio de afeitado.', 'Afeitado', 'unidad', 25000, 39000, 3, 2),
    ('ET-WAHL-OIL-120', 'Wahl · aceite para cuchillas 120 ml', 'Aceite para mantenimiento de cuchillas de máquinas y perfiladoras.', 'Mantenimiento', 'frasco', 18000, 30000, 2, 6)
  ) AS catalog(sku, name, description, category, unit, unit_cost, suggested_price, min_quantity, quantity)
  LOOP
    v_product := NULL;
    INSERT INTO products (tenant_id, sku, name, description, category, unit, unit_cost, suggested_price, min_quantity, active)
    VALUES (v_tenant, v_row.sku, v_row.name, v_row.description, v_row.category, v_row.unit, v_row.unit_cost, v_row.suggested_price, v_row.min_quantity, true)
    ON CONFLICT (tenant_id, sku) DO NOTHING
    RETURNING id INTO v_product;
    -- Only initialize stock for newly created products; never change an existing product's quantities.
    IF v_product IS NOT NULL THEN
      v_products := v_products + 1;
      INSERT INTO branch_inventory (tenant_id, branch_id, product_id, quantity, reserved, average_cost)
      VALUES (v_tenant, v_branch, v_product, v_row.quantity, 0, v_row.unit_cost)
      RETURNING id INTO v_inventory;
      INSERT INTO inventory_movements (tenant_id, branch_id, product_id, type, quantity, unit_cost, reference, actor_id, notes)
      VALUES (v_tenant, v_branch, v_product, 'adjustment', v_row.quantity, v_row.unit_cost,
        'ELTANO-DEMO-INVENTORY-20261111', v_actor, 'Carga de demostración solicitada: existencias y costos de ejemplo; no corresponde a una compra ni genera movimientos de caja.');
      v_stocks := v_stocks + 1;
    END IF;
  END LOOP;
  RAISE NOTICE 'Created % products and % initial stock records for El Tano', v_products, v_stocks;
END;
$seed$;
COMMIT;
