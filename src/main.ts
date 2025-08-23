import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 动态CORS配置（自动适配开发/生产环境）
  app.enableCors({
    origin: configService.get('CORS_ORIGINS').split(','), // 从环境变量读取
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  // 设置全局前缀
  app.setGlobalPrefix('api');

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
}
bootstrap();
