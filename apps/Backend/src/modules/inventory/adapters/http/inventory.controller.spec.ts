import { describe, it, expect, jest } from '@jest/globals';
import { InventoryController } from './inventory.controller';

describe('Inventory stock isolation', () => {
  it('limits stock to the current tenant and the requested branch', async () => {
    const query = jest.fn<any>().mockResolvedValue([]);
    const controller = new InventoryController({ query } as any, {} as any, {} as any, {} as any);
    const branch = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    await controller.getStock('tenant-a', branch);
    const [sql, values] = query.mock.calls[0] as [string, unknown[]];
    expect(values).toEqual(['tenant-a', branch]);
    expect(sql).toContain('WHERE i.tenant_id = $1');
    expect(sql).toContain('p.tenant_id = i.tenant_id');
    expect(sql).toContain('b.tenant_id = i.tenant_id');
  });
  it('supports all branches in the tenant and rejects invalid branch identifiers', async () => {
    const query = jest.fn<any>().mockResolvedValue([]);
    const controller = new InventoryController({ query } as any, {} as any, {} as any, {} as any);
    await controller.getStock('tenant-a');
    expect(query).toHaveBeenCalledWith(expect.any(String), ['tenant-a', null]);
    query.mockClear();
    await expect(controller.getStock('tenant-a', 'invalid-branch')).rejects.toThrow('branchId inválido');
    expect(query).not.toHaveBeenCalled();
  });
});
