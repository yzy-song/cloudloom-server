/*
 * @Author: yzy
 * @Date: 2025-08-23 10:27:56
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-23 10:29:20
 */
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { AppLogger } from '../utils/logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger();

  constructor() {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : 500;

    // 类型守卫：确保 exception 是 Error 类型
    const message = exception instanceof Error ? exception.toString() : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(`Exception: ${message}`, stack, {
      path: request.url,
      method: request.method,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
