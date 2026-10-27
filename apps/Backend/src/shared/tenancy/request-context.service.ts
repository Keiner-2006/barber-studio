import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

export interface RequestContext {
  tenantId: string;
  userId: string;
  userRole: string;
  staffId?: string;
  databaseUrl: string;
  branchId?: string;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContext>();

  setContext(ctx: RequestContext): void {
    this.storage.enterWith(ctx);
  }

  runWithContext<T>(ctx: RequestContext, callback: () => T): T {
    return this.storage.run(ctx, callback);
  }

  getContext(): RequestContext {
    const context = this.storage.getStore();
    if (!context) {
      throw new Error('No request context available');
    }
    return context;
  }

  getTenantId(): string {
    return this.getContext().tenantId;
  }

  getUserId(): string {
    return this.getContext().userId;
  }

  getUserRole(): string {
    return this.getContext().userRole;
  }

  getStaffId(): string | undefined {
    return this.getContext().staffId;
  }

  getDatabaseUrl(): string {
    return this.getContext().databaseUrl;
  }

  getRequestId(): string {
    return this.getContext().requestId;
  }

  clearContext(): void {
    // AsyncLocalStorage clears the context when the request callback completes
  }
}

export const REQUEST_CONTEXT_SERVICE = Symbol('REQUEST_CONTEXT_SERVICE');