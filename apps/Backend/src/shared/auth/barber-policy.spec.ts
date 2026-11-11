import 'reflect-metadata';
import { describe, it, expect, jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { AppointmentsController } from '../../modules/appointments/adapters/http/appointments.controller';
import { CashController } from '../../modules/cash/adapters/http/cash.controller';
import { ReportsController } from '../../modules/reports/adapters/http/reports.controller';
import { InventoryController } from '../../modules/inventory/adapters/http/inventory.controller';
import { PurchasingController } from '../../modules/purchasing/adapters/http/purchasing.controller';
import { StaffController, AvailabilityController } from '../../modules/branches/adapters/http/staff.controller';
import { CustomersController } from '../../modules/customers/adapters/http/customers.controller';
import { TenantContextService } from '../tenancy/tenant-context.service';
import { ownStaffId, assertBarberAppointmentUpdate } from './barber-policy';
import { permissionsForRole } from './access-policy';

const staff = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
const other = 'dddddddd-dddd-dddd-dddd-dddddddddddd';
function canUse(controller: any, handler: string, role = 'barber') {
  return new PermissionsGuard(new Reflector()).canActivate({
    getHandler: () => controller.prototype[handler], getClass: () => controller,
    switchToHttp: () => ({ getRequest: () => ({ context: { userRole: role } }) }),
  } as ExecutionContext);
}

describe('Barber authorization', () => {
  it('denies every cash endpoint and appointment payment access, including direct API calls', () => {
    const handlers = Object.getOwnPropertyNames(CashController.prototype).filter(k => k !== 'constructor');
    expect(handlers.length).toBeGreaterThan(0);
    for (const handler of handlers) expect(() => canUse(CashController, handler)).toThrow('Permiso denegado');
    for (const handler of ['getPayments', 'recordPayment']) {
      expect(() => canUse(AppointmentsController, handler)).toThrow('Permiso denegado');
      expect(canUse(AppointmentsController, handler, 'owner')).toBe(true);
    }
    expect(canUse(AppointmentsController, 'list')).toBe(true);
    expect(permissionsForRole('barber')).not.toContain('cash:read');
  });
  it('blocks financial reports, inventory, purchasing and staff administration', () => {
    for (const controller of [ReportsController, InventoryController, PurchasingController]) {
      const handlers = Object.getOwnPropertyNames(controller.prototype).filter(k =>
        k !== 'constructor' && Reflect.hasMetadata('path', (controller.prototype as any)[k]));
      expect(handlers.length).toBeGreaterThan(0);
      for (const handler of handlers) expect(() => canUse(controller, handler)).toThrow('Permiso denegado');
    }
    for (const handler of ['list', 'create', 'update', 'archive']) {
      expect(() => canUse(StaffController, handler)).toThrow('Permiso denegado');
    }
    expect(() => canUse(CustomersController, 'create')).toThrow('Permiso denegado');
  });
  it('denies routes without an explicit permission for a barber', () => {
    class UndeclaredController { route() {} }
    expect(() => canUse(UndeclaredController, 'route')).toThrow('Permiso denegado');
  });
  it('blocks other staff schedules and availability before querying the database', async () => {
    const query = jest.fn<any>();
    const controller = new StaffController({ query } as any);
    await expect(controller.schedule('tenant', other, 'barber', staff)).rejects.toThrow();
    const availability = new AvailabilityController({ query } as any);
    await expect(availability.getAvailability('tenant', other, '2026-11-11T08:00:00Z', '2026-11-11T18:00:00Z', 'barber', staff)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
  it('locks and verifies appointment ownership before changing a service', async () => {
    const query = jest.fn<any>().mockResolvedValue([]);
    const transaction = (fn: any) => fn({ query });
    const controller = new AppointmentsController({} as any, {} as any, { transaction } as any);
    await expect(controller.updateAppointment('tenant', 'appointment', { status: 'completed' }, 'barber', staff)).rejects.toThrow('Cita no encontrada');
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('AND staff_id = $3 FOR UPDATE'), ['tenant', 'appointment', staff]);
    query.mockReset().mockResolvedValueOnce([{ staffId: staff, status: 'in_service' }]).mockResolvedValueOnce([{ id: 'appointment', status: 'completed' }]);
    await expect(controller.updateAppointment('tenant', 'appointment', { status: 'completed' }, 'barber', staff)).resolves.toEqual({ id: 'appointment', status: 'completed' });
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('AND staff_id = $3'), ['tenant', 'appointment', staff, 'completed', null]);
  });
  it('rejects a forged staff filter and a missing profile', () => {
    expect(ownStaffId('barber', staff)).toBe(staff);
    expect(() => ownStaffId('barber', staff, other)).toThrow();
    expect(() => ownStaffId('barber')).toThrow();
    expect(ownStaffId('owner', staff, other)).toBe(other);
  });
  it('forces appointment lists to the authenticated staff profile', async () => {
    const execute = jest.fn<any>().mockResolvedValue([]);
    const controller = new AppointmentsController({ execute } as any, {} as any, {} as any);
    await controller.list('tenant', undefined, undefined, undefined, undefined, undefined, undefined, 'barber', staff);
    expect(execute).toHaveBeenCalledWith('tenant', expect.objectContaining({ staffId: staff }));
    await expect(controller.list('tenant', undefined, undefined, other, undefined, undefined, undefined, 'barber', staff)).rejects.toThrow();
  });
  it('only allows progress on assigned appointments and rejects changes to completed services', () => {
    expect(() => assertBarberAppointmentUpdate(staff, { staffId: staff, status: 'checked_in' }, { status: 'in_service' })).not.toThrow();
    expect(() => assertBarberAppointmentUpdate(staff, { staffId: staff, status: 'in_service' }, { status: 'completed' })).not.toThrow();
    for (const patch of [{ staffId: other }, { startsAt: '2026-11-11' }, { endsAt: '2026-11-11' }, { status: 'cancelled' }, { status: 'no_show' }, { status: 'completed' }]) {
      expect(() => assertBarberAppointmentUpdate(staff, { staffId: staff, status: 'checked_in' }, patch)).toThrow();
    }
    expect(() => assertBarberAppointmentUpdate(staff, { staffId: other, status: 'checked_in' }, { notes: 'x' })).toThrow('Cita no encontrada');
    expect(() => assertBarberAppointmentUpdate(staff, { staffId: staff, status: 'completed' }, { status: 'in_service' })).toThrow();
  });
  it('scopes customer reads in SQL and exposes only basic names', async () => {
    const query = jest.fn<any>().mockResolvedValue([{ id: 'customer', fullName: 'Cliente' }]);
    const controller = new CustomersController({ query } as any, {} as any, {} as any, {} as any, {} as any);
    await controller.list('tenant', 'Cliente', 'barber', staff);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(params).toEqual(['tenant', staff, 'Cliente', null]);
    expect(sql).toContain('a.tenant_id = c.tenant_id');
    expect(sql).toContain('a.staff_id = $2');
    expect(sql).not.toMatch(/total_spent|document|consents|email|phone/);
    query.mockResolvedValue([]);
    await expect(controller.getById('tenant', 'unassigned', 'barber', staff)).rejects.toThrow('Cliente no encontrado');
  });
  it('rejects another tenant and does not reuse a company identity for a customer flow', async () => {
    const userRepo = { findOne: jest.fn<any>().mockResolvedValue({ id: 'platform-user', status: 'active' }) };
    const membershipRepo = { find: jest.fn<any>().mockResolvedValue([
      { tenantId: 'own-tenant', role: 'barber', tenant: { id: 'own-tenant', status: 'active' } },
    ]) };
    const getRepository = jest.fn<any>().mockReturnValueOnce(userRepo).mockReturnValueOnce(membershipRepo);
    const query = jest.fn<any>().mockResolvedValue([{ id: 'local-user' }]);
    const service = new TenantContextService({ query } as any, { getRepository } as any, {} as any,
      { validateRoleForFlow: (role: string, flow: string) => role === 'barber' && flow === 'company_member' } as any, {} as any);
    service.invalidateIdentityCache();
    const session = { user: { id: 'auth', email: 'barber@example.com' }, session: { token: 'tenant-test-token', expiresAt: '' } };
    await expect(service.resolveIdentity({}, session, 'another-tenant', 'company_member')).resolves.toBeNull();
    expect(query).not.toHaveBeenCalled();
    await expect(service.resolveIdentity({}, session, 'own-tenant', 'company_member')).resolves.toMatchObject({ tenantId: 'own-tenant', localUserId: 'local-user', userRole: 'barber' });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('tenant_id = $1'), ['own-tenant', 'barber@example.com']);
    await expect(service.resolveIdentity({}, session, 'own-tenant', 'customer')).resolves.toBeNull();
    service.invalidateIdentityCache();
  });
  it('resolves a tenant-local profile, never an auth id supplied by a session', async () => {
    const query = jest.fn<any>().mockResolvedValue([{ id: staff }]);
    const repository = { getRepository: () => ({}) };
    const service = new TenantContextService({ ...repository, query } as any, repository as any, {} as any, {} as any, {} as any);
    const identity = { tenantId: 'tenant', userRole: 'barber', localUserId: 'local-user', databaseUrl: '', isPlatformAdmin: false } as any;
    const context = await service.buildContext({}, identity, 'better-auth-user');
    expect(context.userId).toBe('local-user');
    expect(context.staffId).toBe(staff);
    expect(query).toHaveBeenCalledWith(expect.stringContaining("status = 'active'"), ['tenant', 'local-user']);
    query.mockResolvedValue([]);
    await expect(service.buildContext({}, identity, 'auth')).rejects.toThrow();
    query.mockResolvedValue([{ id: staff }, { id: other }]);
    await expect(service.buildContext({}, identity, 'auth')).rejects.toThrow();
  });
});
