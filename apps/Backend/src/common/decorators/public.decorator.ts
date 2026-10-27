import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const PUBLIC_ROUTE_KEY = 'publicRoute';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);