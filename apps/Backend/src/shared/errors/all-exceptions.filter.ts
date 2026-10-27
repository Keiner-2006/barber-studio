import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppError } from './app-error';
import { ZodError } from 'zod';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  requestId: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.headers['x-request-id'] as string || this.generateRequestId();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: ApiErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      requestId,
    };

    if (exception instanceof AppError) {
      status = exception.statusCode;
      errorResponse = {
        error: {
          code: exception.code,
          message: exception.message,
          details: exception.details,
        },
        requestId,
      };
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      errorResponse = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: exception.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
          })),
        },
        requestId,
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        errorResponse = {
          error: {
            code: 'VALIDATION_ERROR',
            message: Array.isArray(res.message) ? res.message.join(', ') : String(res.message),
            details: res,
          },
          requestId,
        };
      } else {
        errorResponse = {
          error: {
            code: 'HTTP_ERROR',
            message: exception.message,
          },
          requestId,
        };
      }
    } else if (exception instanceof Error) {
      this.logger.error(`${requestId}: ${exception.message}`, exception.stack);
      errorResponse = {
        error: {
          code: 'INTERNAL_ERROR',
          message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : exception.message,
        },
        requestId,
      };
    }

    response.setHeader('X-Request-ID', requestId);
    response.status(status).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}