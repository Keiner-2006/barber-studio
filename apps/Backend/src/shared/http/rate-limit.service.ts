import { Injectable } from '@nestjs/common';
import { LRUCache } from 'lru-cache';

@Injectable()
export class RateLimitService {
  private readonly loginAttempts = new LRUCache<string, number>({
    max: 1000,
    ttl: 1000 * 60 * 15, // 15 minutes
  });

  checkLoginRateLimit(key: string): boolean {
    const attempts = this.loginAttempts.get(key) || 0;
    if (attempts >= 5) {
      return false;
    }
    this.loginAttempts.set(key, attempts + 1);
    return true;
  }

  resetLoginAttempts(key: string): void {
    this.loginAttempts.delete(key);
  }
}