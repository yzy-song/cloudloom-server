/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 14:10:54
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 动态CORS配置（自动适配开发/生产环境）
  app.enableCors({
    origin: configService.get('CORS_ORIGINS').split(','), // 从环境变量读取
    credentials: true,
    crossOriginOpenerPolicy: {
      policy: 'same-origin', // 或 'same-origin-allow-popups'（允许弹出窗口）
    },
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 只对 webhook 路由使用 raw body
  app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
