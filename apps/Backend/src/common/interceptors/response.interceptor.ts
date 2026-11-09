import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { Reflector } from '@nestjs/core';
import { RAW_RESPONSE_KEY } from '../decorators/raw-response.decorator';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T> | any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const requestId = request.headers['x-request-id'] as string;

    const raw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (raw) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        const result: ApiResponse<T> = {
          data,
          meta: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
        return result;
      }),
    );
  }
}