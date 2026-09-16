#!/usr/bin/env bash
#
# seed-barberia.sh — Inserta datos reales típicos de una barbería vía la API REST.
#
# Requisitos:
#   - El API de Navaja debe estar corriendo en $BASE_URL (default: http://localhost:3000)
#   - La autenticación demo debe estar habilitada (DEMO_AUTH=true) o pasar el token
#     de otra forma vía la variable $TOKEN.
#   - Haber ejecutado `pnpm --filter @navaja/api db:seed` al menos una vez para
#     que exista el tenant demo.
#
# Uso:
#   ./scripts/seed-barberia.sh                    # usa base local + token demo
#   BASE_URL=http://localhost:3000 TOKEN=... sh scripts/seed-barberia.sh
#
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
TOKEN="${TOKEN:-navaja-demo-session}"
API="$BASE_URL/api/v1"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
auth_headers() {
  printf -- '-H "Authorization: Bearer %s" -H "x-tenant-id: %s"' "$TOKEN" "$TENANT_ID"
}

curl_post() {
  local path="$1"; shift
  local body="$1"
  eval curl -s -o /dev/null -w '%{http_code}' \
    "$(auth_headers)" \
    -H 'Content-Type: application/json' \
    -X POST "$API$path" \
    -d "$body"
}

# ---------------------------------------------------------------------------
# 1. Resolver tenant y sucursal
# ---------------------------------------------------------------------------
echo "→ Resolviendo tenant..."
tenant_resp=$(curl -s -H "Authorization: Bearer $TOKEN" "$API/tenants/me")
TENANT_ID=$(echo "$tenant_resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['tenant']['id'])")
BRANCH_ID=$(echo "$tenant_resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['branches'][0]['id'])")
CURRENCY=$(echo "$tenant_resp" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['tenant']['currencyCode'])")

if [ -z "$TENANT_ID" ] || [ "$TENANT_ID" = "null" ]; then
  echo "ERROR: no se pudo resolver el tenant. Verifica DEMO_AUTH y que el seed base haya corrido."
  exit 1
fi
echo "  tenant=$TENANT_ID  branch=$BRANCH_ID  currency=$CURRENCY"

# ---------------------------------------------------------------------------
# 2. Categorías de servicios adicionales
# ---------------------------------------------------------------------------
echo "→ Creando categorías de servicios..."

