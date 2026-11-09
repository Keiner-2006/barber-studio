import { SetMetadata } from '@nestjs/common';

export const RAW_RESPONSE_KEY = 'rawResponse';

/**
 * Skips the global ResponseInterceptor envelope so the handler can return
 * a flat payload (e.g. { user, session }) instead of { data, meta }.
 */
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);