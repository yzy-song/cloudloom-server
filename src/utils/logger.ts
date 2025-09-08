import { LoggerService, Injectable, Scope } from '@nestjs/common';
import { createLogger, format, transports, Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file'; // 添加此行导入

import { type TransformableInfo } from 'logform';
const { combine, timestamp, json, errors, colorize, printf } = format;

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerService {
  private logger: Logger;
  private context?: string;

  constructor() {
    // 为控制台输出自定义格式
    const consoleFormat = combine(
      colorize(), // 关键：添加颜色
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      // 自定义打印格式
      printf((info: TransformableInfo) => {
        const { timestamp, level, message, context, trace } = info;

        // 2. 对每个变量进行类型安全的处理
        const messageStr = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
        const contextStr = context ? `[${String(context)}]` : '';
        const traceStr = trace ? `\n${String(trace)}` : '';
        const ts = String(timestamp).slice(0, 19).replace('T', ' ');

        return `${ts} ${level}: ${contextStr} ${messageStr}${traceStr}`;
      })
    );
    // 为文件输出保持 JSON 格式
    const fileFormat = combine(timestamp(), errors({ stack: true }), json());

    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      defaultMeta: { service: 'cloudloom' },
      transports: [
        // 👇 --- 核心修改在这里 --- 👇
        new transports.Console({
          format: consoleFormat, // 对控制台使用新的自定义格式
        }),
        new DailyRotateFile({
          format: fileFormat, // 对文件使用旧的 JSON 格式
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '100m',
          maxFiles: '30d',
          zippedArchive: true,
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
