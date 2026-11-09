export function getDatabaseTarget(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: url.port || '5432',
      database: decodeURIComponent(url.pathname.slice(1)) || '(default)',
    };
  } catch {
    return {
      host: '(unparseable URL)',
      port: '(unknown)',
      database: '(unknown)',
    };
  }
}

function getErrorField(error: object, key: string): unknown {
  return key in error ? (error as Record<string, unknown>)[key] : undefined;
}

function sanitizeErrorMessage(message: string): string {
  return message
    .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, '[database URL redacted]')
    .replace(/(password|pass|pwd)=([^&\s]+)/gi, '$1=[redacted]');
}

export function getDatabaseErrorDetails(error: unknown) {
  const causes: Array<{ name: string; code?: string; message: string }> = [];
  let current: unknown = error;

  while (current && typeof current === 'object' && causes.length < 3) {
    const name = getErrorField(current, 'name');
    const code = getErrorField(current, 'code');
    const message = getErrorField(current, 'message');

    causes.push({
      name: typeof name === 'string' ? name : 'Error',
      ...(typeof code === 'string' ? { code } : {}),
      message: sanitizeErrorMessage(typeof message === 'string' ? message : 'No error message provided'),
    });

    current = getErrorField(current, 'cause');
  }

  if (causes.length === 0) {
    causes.push({
      name: 'Error',
      message: sanitizeErrorMessage(String(error)),
    });
  }

  return causes;
}

export function getDatabaseUrlSource(type: 'platform' | 'auth'): string {
  const candidates =
    type === 'platform'
      ? ['DATABASE_INTERNAL_URL', 'PLATFORM_DATABASE_URL', 'DATABASE_URL']
      : ['DATABASE_INTERNAL_URL', 'AUTH_DATABASE_URL', 'PLATFORM_DATABASE_URL', 'DATABASE_URL'];

  return candidates.find((key) => process.env[key]?.trim()) ?? '(none)';
}
