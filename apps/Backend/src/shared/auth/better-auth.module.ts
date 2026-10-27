import { Module, Global, Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export const BETTER_AUTH = Symbol('BETTER_AUTH');
export const BETTER_AUTH_POOL = Symbol('BETTER_AUTH_POOL');
export type BetterAuthInstance = ReturnType<
  typeof import('better-auth', { with: { 'resolution-mode': 'import' } }).betterAuth
>;

@Injectable()
class BetterAuthPoolLifecycle implements OnModuleDestroy {
  constructor(@Inject(BETTER_AUTH_POOL) private readonly pool: Pool | null) {}

  async onModuleDestroy() {
    await this.pool?.end();
  }
}

@Global()
@Module({
  providers: [
    {
      provide: BETTER_AUTH_POOL,
      useFactory: (configService: ConfigService) => {
        const config = configService.get<Record<string, any>>('auth');
        if (config?.demoEnabled) return null;
        if (!config?.databaseUrl) throw new Error('DATABASE_URL or AUTH_DATABASE_URL must be configured');
        return new Pool({
          connectionString: config.databaseUrl,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });
      },
      inject: [ConfigService],
    },
    {
      provide: BETTER_AUTH,
      useFactory: async (configService: ConfigService, pool: Pool | null) => {
        const config = configService.get<Record<string, any>>('auth');
        if (config?.demoEnabled) return null;
        if (!config?.secret || !config?.url) {
          throw new Error('BETTER_AUTH_SECRET and BETTER_AUTH_URL must be configured');
        }

        const [{ betterAuth }, { bearer }, { google }] = await Promise.all([
          import('better-auth'),
          import('better-auth/plugins'),
          import('better-auth/social-providers'),
        ]);

        return betterAuth({
          database: pool!,
          emailAndPassword: { enabled: true },
          baseURL: config.url,
          trustedOrigins: [
            ...config.trustedOrigins,
            ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:4200'] : []),
          ],
          secret: config.secret,
          session: config.session,
          advanced: {
            defaultCookieAttributes: {
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            },
            generateShortSessionToken: true,
          },
          plugins: [
            bearer(),
            ...(config.google.clientId && config.google.clientSecret
              ? [google({ clientId: config.google.clientId, clientSecret: config.google.clientSecret })]
              : []),
          ],
        });
      },
      inject: [ConfigService, BETTER_AUTH_POOL],
    },
    BetterAuthPoolLifecycle,
  ],
  exports: [BETTER_AUTH],
})
export class BetterAuthModule {}