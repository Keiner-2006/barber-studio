import { Injectable, Inject } from '@nestjs/common';
import { BETTER_AUTH } from './better-auth.module';
import type { BetterAuthInstance } from './better-auth.module';

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export interface SessionResult {
  user: any;
  session: {
    token: string;
    expiresAt: string;
  };
  redirect?: string;
}

@Injectable()
export class AuthService {
  constructor(@Inject(BETTER_AUTH) private readonly auth: BetterAuthInstance | null) {}

  private getAuth(): BetterAuthInstance {
    if (!this.auth) {
      throw new Error('BetterAuth not initialized (demo mode)');
    }
    return this.auth;
  }

  async getSession(headers: Headers): Promise<{ user: any; session: any } | null> {
    if (!this.auth) {
      const authHeader = headers.get('authorization');
      if (authHeader === `Bearer navaja-demo-session`) {
        return {
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@navaja.local',
            name: 'Administrador Navaja',
            role: 'admin',
          },
          session: {
            token: 'navaja-demo-session',
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
          },
        };
      }
      return null;
    }

    return this.auth.api.getSession({ headers });
  }

  async signIn(credentials: Credentials, headers: Headers): Promise<SessionResult> {
    if (!this.auth) {
      return {
        user: {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@navaja.local',
          name: 'Administrador Navaja',
          role: 'admin',
        },
        session: {
          token: 'navaja-demo-session',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
        redirect: '/dashboard',
      };
    }

    const result = await this.auth.api.signInEmail({
      body: credentials,
      headers,
    });

    return {
      user: result.user,
      session: {
        token: result.token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      redirect: result.redirect ? '/dashboard' : undefined,
    };
  }

  async signUp(registration: Registration, headers: Headers): Promise<SessionResult> {
    if (!this.auth) {
      return {
        user: {
          id: '00000000-0000-0000-0000-000000000002',
          email: registration.email,
          name: registration.name,
          role: 'owner',
        },
        session: {
          token: 'navaja-demo-session',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
      };
    }

    const result = await this.auth.api.signUpEmail({
      body: registration,
      headers,
    });

    return {
      user: result.user,
      session: {
        token: result.token || '',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      redirect: '/dashboard',
    };
  }

  async signOut(headers: Headers): Promise<void> {
    if (!this.auth) return;
    await this.auth.api.signOut({ headers });
  }

}