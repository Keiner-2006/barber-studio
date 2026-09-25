import 'dotenv/config'
import { eq, and } from 'drizzle-orm'
import { getPlatformDb } from './index'
import {
  platformTenants,
  platformUsers,
  platformMemberships,
} from './schema/platform-schema'
import { signUp } from '@/shared/auth/config'
import {
  branches,
  users,
  roles,
  userRoles,
  userBranches,
  staffProfiles,
  staffServices,
  staffSchedules,
  serviceCategories,
  services,
  branchServices,
  customers,
  appointments,
  products,
  branchInventory,
  inventoryMovements,
  cashRegisters,
  cashSessions,
  cashTransactions,
} from './schema'

const DEMO_TENANT_SLUG = 'navaja-demo'
const ADMIN_EMAIL = 'admin@navaja.local'
const APP_EMAIL = 'app@navaja.local'
const PLATFORM_ADMIN_EMAIL = 'adminbarbershop@gmail.com'

async function seed() {
  const db = getPlatformDb()

  const [tenant] = await db
    .insert(platformTenants)
    .values({
      legalName: 'Navaja Studio Demo S.A. de C.V.',
      tradeName: 'Navaja Studio Demo',
      slug: DEMO_TENANT_SLUG,
      businessType: 'barberia',
      status: 'active',
      countryCode: 'CO',
      timezone: 'America/Bogota',
      currencyCode: 'COP',
      locale: 'es',
      databaseName: process.env.TENANT_DATABASE_NAME || 'navaja_db',
      schemaVersion: '0000',
    })
    .onConflictDoUpdate({
      target: platformTenants.slug,
      set: { status: 'active', updatedAt: new Date() },
    })
    .returning()

  const [platformAdmin] = await db
    .insert(platformUsers)
    .values({ email: ADMIN_EMAIL, name: 'Administrador Navaja', passwordHash: 'seed-managed-by-auth', status: 'active' })
    .onConflictDoNothing({ target: platformUsers.email })
    .returning()
  const [platformApp] = await db
    .insert(platformUsers)
    .values({ email: APP_EMAIL, name: 'Usuario App', passwordHash: 'seed-managed-by-auth', status: 'active' })
    .onConflictDoNothing({ target: platformUsers.email })
    .returning()
  const [platformSuperAdmin] = await db
    .insert(platformUsers)
    .values({ email: PLATFORM_ADMIN_EMAIL, name: 'Super Administrador Plataforma', passwordHash: 'seed-managed-by-auth', status: 'active' })
    .onConflictDoNothing({ target: platformUsers.email })
    .returning()

  const adminPlatformUser = platformAdmin || await db.query.platformUsers.findFirst({ where: eq(platformUsers.email, ADMIN_EMAIL) })
  const appPlatformUser = platformApp || await db.query.platformUsers.findFirst({ where: eq(platformUsers.email, APP_EMAIL) })
  const superAdminPlatformUser = platformSuperAdmin || await db.query.platformUsers.findFirst({ where: eq(platformUsers.email, PLATFORM_ADMIN_EMAIL) })
  if (!adminPlatformUser || !appPlatformUser || !superAdminPlatformUser) throw new Error('Could not create platform users')

  const mockHeaders = new Headers({ 'x-forwarded-proto': 'https', 'origin': process.env.BETTER_AUTH_URL || 'http://localhost:3000' })

  const createBetterAuthUser = async (email: string, name: string, password: string) => {
    try {
      await signUp({ email, password, name }, mockHeaders)
      console.log(`[Better Auth] Created user: ${email}`)
    } catch (e: any) {
      if (e.message?.includes('already')) {
        console.log(`[Better Auth] User already exists: ${email}`)
      } else {
        console.error(`[Better Auth] Failed to create ${email}:`, e.message)
      }
    }
  }

  await createBetterAuthUser(ADMIN_EMAIL, 'Administrador Navaja', 'admin123')
  await createBetterAuthUser(APP_EMAIL, 'Usuario App', 'app123')
  await createBetterAuthUser(PLATFORM_ADMIN_EMAIL, 'Super Administrador Plataforma', 'admin123')

  await db.insert(platformMemberships).values([
    { tenantId: tenant.id, userId: adminPlatformUser.id, role: 'owner', status: 'active' },
    { tenantId: tenant.id, userId: appPlatformUser.id, role: 'owner', status: 'active' },
  ]).onConflictDoNothing()

  await db.insert(platformMemberships).values([
    { userId: superAdminPlatformUser.id, role: 'platform_admin', status: 'active' },
  ]).onConflictDoNothing()

  const [branch] = await db
    .insert(branches)
    .values({ tenantId: tenant.id, code: 'ROMA-NORTE', name: 'Roma Norte', city: 'Ciudad de México', country: 'México', timezone: 'America/Bogota' })
    .onConflictDoUpdate({ target: branches.code, set: { name: 'Roma Norte', updatedAt: new Date() } })
    .returning()

  const [adminUser] = await db
    .insert(users)
    .values({ tenantId: tenant.id, platformUserId: adminPlatformUser.id, email: ADMIN_EMAIL, name: 'Administrador Navaja', status: 'active' })
    .onConflictDoUpdate({ target: users.email, set: { tenantId: tenant.id, platformUserId: adminPlatformUser.id, updatedAt: new Date() } })
    .returning()
  const [appUser] = await db
    .insert(users)
    .values({ tenantId: tenant.id, platformUserId: appPlatformUser.id, email: APP_EMAIL, name: 'Usuario App', status: 'active' })
    .onConflictDoUpdate({ target: users.email, set: { tenantId: tenant.id, platformUserId: appPlatformUser.id, updatedAt: new Date() } })
    .returning()

  const [adminRole] = await db.insert(roles).values({ tenantId: tenant.id, name: 'admin', description: 'Acceso administrativo completo', isSystem: true }).onConflictDoNothing({ target: roles.name }).returning()
  const [appRole] = await db.insert(roles).values({ tenantId: tenant.id, name: 'app', description: 'Acceso operativo a módulos permitidos', isSystem: true }).onConflictDoNothing({ target: roles.name }).returning()
  const storedAdminRole = adminRole || await db.query.roles.findFirst({ where: and(eq(roles.name, 'admin'), eq(roles.tenantId, tenant.id)) })
  const storedAppRole = appRole || await db.query.roles.findFirst({ where: and(eq(roles.name, 'app'), eq(roles.tenantId, tenant.id)) })
  if (!storedAdminRole || !storedAppRole) throw new Error('Could not create local roles')

  await db.insert(userRoles).values([
    { tenantId: tenant.id, userId: adminUser.id, roleId: storedAdminRole.id },
    { tenantId: tenant.id, userId: appUser.id, roleId: storedAppRole.id },
  ]).onConflictDoNothing()
  await db.insert(userBranches).values([
    { tenantId: tenant.id, userId: adminUser.id, branchId: branch.id },
    { tenantId: tenant.id, userId: appUser.id, branchId: branch.id },
  ]).onConflictDoNothing()

  const [appRoleRecord] = await db.select().from(roles).where(and(eq(roles.id, storedAppRole.id), eq(roles.tenantId, tenant.id))).limit(1)
  if (!appRoleRecord) throw new Error('App role is not available for demo tenant')

  const barberData = [
    { email: 'andres.morales@navaja.local', name: 'Andrés Morales', bio: 'Especialista en cortes clásicos y acabados a navaja.', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4lk-8daN6Rn8KlRk57b_NsFYlg2z8JUOb6CnEVBIxdxO4TrD-9mXwYYmrV0qWUTldz2iJ_3wkvAo2u4XfngLczZ5xmWDPZLxGFVWYKe903PPWumxCwdC63cVv7EvneYGNWjzrPV-Oy9fy0FPM_E-tQUnf7WGD2lq0FmD-vl_IOwLtsveaJ1idonJ9mq0_5MxEk6me5MXWaEz-AHYbf4fpeJ8NXwKfttrqEHvTmQZGwDHfrmOhSJDOA', commissionRate: '35' },
    { email: 'santiago.vega@navaja.local', name: 'Santiago Vega', bio: 'Barba tradicional, navaja libre y diseño de rostro.', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsR1rNUt830DBaYr8DsCGDIcbQpkRWBim_eoJrno2Z2jmxZixv-PRtwYiNgKPGmRbuCe4JUYe2X_o-e1v5pKW5uQ_dNcenGe7bZm9feE4_WpfVKV3MAl8D7BETxQbPL7LEHOnTU6XQNcKUGjN_Lpduov25ll-HiJ-Pd-XMxdH2fVWT0uhPNrJ799EGcNXY1foxmHEW7JzWLeU_1tKHSvoUHWVb7_a_LjZVJ7rZJzKNm4max0Hd5P1zQ', commissionRate: '32' },
    { email: 'mariana.reyes@navaja.local', name: 'Mariana Reyes', bio: 'Dirección creativa, textura y color natural.', avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6VO6MWMfkUaLihHzHKMss2xHJVvY7vGcGLRaJA4JIAfpqiNynmErYxaG3ECEumBir8Dgud_6ow9SRPo-Tqy2D28OLe-ZzvIksPkCVWOkb9GcpyjzD9O7r7qkVNIWTtgawMphUHwhWJoSN2UsqktXOs6kYabDnD5Drfw53ybeP3NtAu8ux9-9TDv535OexO3wiLphLYqR0tIvTEPrgXHsEuyQsfThDs0aLiA9dS4mcKVfLeMBdvPG8DQ', commissionRate: '30' },
  ]

  const barberUsers = []
  for (const barber of barberData) {
    const [platformBarber] = await db.insert(platformUsers).values({ email: barber.email, name: barber.name, passwordHash: 'seed-managed-by-auth', status: 'active' }).onConflictDoNothing({ target: platformUsers.email }).returning()
    const storedPlatformBarber = platformBarber || await db.query.platformUsers.findFirst({ where: eq(platformUsers.email, barber.email) })
    if (!storedPlatformBarber) throw new Error(`Could not create ${barber.email}`)
     await db.insert(platformMemberships).values({ tenantId: tenant.id, userId: storedPlatformBarber.id, role: 'barber', status: 'active' }).onConflictDoNothing()
    const [localBarber] = await db.insert(users).values({ tenantId: tenant.id, platformUserId: storedPlatformBarber.id, email: barber.email, name: barber.name, status: 'active' }).onConflictDoUpdate({ target: users.email, set: { tenantId: tenant.id, platformUserId: storedPlatformBarber.id, name: barber.name, updatedAt: new Date() } }).returning()
    const localUser = localBarber || await db.query.users.findFirst({ where: eq(users.email, barber.email) })
    if (!localUser) throw new Error(`Could not create local user ${barber.email}`)
    await db.insert(userRoles).values({ tenantId: tenant.id, userId: localUser.id, roleId: storedAppRole.id }).onConflictDoNothing()
    await db.insert(userBranches).values({ tenantId: tenant.id, userId: localUser.id, branchId: branch.id }).onConflictDoNothing()
    const existingStaff = await db.query.staffProfiles.findFirst({ where: and(eq(staffProfiles.tenantId, tenant.id), eq(staffProfiles.userId, localUser.id)) })
    const staff = existingStaff || (await db.insert(staffProfiles).values({ tenantId: tenant.id, userId: localUser.id, displayName: barber.name, bio: barber.bio, avatarUrl: barber.avatarUrl, commissionRate: barber.commissionRate, isBookable: true }).returning())[0]
    if (staff) barberUsers.push({ user: localUser, staff })
  }

  const [category] = await db.insert(serviceCategories).values({ tenantId: tenant.id, name: 'Rituales de barbería', description: 'Servicios de corte, barba y cuidado masculino.', displayOrder: 1 }).onConflictDoNothing().returning()
  const storedCategory = category || (await db.query.serviceCategories.findFirst({ where: and(eq(serviceCategories.tenantId, tenant.id), eq(serviceCategories.name, 'Rituales de barbería')) }))
  if (!storedCategory) throw new Error('Could not create service category')
  const serviceData = [
    { name: 'Corte Clásico Navaja', description: 'Corte a tijera, máquina y acabado artesanal a navaja.', durationMinutes: 45, priceBase: '450' },
    { name: 'Ritual de Barba Completo', description: 'Toalla caliente, aceites esenciales, afeitado y perfilado.', durationMinutes: 40, priceBase: '380' },
    { name: 'Experiencia Navaja Signature', description: 'Corte, barba, exfoliación facial y bebida de cortesía.', durationMinutes: 80, priceBase: '760' },
    { name: 'Cuidado Capilar & Matiz', description: 'Tratamiento revitalizante y matizado natural de canas.', durationMinutes: 35, priceBase: '390' },
  ]
  const seededServices = []
  for (const serviceDataItem of serviceData) {
    const existing = await db.query.services.findFirst({ where: and(eq(services.tenantId, tenant.id), eq(services.name, serviceDataItem.name)) })
    const service = existing || (await db.insert(services).values({ tenantId: tenant.id, categoryId: storedCategory.id, ...serviceDataItem, currency: 'COP', paymentPolicy: 'none', active: true }).returning())[0]
    if (service) {
      seededServices.push(service)
      await db.insert(branchServices).values({ tenantId: tenant.id, branchId: branch.id, serviceId: service.id, active: true }).onConflictDoNothing()
      for (const barber of barberUsers) await db.insert(staffServices).values({ tenantId: tenant.id, staffId: barber.staff.id, serviceId: service.id, active: true }).onConflictDoNothing()
    }
  }

  for (const barber of barberUsers) {
    for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
      await db.insert(staffSchedules).values({ tenantId: tenant.id, staffId: barber.staff.id, branchId: branch.id, dayOfWeek, startTime: dayOfWeek === 6 ? '10:00' : '09:00', endTime: dayOfWeek === 6 ? '19:00' : '20:00', validFrom: new Date('2025-01-01T00:00:00Z') }).onConflictDoNothing()
    }
  }

  const customerData = [
    { firstName: 'Jorge', lastName: 'Ramírez', fullName: 'Jorge Ramírez', email: 'jorge.ramirez@example.com', phone: '+52 55 1234 5678' },
    { firstName: 'Luis', lastName: 'Navarro', fullName: 'Luis Navarro', email: 'luis.navarro@example.com', phone: '+52 55 2345 6789' },
    { firstName: 'Mateo', lastName: 'Serrano', fullName: 'Mateo Serrano', email: 'mateo.serrano@example.com', phone: '+52 55 3456 7890' },
  ]
  const seededCustomers = []
  for (const customerDataItem of customerData) {
    const existing = await db.query.customers.findFirst({ where: and(eq(customers.tenantId, tenant.id), eq(customers.email, customerDataItem.email)) })
    const customer = existing || (await db.insert(customers).values({ tenantId: tenant.id, ...customerDataItem }).returning())[0]
    if (customer) seededCustomers.push(customer)
  }

  const now = new Date()
  if (seededServices.length && seededCustomers.length && barberUsers.length >= 2) {
    const appointmentData = [
      { email: seededCustomers[0].email, staffId: barberUsers[0].staff.id, service: seededServices[0], status: 'confirmed' as const, startsAt: new Date(now.getTime() + 1000 * 60 * 60 * 3) },
      { email: seededCustomers[1].email, staffId: barberUsers[1].staff.id, service: seededServices[1], status: 'pending' as const, startsAt: new Date(now.getTime() + 1000 * 60 * 60 * 26) },
    ]
    for (const appointmentDataItem of appointmentData) {
      const customer = seededCustomers.find(item => item.email === appointmentDataItem.email)
      const existing = customer ? await db.query.appointments.findFirst({ where: and(eq(appointments.tenantId, tenant.id), eq(appointments.customerId, customer.id), eq(appointments.staffId, appointmentDataItem.staffId), eq(appointments.status, appointmentDataItem.status)) }) : undefined
      if (!existing && customer) await db.insert(appointments).values({ tenantId: tenant.id, branchId: branch.id, customerId: customer.id, staffId: appointmentDataItem.staffId, serviceId: appointmentDataItem.service.id, startsAt: appointmentDataItem.startsAt, endsAt: new Date(appointmentDataItem.startsAt.getTime() + appointmentDataItem.service.durationMinutes * 60000), serviceNameSnapshot: appointmentDataItem.service.name, serviceDurationSnapshot: appointmentDataItem.service.durationMinutes, priceSnapshot: appointmentDataItem.service.priceBase, currencySnapshot: 'COP', status: appointmentDataItem.status, source: 'seed_demo' })
    }
  }

  const productData = [
    { name: 'Pomada mate premium', sku: 'POM-MATE-100', category: 'Styling', unitCost: '145', suggestedPrice: '280', minQuantity: 8, quantity: '24' },
    { name: 'Aceite para barba de cedro', sku: 'BAR-CEDRO-30', category: 'Barba', unitCost: '180', suggestedPrice: '340', minQuantity: 6, quantity: '15' },
    { name: 'Navajas profesionales', sku: 'NAV-ACERO-10', category: 'Consumibles', unitCost: '95', suggestedPrice: '160', minQuantity: 20, quantity: '65' },
  ]
  for (const productDataItem of productData) {
    const existing = await db.query.products.findFirst({ where: and(eq(products.tenantId, tenant.id), eq(products.sku, productDataItem.sku)) })
    const product = existing || (await db.insert(products).values({ tenantId: tenant.id, name: productDataItem.name, sku: productDataItem.sku, category: productDataItem.category, unitCost: productDataItem.unitCost, suggestedPrice: productDataItem.suggestedPrice, minQuantity: productDataItem.minQuantity, active: true }).returning())[0]
    if (product) {
      const existingStock = await db.query.branchInventory.findFirst({ where: and(eq(branchInventory.tenantId, tenant.id), eq(branchInventory.branchId, branch.id), eq(branchInventory.productId, product.id)) })
      if (!existingStock) {
        await db.insert(branchInventory).values({ tenantId: tenant.id, branchId: branch.id, productId: product.id, quantity: productDataItem.quantity, averageCost: productDataItem.unitCost })
        await db.insert(inventoryMovements).values({ tenantId: tenant.id, productId: product.id, branchId: branch.id, type: 'purchase', quantity: productDataItem.quantity, unitCost: productDataItem.unitCost, reference: 'SEED-OPENING-STOCK', notes: 'Inventario inicial de demostración' })
      }
    }
  }

  const existingRegister = await db.query.cashRegisters.findFirst({ where: and(eq(cashRegisters.tenantId, tenant.id), eq(cashRegisters.branchId, branch.id), eq(cashRegisters.name, 'Caja principal')) })
  const register = existingRegister || (await db.insert(cashRegisters).values({ tenantId: tenant.id, branchId: branch.id, name: 'Caja principal', status: 'active', initialBalance: '2500' }).returning())[0]
  if (register && adminUser) {
    const existingCash = await db.query.cashSessions.findFirst({ where: and(eq(cashSessions.tenantId, tenant.id), eq(cashSessions.cashRegisterId, register.id), eq(cashSessions.isOpen, true)) })
    const cashSession = existingCash || (await db.insert(cashSessions).values({ tenantId: tenant.id, cashRegisterId: register.id, userId: adminUser.id, initialBalance: '2500', currency: 'COP', isOpen: true }).returning())[0]
    if (cashSession) {
      const existingTransaction = await db.query.cashTransactions.findFirst({ where: and(eq(cashTransactions.tenantId, tenant.id), eq(cashTransactions.sessionId, cashSession.id), eq(cashTransactions.reference, 'SEED-DEMO-SALE')) })
      if (!existingTransaction) await db.insert(cashTransactions).values({ tenantId: tenant.id, sessionId: cashSession.id, type: 'sale', method: 'cash', amount: '450', currency: 'COP', reference: 'SEED-DEMO-SALE', notes: 'Corte clásico de demostración', actorId: adminUser.id })
    }
  }

  console.log(JSON.stringify({ tenantId: tenant.id, tenantSlug: tenant.slug, branchId: branch.id, users: [{ email: ADMIN_EMAIL, role: 'admin' }, { email: APP_EMAIL, role: 'app' }] }, null, 2))
}

seed().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
