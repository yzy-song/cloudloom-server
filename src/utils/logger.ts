import { LoggerService, Injectable, Scope } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; // 添加此行导入

const { combine, timestamp, json, errors } = format;

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private logger: Logger;
  private context?: string;

  constructor() {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(timestamp(), errors({ stack: true }), json()),
      defaultMeta: { service: 'cloudloom' },
      transports: [
        new transports.Console({
          format: combine(timestamp(), format.prettyPrint()),
        }),
        new DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          zippedArchive: true, // 压缩旧日志
        }),
      ],
    });
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, meta?: any) {
    this.logger.info(message, { context: this.context, ...meta });
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { context: this.context, trace, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, { context: this.context, ...meta });
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, { context: this.context, ...meta });
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, { context: this.context, ...meta });
  }
}
