/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-29 07:19:36
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import { AppLogger } from './utils/logger';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // 1. 完全禁用 NestJS 内置的日志，由我们自己的 Winston Logger 全权接管
    logger: false,
    abortOnError: false,
  });
  app.use(helmet());
  const configService = app.get(ConfigService);
  // 动态CORS配置（自动适配开发/生产环境）
  app.enableCors({
    origin: configService.get('CORS_ORIGINS').split(','), // 从环境变量读取
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // 显式声明
    credentials: true,
  });

  const logger = await app.resolve(AppLogger);
  app.useLogger(logger);

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 只对 webhook 路由使用 raw body
  app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));

  const port = configService.get('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
