/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 03:02:05
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { resolve } from 'path'; // 导入 path 模块的 resolve 方法

// 确保在 NestFactory.create 之前加载环境变量
// process.cwd() 在 PM2 的 cwd 配置下是 /var/www/cloudloom-server
dotenv.config({ path: resolve(process.cwd(), '.env') });
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 动态CORS配置（自动适配开发/生产环境）
  app.enableCors({
    // origin: configService.get('CORS_ORIGINS').split(','), // 从环境变量读取
    origin: (process.env.CORS_ORIGINS ?? '').split(',').filter(origin => origin),
    credentials: true,
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  // 只对 webhook 路由使用 raw body
  app.use('/payments/webhook', bodyParser.raw({ type: 'application/json' }));

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