# Categoría "Cuidados Premium" (solo se crea si no existe el nombre)
cat_resp=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/catalog/categories")
has_premium=$(echo "$cat_resp" | python3 -c "
import sys,json
cats = json.load(sys.stdin)['data']
print('yes' if any(c['name']=='Cuidados Premium' for c in cats) else 'no')
" 2>/dev/null || echo no)

if [ "$has_premium" = "no" ]; then
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/catalog/categories" \
    -d '{"name":"Cuidados Premium","description":"Servicios de cuidado facial, manos y pies.","displayOrder":2}'
  echo "  + Cuidados Premium"
fi

# ---------------------------------------------------------------------------
# 3. Servicios adicionales
# ---------------------------------------------------------------------------
echo "→ Creando servicios..."

# Obtener el ID de la categoría "Cuidados Premium"
premium_cat_id=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/catalog/categories" | python3 -c "
import sys,json
cats = json.load(sys.stdin)['data']
for c in cats:
    if c['name']=='Cuidados Premium':
        print(c['id']); break
" 2>/dev/null || echo "")

# Servicios base (categoría "Rituales de barbería") — obtener su ID
base_cat_id=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/catalog/categories" | python3 -c "
import sys,json
cats = json.load(sys.stdin)['data']
for c in cats:
    if c['name']=='Rituales de barbería':
        print(c['id']); break
" 2>/dev/null || echo "")

existing_services=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/catalog/services" | python3 -c "import sys,json; print(' '.join(s['name'] for s in json.load(sys.stdin)['data']))")

create_service() {
  local cat_id="$1" name="$2" desc="$3" dur="$4" price="$5"
  if echo "$existing_services" | grep -qF "$name"; then
    echo "  = $name (ya existe)"
    return 0
  fi
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/catalog/services" \
    -d "{\"categoryId\":\"$cat_id\",\"name\":\"$name\",\"description\":\"$desc\",\"durationMinutes\":$dur,\"priceBase\":\"$price\",\"currency\":\"$CURRENCY\",\"paymentPolicy\":\"none\"}"
  echo "  + $name"
}

if [ -n "$base_cat_id" ] && [ "$base_cat_id" != "None" ]; then
  create_service "$base_cat_id" \
    "Recorte de Barba" \
    "Perfilado y ajuste de barba con tijera y navaja." \
    25 190
  create_service "$base_cat_id" \
    "Arreglo de Caballo de Brienda" \
    "Limpieza y modelado con brieda de afeitar." \
    20 150
fi

if [ -n "$premium_cat_id" ] && [ "$premium_cat_id" != "None" ]; then
  create_service "$premium_cat_id" \
    "Manicura de Barbero" \
    "Corte y lijado de uñas, escala y alisado. Incluye brillo natural." \
    45 320
  create_service "$premium_cat_id" \
    "Tratamiento Facial de Arcilla" \
    "Exfoliación, mascarilla de arcilla y hidratación profunda." \
    50 450
  create_service "$premium_cat_id" \
    "Peinado de Evento" \
    "Peinado formal con fijado de alta resistencia." \
    30 280
fi

# ---------------------------------------------------------------------------
# 4. Productos reales de barbería
# ---------------------------------------------------------------------------
echo "→ Creando productos..."

existing_skus=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/inventory/products" | python3 -c "import sys,json; print(' '.join(p['sku'] for p in json.load(sys.stdin)['data']))")

create_product() {
  local name="$1" sku="$2" category="$3" unit_cost="$4" suggested="$5" min_qty="$6" desc="$7"
  if echo "$existing_skus" | grep -qF "$sku"; then
    echo "  = $sku (ya existe)"
    return 0
  fi
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/inventory/products" \
    -d "{\"name\":\"$name\",\"sku\":\"$sku\",\"description\":\"$desc\",\"category\":\"$category\",\"unit\":\"pieza\",\"unitCost\":\"$unit_cost\",\"suggestedPrice\":\"$suggested\",\"minQuantity\":$min_qty}"
  echo "  + $sku — $name"
}

create_product \
  "Tijeras de barbero profesional" \
  "TIJ-BARBERO-01" \
  "Herramientas" \
  "450" 850 10 \
  "Tijeras de acero inoxidable con mango de madera."

create_product \
  "Afeitadora eléctrica de carga" \
  "AFEIT-EL-01" \
  "Herramientas" \
  "1200" 2200 5 \
  "Afeitadora profesional con base de carga y 3 cabezales."

create_product \
  "Toalla de microfibra premium" \
  "TOALLA-MF-01" \
  "Consumibles" \
  "85" 160 50 \
  "Toalla de microfibra 40x40 cm, ideal para toque final."

create_product \
  "Termo de acero 1L" \
  "TERMO-01" \
  "Accesorios" \
  "320" 580 8 \
  "Termo de acero inoxidable, mantiene temperatura 24h."

create_product \
  "Gel antibacterial barbero" \
  "GEL-AB-01" \
  "Higiene" \
  "120" 240 30 \
  "Gel de manos con aloe vera y extractor de té verde."

create_product \
  "Cera de abejas natural" \
  "CERA-AB-01" \
  "Styling" \
  "95" 180 25 \
  "Cera de abejas con aceite de oliva, fijación media."

create_product \
  "Mascarilla de arcilla blanca" \
  "MASC-AR-01" \
  "Tratamiento" \
  "165" 310 15 \
  "Mascarilla purificante de arcilla blanca y carbón activado."

create_product \
  "Crema de afeitar clásica" \
  "CREMA-AF-01" \
  "Barba" \
  "140" 270 20 \
  "Crema de afeitar en tubo, aroma a menta y romero."

# ---------------------------------------------------------------------------
# 5. Ajustes de inventario (stock inicial) para productos nuevos
# ---------------------------------------------------------------------------
echo "→ Ajustando stock en sucursal..."

# Fetch inventory report to check existing stock (idempotency)
INVENTORY_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/reports/inventory?branchId=$BRANCH_ID")

# Get all products to find IDs of products we just created
ALL_PRODUCTS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/inventory/products")

adjust_stock() {
  local sku="$1" qty="$2"
  local product_id
  product_id=$(echo "$ALL_PRODUCTS_JSON" | python3 -c "
import sys,json
for p in json.load(sys.stdin)['data']:
    if p['sku']=='$sku':
        print(p['id']); break
" 2>/dev/null || echo "")
  if [ -z "$product_id" ] || [ "$product_id" = "None" ]; then
    echo "  ✗ No encontrado: $sku"
    return 0
  fi
  # Skip if stock already set (idempotency)
  local existing_stock
  existing_stock=$(echo "$INVENTORY_JSON" | python3 -c "
import sys,json
for p in json.load(sys.stdin)['data']:
    if p['sku']=='$sku' and p['currentStock'] > 0:
        print('yes'); break
" 2>/dev/null || echo "")
  if [ -n "$existing_stock" ]; then
    echo "  = $sku (stock ya existe)"
    return 0
  fi
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/inventory/adjustments" \
    -d "{\"productId\":\"$product_id\",\"branchId\":\"$BRANCH_ID\",\"type\":\"purchase\",\"quantity\":\"$qty\",\"unitCost\":\"0\",\"reference\":\"SEED-BARBERIA\",\"notes\":\"Inventario inicial de productos de barbería\"}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ok' if 'data' in d else 'fail')" 2>/dev/null
  echo "  ✓ Stock: $sku → $qty unidades"
}

adjust_stock "TIJ-BARBERO-01" 12
adjust_stock "AFEIT-EL-01" 6
adjust_stock "TOALLA-MF-01" 80
adjust_stock "TERMO-01" 10
adjust_stock "GEL-AB-01" 40
adjust_stock "CERA-AB-01" 30
adjust_stock "MASC-AR-01" 20
adjust_stock "CREMA-AF-01" 25

# ---------------------------------------------------------------------------
# 6. Clientes reales
# ---------------------------------------------------------------------------
echo "→ Creando clientes..."
existing_customer_emails=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/customers?limit=100" | python3 -c "import sys,json; print(' '.join(c.get('email','') for c in json.load(sys.stdin).get('data',[])))")

create_customer() {
  local fn="$1" ln="$2" email="$3" phone="$4"
  if echo "$existing_customer_emails" | grep -qF "$email"; then
    echo "  = $email (ya existe)"
    return 0
  fi
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/customers" \
    -d "{\"firstName\":\"$fn\",\"lastName\":\"$ln\",\"email\":\"$email\",\"phone\":\"$phone\"}"
  echo "  + $email"
}

create_customer "Carlos" "Fernández" "carlos.fernandez@example.com" "+52 55 4321 1234"
create_customer "Ana" "Gómez" "ana.gomez@example.com" "+52 55 5566 7788"
create_customer "Raúl" "Castro" "raul.castro@example.com" "+52 55 9876 5432"

# ---------------------------------------------------------------------------
# 7. Proveedores (suppliers)
# ---------------------------------------------------------------------------
echo "→ Creando proveedores..."
SUPPLIERS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/purchasing/suppliers" | python3 -c "import sys,json; d=json.load(sys.stdin); print(json.dumps(d.get('data',[])))" 2>/dev/null || echo "[]")
existing_suppliers=$(echo "$SUPPLIERS_JSON" | python3 -c "import sys,json; print(' '.join(s['name'] for s in json.load(sys.stdin)))" 2>/dev/null || echo "")

create_supplier() {
  local name="$1" contact="$2" email="$3" phone="$4" address="$5"
  local existing_id
  existing_id=$(echo "$SUPPLIERS_JSON" | python3 -c "import sys,json; [print(s['id']) for s in json.load(sys.stdin) if s['name']=='$name']" 2>/dev/null || echo "")
  if [ -n "$existing_id" ]; then
    echo "  = $name (ya existe)" >&2
    echo "$existing_id"
    return 0
  fi
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/purchasing/suppliers" \
    -d "{\"name\":\"$name\",\"contactName\":\"$contact\",\"email\":\"$email\",\"phone\":\"$phone\",\"address\":\"$address\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null
  echo "  + $name" >&2
}

SUPPLIER_DISTRI=$(create_supplier "Distribuidora Navaja" "María López" "maria@distribuidora-navaja.com" "+52 55 1111 2222" "CDMX")
SUPPLIER_BARBER=$(create_supplier "Suministros Barbería Elite" "Carlos Ruiz" "carlos@suminbarberia.com" "+52 55 3333 4444" "Guadalajara")

# ---------------------------------------------------------------------------
# 8. Ordenes de compra (purchase orders) con productos de barbería reales
# ---------------------------------------------------------------------------
echo "→ Creando órdenes de compra..."

# Get product IDs for the items
ALL_PRODUCTS_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/inventory/products")

get_product_id() {
  echo "$ALL_PRODUCTS_JSON" | python3 -c "
import sys,json
for p in json.load(sys.stdin)['data']:
    if p['sku']=='$1':
        print(p['id']); break
" 2>/dev/null || echo ""
}

# Fetch existing POs for idempotency (check by supplierId + notes combo)
EXISTING_PO_JSON=$(curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" "$API/purchasing/purchase-orders")
existing_po_keys=$(echo "$EXISTING_PO_JSON" | python3 -c "
import sys,json
for o in json.load(sys.stdin).get('data',[]):
    print(o.get('supplierId','') + '|' + (o.get('notes','') or ''))
" 2>/dev/null || echo "")

create_purchase_order() {
  local supplier_id="$1" notes="$2" items_json="$3"
  local key="${supplier_id}|${notes}"
  if echo "$existing_po_keys" | grep -qF "$key"; then
    echo "  = $notes (ya existe)"
    return 0
  fi
  curl -s -H "Authorization: Bearer $TOKEN" -H "x-tenant-id: $TENANT_ID" \
    -H 'Content-Type: application/json' -X POST "$API/purchasing/purchase-orders" \
    -d "{\"supplierId\":\"$supplier_id\",\"branchId\":\"$BRANCH_ID\",\"items\":$items_json,\"notes\":\"$notes\"}" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['id'])" 2>/dev/null
  echo "  + Orden creada: $notes"
}

TIJ_ID=$(get_product_id "TIJ-BARBERO-01")
AFEIT_ID=$(get_product_id "AFEIT-EL-01")
TOALLA_ID=$(get_product_id "TOALLA-MF-01")
TERMO_ID=$(get_product_id "TERMO-01")
GEL_ID=$(get_product_id "GEL-AB-01")
CERA_ID=$(get_product_id "CERA-AB-01")
CREMA_ID=$(get_product_id "CREMA-AF-01")

if [ -n "$SUPPLIER_DISTRI" ] && [ "$SUPPLIER_DISTRI" != "None" ]; then
  create_purchase_order "$SUPPLIER_DISTRI" "Reabastecimiento semanal" \
    "[{\"productId\":\"$TIJ_ID\",\"quantityOrdered\":20,\"unitCost\":\"450\"},{\"productId\":\"$AFEIT_ID\",\"quantityOrdered\":5,\"unitCost\":\"1200\"}]"
  create_purchase_order "$SUPPLIER_DISTRI" "Consumibles mensuales" \
    "[{\"productId\":\"$TOALLA_ID\",\"quantityOrdered\":100,\"unitCost\":\"85\"},{\"productId\":\"$GEL_ID\",\"quantityOrdered\":50,\"unitCost\":\"120\"}]"
fi

if [ -n "$SUPPLIER_BARBER" ] && [ "$SUPPLIER_BARBER" != "None" ]; then
  create_purchase_order "$SUPPLIER_BARBER" "Productos de barbería" \
    "[{\"productId\":\"$TERMO_ID\",\"quantityOrdered\":10,\"unitCost\":\"320\"},{\"productId\":\"$CERA_ID\",\"quantityOrdered\":40,\"unitCost\":\"95\"}]"
  create_purchase_order "$SUPPLIER_BARBER" "Productos de belleza" \
    "[{\"productId\":\"$CREMA_ID\",\"quantityOrdered\":30,\"unitCost\":\"140\"},{\"productId\":\"$CERA_ID\",\"quantityOrdered\":20,\"unitCost\":\"95\"}]"
fi

echo ""
echo "✅ Datos de barbería insertados correctamente."
