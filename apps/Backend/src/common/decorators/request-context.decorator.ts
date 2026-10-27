import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestContext as RequestContextType } from '../../shared/tenancy/request-context.service';

export const RequestContext = createParamDecorator(
  (data: keyof RequestContextType | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const context = request.context as RequestContextType;
    return data ? context?.[data] : context;
  },
);